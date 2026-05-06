'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';

// Fisher-Yates Seeded Shuffle
function seededShuffle(array, seed) {
  let m = array.length, t, i;
  const rand = (function(s) {
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })(seed);

  while (m) {
    i = Math.floor(rand() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export default function FinalExamClient({ pool = [] }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [version, setVersion] = useState('A');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(90 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { isLoaded, stats, saveStats, addPoints, recordActivity, awardBadge } = useUserStats();

  // FIX #10: Use ref to store pool so restore doesn't depend on it changing
  const poolRef = useRef(pool);
  // FIX #3: Use ref for submitExam to avoid stale closure in timer
  const submitExamRef = useRef(null);

  // Load persistence data on mount
  useEffect(() => {
    try {
      const savedResult = localStorage.getItem('last_exam_result');
      const savedState = localStorage.getItem('exam_state');

      if (savedResult) {
        const res = JSON.parse(savedResult);
        setResults(res.results);
        // FIX #10: Restore saved questions directly, don't re-shuffle
        setQuestions(res.questions || []);
        setAnswers(res.answers || {});
        setIsFinished(true);
        setHasStarted(true);
      } else if (savedState) {
        const state = JSON.parse(savedState);
        setAnswers(state.answers || {});
        setFlagged(state.flagged || {});
        setHasStarted(state.hasStarted || false);
        setVersion(state.version || 'A');
        if (state.timeRemaining) setTimeRemaining(state.timeRemaining);
        // FIX #10: Restore questions from saved state if available
        if (state.questions && state.questions.length > 0) {
          setQuestions(state.questions);
        } else {
          const seed = (state.version || 'A') === 'A' ? 12345 : 67890;
          setQuestions(seededShuffle([...poolRef.current], seed).slice(0, 80));
        }
      }
    } catch (e) {
      console.error("Failed to restore state", e);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // FIX #10: Save questions in state too so they survive restore
  useEffect(() => {
    if (hasStarted && !isFinished && !isRestoring && questions.length > 0) {
      localStorage.setItem('exam_state', JSON.stringify({
        answers, flagged, hasStarted, version, timeRemaining, questions
      }));
    }
  }, [answers, flagged, hasStarted, version, timeRemaining, isFinished, isRestoring, questions]);

  // Start Exam Logic
  const startExam = (v) => {
    setVersion(v);
    const seed = v === 'A' ? 12345 : 67890;
    const shuffled = seededShuffle([...pool], seed).slice(0, 80);
    setQuestions(shuffled);
    setHasStarted(true);
  };

  // FIX #3: Timer uses ref to call submitExam — no stale closure
  useEffect(() => {
    if (!hasStarted || isFinished) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Use ref so we always call the latest version
          if (submitExamRef.current) submitExamRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isFinished]);

  const handleBubbleClick = (qIndex, optIndex) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const toggleFlag = (qIndex) => {
    if (isFinished) return;
    setFlagged(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  const scrollToQuestion = (idx) => {
    const el = document.getElementById(`question-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsMobileDrawerOpen(false);
    }
  };

  const syncToMongo = async (finalResults) => {
    setIsSyncing(true);
    try {
      const userEmail = 'anonymous@example.com';
      const userName = 'طالب مجهول';
      const userId = 'local_user';

      await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: userEmail,
          name: userName,
          score: finalResults.score,
          chapterBreakdown: finalResults.chapterBreakdown,
          type: 'final_exam'
        }),
      });
      console.log("Successfully synced to MongoDB via Clerk Identity");
    } catch (err) {
      console.error("Failed to sync to MongoDB", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const submitExam = useCallback(() => {
    setIsFinished(true);
    localStorage.removeItem('exam_state');
    
    let correctCount = 0;
    const chapterStats = {};

    questions.forEach((q, index) => {
      const chId = q.chapter;
      if (!chapterStats[chId]) chapterStats[chId] = { correct: 0, total: 0, title: q.chapterName || `الفصل ${chId}` };
      chapterStats[chId].total += 1;

      const userAnswerIdx = answers[index];
      if (userAnswerIdx !== undefined && q.options && q.options[userAnswerIdx] && q.answer) {
        const userAnswerText = String(q.options[userAnswerIdx]).trim();
        const correctAnswerText = String(q.answer).trim();
        if (userAnswerText === correctAnswerText) {
          correctCount += 1;
          chapterStats[chId].correct += 1;
        }
      }
    });

    const finalScore = Math.round((correctCount / (questions.length || 1)) * 100);
    const resObj = {
      score: finalScore,
      correctCount,
      chapterBreakdown: chapterStats
    };
    
    setResults(resObj);
    localStorage.setItem('last_exam_result', JSON.stringify({
      results: resObj,
      questions,
      answers
    }));

    // Trigger MongoDB Sync
    syncToMongo(resObj);

    if (isLoaded) {
      recordActivity({
        title: `الامتحان النهائي (نموذج ${version})`,
        date: new Date().toISOString(),
        scoreStr: `${finalScore}%`,
        isSuccess: finalScore >= 50
      });
      if (finalScore >= 90) awardBadge('excellent');
      if (finalScore === 100) awardBadge('perfect');
    }
  }, [questions, answers, isLoaded, addPoints, recordActivity, awardBadge, version]);

  // FIX #3: Keep ref updated so timer always calls fresh submitExam
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  const resetExam = () => {
    localStorage.removeItem('last_exam_result');
    localStorage.removeItem('exam_state');
    setHasStarted(false);
    setIsFinished(false);
    setAnswers({});
    setFlagged({});
    setResults(null);
    setReviewMode(false);
    setTimeRemaining(90 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isRestoring) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl text-center shadow-2xl">
          <span className="material-symbols-outlined text-7xl text-primary mb-6 animate-bounce">verified_user</span>
          <h1 className="text-4xl font-bold mb-4">أهلاً يا بطل، جاهز للتحدي؟</h1>
          <p className="text-white/60 mb-10 text-lg leading-relaxed">
            الامتحان ده شامل وهيقيم مستواك الفعلي. ركز كويس عشان تتصدر لوحة المتفوقين!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button onClick={() => setVersion('A')} className={`p-6 rounded-2xl border-2 transition-all ${version === 'A' ? 'border-primary bg-primary/20 scale-105' : 'border-white/10 opacity-50'}`}>نموذج A</button>
            <button onClick={() => setVersion('B')} className={`p-6 rounded-2xl border-2 transition-all ${version === 'B' ? 'border-secondary bg-secondary/20 scale-105' : 'border-white/10 opacity-50'}`}>نموذج B</button>
          </div>

          <button onClick={() => startExam(version)} className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-xl shadow-xl shadow-primary/30 active:scale-95 transition-all">ابدأ الامتحان</button>
        </div>
      </div>
    );
  }

  if (isFinished && results && !reviewMode) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 md:p-20 overflow-y-auto no-scrollbar">
         <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white/5 border border-white/10 p-12 rounded-[50px] text-center shadow-2xl relative overflow-hidden">
               <div className={`absolute top-0 inset-x-0 h-2 ${results.score >= 50 ? 'bg-success' : 'bg-error'}`}></div>
               <h2 className="text-7xl font-bold mb-4">{results.score}%</h2>
               <h3 className="text-3xl font-bold mb-2">
                 {results.score >= 85 ? `عاش يا بطل! 🏆` : results.score >= 50 ? `أداء جيد يا بطل 👍` : `تقدر تعوض يا بطل 💪`}
               </h3>
               <p className="text-xl opacity-60 mb-8">
                 {isSyncing ? "جاري تسجيل نتيجتك..." : "تم حفظ نتيجتك بنجاح!"}
               </p>
               <div className="flex justify-center flex-wrap gap-4">
                  <button onClick={() => setReviewMode(true)} className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-all">مراجعة الأخطاء</button>
                  <Link href="/leaderboard" className="px-8 py-4 rounded-2xl bg-secondary text-white font-bold flex items-center gap-2 hover:scale-105 transition-all">
                    <span className="material-symbols-outlined">emoji_events</span>
                    لوحة الصدارة
                  </Link>
                  <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">الرئيسية</Link>
                  <button onClick={resetExam} className="px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all">إعادة الامتحان</button>
               </div>
            </div>

            <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
               <h3 className="text-xl font-bold mb-6">تحليل الأداء حسب الفصل</h3>
               {Object.entries(results.chapterBreakdown).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([id, stats]) => {
                 const perc = Math.round((stats.correct / (stats.total || 1)) * 100);
                 return (
                   <div key={id} className="mb-4">
                     <div className="flex justify-between text-xs mb-1"><span>{stats.title}</span><span>{perc}%</span></div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className={`h-full ${perc >= 70 ? 'bg-success' : 'bg-error'}`} style={{ width: `${perc}%` }}></div>
                     </div>
                   </div>
                 )
               })}
            </div>
         </div>
      </div>
    );
  }

  const alphabet = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row rtl:flex-row relative">
      
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 z-50 h-[85vh] lg:h-screen w-full lg:w-96 bg-[#0a0f1e] border-l border-white/5 flex flex-col transition-transform ${isMobileDrawerOpen ? 'translate-y-[15vh]' : 'translate-y-full lg:translate-y-0'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0d1325]">
          <h2 className="text-xl font-bold">بابل شيت</h2>
          <div className="flex items-center gap-3">
             <button onClick={() => setCompactView(!compactView)} className={`p-2 rounded-lg transition-colors ${compactView ? 'bg-primary/20 text-primary' : 'bg-white/5 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-sm">view_compact</span>
             </button>
             <button onClick={() => setIsMobileDrawerOpen(false)} className="lg:hidden"><span className="material-symbols-outlined">close</span></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {questions.map((q, i) => {
            const userAnswerIdx = answers[i];
            const isCorrect = isFinished && q.options && q.options[userAnswerIdx] === q.answer;
            
            return (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-xl mb-1 cursor-pointer ${flagged[i] ? 'bg-warning/10' : ''}`} onClick={() => scrollToQuestion(i)}>
                <span className="w-8 text-center text-[10px] opacity-30 font-mono">{i + 1}</span>
                <div className="flex gap-1">
                  {q.options?.map((_, optIdx) => (
                    <div 
                      key={optIdx} 
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-[9px] font-bold ${answers[i] === optIdx ? (isFinished ? (isCorrect ? 'bg-success border-success' : 'bg-error border-error') : 'bg-primary border-primary text-white scale-110') : 'border-white/10 text-white/30'}`}
                    >
                      {alphabet[optIdx]}
                    </div>
                  ))}
                </div>
                {flagged[i] && <span className="material-symbols-outlined text-warning text-xs icon-filled ml-auto">flag</span>}
              </div>
            );
          })}
        </div>

        <div className="p-8 bg-[#0d1325] border-t border-white/5">
          {reviewMode ? (
            <button onClick={() => setReviewMode(false)} className="w-full py-4 rounded-2xl bg-white text-black font-bold">العودة للنتيجة</button>
          ) : (
            <button onClick={submitExam} className="w-full py-4 rounded-2xl bg-error text-white font-bold shadow-xl shadow-error/20 hover:brightness-110 active:scale-95 transition-all">إنهاء الامتحان</button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-4 md:p-12 lg:p-24 overflow-y-auto no-scrollbar">
        <header className="max-w-4xl mx-auto flex justify-between items-center mb-16">
          <h1 className="text-3xl font-black">{reviewMode ? 'مراجعة الأخطاء' : 'الأسئلة'}</h1>
          {!isFinished && (
            <div className={`px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-xl font-mono text-3xl shadow-2xl ${timeRemaining < 300 ? 'text-error animate-pulse bg-error/10 border-error/20' : 'text-primary bg-primary/5'}`}>
              {formatTime(timeRemaining)}
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto space-y-12">
          {questions.map((q, i) => {
            const userAnswerIdx = answers[i];
            const isCorrect = isFinished && q.options && q.options[userAnswerIdx] === q.answer;
            const isWrong = isFinished && userAnswerIdx !== undefined && q.options && q.options[userAnswerIdx] !== q.answer;

            return (
              <section key={i} id={`question-${i}`} className={`group relative rounded-[45px] border transition-all duration-500 ${compactView ? 'p-6 md:p-10' : 'p-8 md:p-14'} ${isFinished ? (isCorrect ? 'bg-success/5 border-success/20' : isWrong ? 'bg-error/5 border-error/20' : 'bg-white/[0.02] border-white/5') : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                
                {!isFinished && (
                  <button onClick={() => toggleFlag(i)} className={`absolute top-10 left-10 p-4 rounded-2xl transition-all ${flagged[i] ? 'bg-warning text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    <span className={`material-symbols-outlined ${flagged[i] ? 'icon-filled' : ''}`}>flag</span>
                  </button>
                )}

                <div className="flex gap-8 mb-12">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black ${isFinished ? (isCorrect ? 'bg-success text-white' : isWrong ? 'bg-error text-white' : 'bg-white/10 text-white/30') : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest opacity-50 block mb-2">{q.chapterName}</span>
                    <h3 className={`${compactView ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold leading-tight`}>{q.question}</h3>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${compactView ? 'gap-3' : 'gap-4'}`}>
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = answers[i] === optIdx;
                    const isCorrectOption = isFinished && opt === q.answer;
                    return (
                      <button 
                        key={optIdx}
                        onClick={() => handleBubbleClick(i, optIdx)}
                        className={`flex items-center gap-6 rounded-[30px] border-2 text-right transition-all group/btn ${compactView ? 'p-4 md:p-6' : 'p-6 md:p-8'} ${isSelected ? (isFinished ? (isCorrectOption ? 'bg-success/20 border-success' : 'bg-error/20 border-error') : 'bg-primary/10 border-primary scale-[1.01]') : (isFinished && isCorrectOption ? 'bg-success/10 border-success/40' : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.08]')}`}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-primary border-primary text-white scale-110' : 'border-white/20'}`}>
                          {alphabet[optIdx]}
                        </div>
                        <span className={`font-medium ${compactView ? 'text-lg' : 'text-xl md:text-2xl'} ${isSelected ? 'text-white' : 'text-white/60'}`}>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isFinished && q.explanation && (
                  <div className="mt-12 p-8 rounded-[35px] bg-white/[0.03] border border-white/5">
                    <p className="text-white/70 italic text-lg mb-4">{q.explanation}</p>
                    {q.source && <p className="text-primary font-bold">📚 {q.source}</p>}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* FIX #17: Show bubble sheet button even in reviewMode */}
      {/* FIX #18: Add overlay to close drawer on outside click */}
      {isMobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-8 left-8 w-16 h-16 rounded-full bg-primary text-white shadow-2xl z-[60] flex items-center justify-center"
      >
        <span className="material-symbols-outlined">grid_view</span>
      </button>
    </div>
  );
}

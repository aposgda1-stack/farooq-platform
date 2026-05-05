'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';
import { useUser } from '@clerk/nextjs';

export default function QuizClient({ chapterId, chapterTitle, questions, mode }) {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // FIX #2: Use refs for correctCount so handleFinishExam always has fresh value
  const correctCountRef = useRef(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Floating Points
  const [activePops, setActivePops] = useState([]);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const isFinishedRef = useRef(false); // FIX #1: Avoid stale closure in timer

  const { isLoaded, recordAnswer, recordActivity, addPoints, awardBadge, updateChapterProgress } = useUserStats();
  const currentQuestion = questions[currentIndex];

  // FIX #1: Separate timer effects — exam timer
  useEffect(() => {
    if (mode !== 'exam' || isFinished) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isFinished]);

  // FIX #1: Handle timer reaching zero via separate effect to avoid stale closure
  useEffect(() => {
    if (timeRemaining === 0 && mode === 'exam' && !isFinishedRef.current) {
      handleFinishExam();
    }
  }, [timeRemaining]);

  const triggerPop = (amount) => {
    const id = Date.now() + Math.random();
    setActivePops(prev => [...prev, { id, amount }]);
    setTimeout(() => {
      setActivePops(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  const handleOptionSelect = (optIndex) => {
    if (mode === 'practice' && isAnswerRevealed) return;
    setSelectedOption(optIndex);
    const isCorrect = currentQuestion.options[optIndex] === currentQuestion.answer;

    if (mode === 'practice') {
      setIsAnswerRevealed(true);
      if (isCorrect) {
        correctCountRef.current += 1;
        setCorrectCount(prev => prev + 1);
        // FIX #7: Only ONE source of points — addPoints here, recordAnswer does NOT add points
        addPoints(10);
        setPointsEarned(prev => prev + 10);
        triggerPop(10);
      } else {
        setWrongCount(prev => prev + 1);
      }

      if (isLoaded) {
        recordAnswer(
          isCorrect,
          currentQuestion.uniqueId || `ch${chapterId}-q${currentIndex}`,
          isCorrect ? null : {
            chapterId, chapterTitle,
            question: currentQuestion.question,
            options: currentQuestion.options,
            answer: currentQuestion.answer,
            explanation: currentQuestion.explanation,
            userOption: currentQuestion.options[optIndex]
          }
        );
      }
    }
  };

  const processExamScore = (selectedOptIndex) => {
    if (selectedOptIndex !== null) {
      const isCorrect = currentQuestion.options[selectedOptIndex] === currentQuestion.answer;
      if (isCorrect) {
        correctCountRef.current += 1;
        setCorrectCount(prev => prev + 1);
        triggerPop(20);
      } else {
        setWrongCount(prev => prev + 1);
      }
      if (isLoaded) {
        recordAnswer(
          isCorrect,
          currentQuestion.uniqueId || `exam-q${currentIndex}`,
          isCorrect ? null : {
            chapterId, chapterTitle,
            question: currentQuestion.question,
            options: currentQuestion.options,
            answer: currentQuestion.answer,
            explanation: currentQuestion.explanation,
            userOption: currentQuestion.options[selectedOptIndex]
          }
        );
      }
    } else {
      setWrongCount(prev => prev + 1); // Skipped = wrong
    }
  };

  const handleNext = () => {
    if (mode === 'exam') processExamScore(selectedOption);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      handleFinishExam();
    }
  };

  // FIX #2: Use ref value for correctCount to avoid stale state
  const handleFinishExam = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // For exam mode, if last question was selected but not processed yet, process it
    let finalCorrect = correctCountRef.current;
    const percentage = Math.round((finalCorrect / (questions.length || 1)) * 100);

    let totalAward = 0;
    if (mode === 'exam') {
      totalAward = finalCorrect * 20;
      if (percentage === 100) totalAward += 200;
      else if (percentage >= 90) totalAward += 100;
      if (timeRemaining > 15 * 60) totalAward += 50;
    } else {
      if (percentage === 100) totalAward += 50;
    }

    setPointsEarned(mode === 'exam' ? totalAward : pointsEarned + (percentage === 100 ? 50 : 0));
    addPoints(totalAward);

    if (isLoaded) {
      recordActivity({
        title: `${mode === 'exam' ? 'امتحان' : 'تدريب'} ${chapterTitle}`,
        date: new Date().toISOString(),
        scoreStr: `${percentage}%`,
        isSuccess: percentage >= 50
      });
      updateChapterProgress(chapterId, questions.length, finalCorrect);
      if (percentage >= 90) awardBadge('excellent');
      if (percentage === 100) awardBadge('perfect');
    }
    setIsFinished(true);
  }, [questions, mode, isLoaded, addPoints, recordActivity, awardBadge, updateChapterProgress, chapterId, chapterTitle, timeRemaining, pointsEarned]);

  const alphabet = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

  if (isFinished) {
    const percentage = Math.round((correctCountRef.current / (questions.length || 1)) * 100);
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="floating-orb w-96 h-96 bg-primary top-[-10%] right-[-10%]" />
        <div className="floating-orb w-64 h-64 bg-secondary bottom-[5%] left-[-5%]" />

        <div className="max-w-xl w-full p-10 sm:p-12 rounded-[50px] badge-glass text-center shadow-2xl relative z-10">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <span className="material-symbols-outlined text-primary text-5xl icon-filled">stars</span>
          </div>
          <h2 className="text-4xl font-black mb-2">
            {percentage === 100 ? `أسطورة يا ${user?.firstName || 'بطل'}! 🎯` : 
             percentage >= 90 ? `عبقري يا ${user?.firstName || 'بطل'}! 🏆` :
             percentage >= 70 ? `عاش يا ${user?.firstName || 'بطل'}! 🌹` :
             percentage >= 50 ? `خطوة ممتازة يا ${user?.firstName || 'بطل'} 👍` :
             `مشرفنا يا ${user?.firstName || 'بطل'}، كمل وهتوصل! 💪`}
          </h2>
          <h3 className="text-xl font-bold mb-2">
            اكتمل {mode === 'exam' ? 'الامتحان' : 'التدريب'} الخاص بـ "{chapterTitle}"
          </h3>
          <p className="opacity-70 mb-10 text-sm">
            {percentage === 100 ? 'إنجاز رائع ومبهر، قفلت الفصل بالكامل!' : 
             percentage >= 90 ? 'أداء ممتاز، فاضل تكة بسيطة ع التقفيل.' :
             'استمر في المحاولة، كل غلطة بتعلمك أكتر.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <span className="block text-4xl font-black text-primary">+{pointsEarned}</span>
              <span className="text-xs opacity-40 uppercase tracking-widest">نقطة مكتسبة</span>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <span className="block text-4xl font-black text-secondary">{percentage}%</span>
              <span className="text-xs opacity-40 uppercase tracking-widest">الدقة</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/leaderboard" className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:scale-105 transition-all">
              مشاهدة لوحة الصدارة
            </Link>
            <Link href="/chapters" className="block w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all">
              العودة للفصول
            </Link>
            <Link href="/dashboard" className="block w-full py-4 rounded-2xl border border-white/10 text-white/70 text-base hover:bg-white/5 transition-all">
              الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-6 flex flex-col relative overflow-hidden">
      <div className="floating-orb w-80 h-80 bg-primary/20 top-[-20%] left-[-10%]" />

      {/* Points Pop Area */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
        {activePops.map(pop => (
          <div key={pop.id} className="animate-points-pop text-primary text-6xl font-black drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">
            +{pop.amount}
          </div>
        ))}
      </div>

      <header className="max-w-3xl mx-auto w-full flex justify-between items-center mb-8 sm:mb-12 relative z-10">
        <div>
          <span className="text-xs font-bold text-primary tracking-widest opacity-50 uppercase">{chapterTitle}</span>
          <h2 className="text-xl font-bold">سؤال {currentIndex + 1} من {questions.length}</h2>
        </div>
        {mode === 'exam' && (
          <div className={`px-5 py-3 rounded-2xl border font-mono text-xl sm:text-2xl ${timeRemaining < 300 ? 'text-error border-error/40 bg-error/10 animate-pulse' : 'bg-white/5 border-white/10 text-primary'}`}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 relative z-10">
        {/* Progress bar */}
        <div className="mb-8 sm:mb-12">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-8 sm:mb-12">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = isAnswerRevealed && opt === currentQuestion.answer;
            const isWrong = isAnswerRevealed && isSelected && opt !== currentQuestion.answer;

            return (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                className={`group p-4 sm:p-6 rounded-[25px] sm:rounded-[35px] border-2 text-right transition-all flex items-center gap-4 sm:gap-6 relative overflow-hidden
                  ${isSelected
                    ? (isAnswerRevealed
                      ? (isCorrect ? 'bg-success/20 border-success shadow-[0_0_20px_rgba(78,222,163,0.2)]' : 'bg-error/20 border-error')
                      : 'bg-primary/20 border-primary scale-[1.02]')
                    : (isAnswerRevealed && isCorrect
                      ? 'bg-success/10 border-success/40'
                      : 'bg-white/5 border-transparent hover:border-white/10')}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-110
                  ${isSelected ? 'bg-primary border-primary text-white' : 'border-white/20'}`}>
                  {alphabet[i] || i + 1}
                </div>
                <span className="text-lg sm:text-xl font-medium">{opt}</span>
                {isAnswerRevealed && isCorrect && (
                  <span className="material-symbols-outlined text-success icon-filled mr-auto shrink-0">check_circle</span>
                )}
                {isWrong && (
                  <span className="material-symbols-outlined text-error icon-filled mr-auto shrink-0">cancel</span>
                )}
              </button>
            );
          })}
        </div>

        {isAnswerRevealed && currentQuestion.explanation && (
          <div className="mt-8 sm:mt-12 p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] badge-glass border border-white/5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3 text-primary">
              <span className="material-symbols-outlined icon-filled">lightbulb</span>
              <span className="font-bold">التفسير العلمي</span>
            </div>
            <p className="text-white/70 italic text-base sm:text-lg leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto w-full py-6 sm:py-8 flex gap-4 relative z-10">
        {/* FIX #16: Use chevron_left for RTL instead of arrow_back with rotation hack */}
        <button
          onClick={handleNext}
          disabled={mode === 'practice' && !isAnswerRevealed}
          className={`flex-1 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-all
            ${(isAnswerRevealed || mode === 'exam')
              ? 'bg-primary text-white shadow-xl shadow-primary/40 hover:scale-[1.02]'
              : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
        >
          {currentIndex === questions.length - 1 ? 'إنهاء المذاكرة' : 'السؤال التالي'}
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';

export default function SpeedClient({ initialQuestions }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const { isLoaded, addPoints, awardBadge, recordActivity } = useUserStats();

  const currentQuestion = initialQuestions[currentIndex];

  useEffect(() => {
    let timer;
    if (hasStarted && !isFinished && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (hasStarted && !isFinished && timeLeft === 0) {
      handleNext(false);
    }
    return () => clearTimeout(timer);
  }, [hasStarted, isFinished, timeLeft]);

  const handleNext = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentIndex < initialQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(5); // Reset timer for next question
    } else {
      finishGame(isCorrect);
    }
  };

  const finishGame = (lastAnswerCorrect = false) => {
    setIsFinished(true);
    if (isLoaded) {
      const finalScore = score + (lastAnswerCorrect ? 1 : 0);
      addPoints(finalScore * 20); // Double points for speed mode!
      
      recordActivity({
        title: 'تحدي السرعة',
        date: new Date().toISOString(),
        scoreStr: `${finalScore}/10`,
        isSuccess: finalScore >= 5
      });

      if (finalScore === 10) {
        awardBadge('speed');
      }
    }
  };

  const handleOptionClick = (option) => {
    const isCorrect = option === currentQuestion.answer;
    handleNext(isCorrect);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-error/20 via-background to-background pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          <span className="material-symbols-outlined text-8xl text-error mb-6 drop-shadow-[0_0_30px_rgba(255,180,171,0.5)]">bolt</span>
          <h1 className="font-display-lg text-display-lg text-on-background mb-4">تحدي السرعة</h1>
          <p className="font-body-base text-body-base text-on-surface-variant mb-8">
            10 أسئلة متتالية، أمامك 5 ثوانٍ فقط لكل سؤال. أجب بسرعة وبدقة لتربح نقاطاً مضاعفة ووسام "البرق"! هل أنت مستعد؟
          </p>
          <div className="flex gap-4 w-full">
            <Link href="/dashboard" className="flex-1 py-4 rounded-xl border border-outline text-on-surface font-title-sm hover:bg-surface-container transition-colors">
              تراجع
            </Link>
            <button 
              onClick={() => setHasStarted(true)} 
              className="flex-1 py-4 rounded-xl bg-error text-on-error font-title-sm font-bold shadow-[0_0_20px_rgba(255,180,171,0.3)] hover:shadow-[0_0_30px_rgba(255,180,171,0.5)] transition-shadow"
            >
              انطلاق ⚡
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 relative">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          {score >= 5 ? (
             <div className="absolute top-0 right-0 w-full h-2 bg-secondary"></div>
          ) : (
             <div className="absolute top-0 right-0 w-full h-2 bg-error"></div>
          )}
          <span className="material-symbols-outlined text-6xl mb-4" style={{ color: score >= 5 ? 'var(--secondary)' : 'var(--error)' }}>
            {score >= 5 ? 'emoji_events' : 'mood_bad'}
          </span>
          <h2 className="font-headline-md text-headline-md text-on-background mb-2">انتهى التحدي!</h2>
          <div className="text-5xl font-black mb-6" style={{ color: score >= 5 ? 'var(--secondary)' : 'var(--error)' }}>
            {score} <span className="text-2xl text-on-surface-variant font-medium">/ 10</span>
          </div>
          <p className="font-body-base text-on-surface-variant mb-8">
            {score === 10 ? 'أداء مثالي وسريع جداً! لقد ربحت وسام السرعة.' : score >= 5 ? 'أداء جيد، لكن يمكنك أن تكون أسرع!' : 'حاول مرة أخرى لتتمرن على السرعة بشكل أفضل.'}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="w-full py-4 rounded-xl bg-primary text-on-primary font-title-sm">حاول مرة أخرى</button>
            <Link href="/dashboard" className="w-full py-4 rounded-xl border border-outline-variant text-on-surface font-title-sm hover:bg-surface-container">العودة للوحة التحكم</Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Game State
  const timePercent = (timeLeft / 5) * 100;
  // Change color based on time remaining
  const timerColor = timeLeft > 3 ? 'bg-secondary' : timeLeft > 1 ? 'bg-warning' : 'bg-error';

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <header className="h-16 border-b border-outline-variant/30 flex items-center px-6 justify-between bg-surface-container-lowest/80 backdrop-blur-md">
        <span className="font-title-sm text-error flex items-center gap-2">
          <span className="material-symbols-outlined icon-filled animate-pulse">bolt</span>
          {score * 20} نقطة
        </span>
        <span className="font-label-caps text-on-surface-variant tracking-wider">سؤال {currentIndex + 1} / 10</span>
        <Link href="/dashboard" className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></Link>
      </header>

      {/* Timer Bar */}
      <div className="w-full h-2 bg-surface-container">
        <div className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} style={{ width: `${timePercent}%` }}></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="text-center w-full mb-12">
          <div className="font-display-lg text-6xl font-black mb-8" style={{ color: `var(--${timerColor.split('-')[1]})`, textShadow: `0 0 20px var(--${timerColor.split('-')[1]})` }}>
            00:0{timeLeft}
          </div>
          <h2 className="font-headline-md text-headline-md leading-relaxed text-on-surface">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              className="bg-surface-container border border-outline-variant/30 hover:border-primary p-6 rounded-2xl font-body-base text-lg text-on-surface transition-all active:scale-95 hover:bg-surface-container-high text-right flex items-center gap-4 group"
            >
              <div className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-sm text-outline group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-colors shrink-0">
                {['أ', 'ب', 'ج', 'د'][idx]}
              </div>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

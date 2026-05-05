'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RandomExamConfig() {
  const [numQuestions, setNumQuestions] = useState(20);
  const [chapters, setChapters] = useState([]); // all, or specific array
  const [difficulty, setDifficulty] = useState('مختلط');

  const startExam = () => {
    alert('في هذا الإصدار، سنقوم بإعداد صفحة الاختبار العشوائي لجلب الأسئلة بناءً على اختيارك: ' + numQuestions + ' سؤال.');
    // Here we would actually route to the QuizClient but with a custom array of questions
    // This is a placeholder demonstrating the UI logic matching your HTML requirements
  };

  return (
    <div className="pb-24 min-h-screen bg-background text-on-background font-body-base">
      <header className="fixed z-40 bg-slate-900/70 backdrop-blur-md text-violet-500 dark:text-violet-400 font-lexend text-right docked full-width top-0 border-b border-slate-800/50 shadow-xl shadow-violet-900/10">
        <div className="flex flex-row-reverse justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-row-reverse">
            <span className="material-symbols-outlined icon-filled text-2xl">casino</span>
            <span className="text-lg font-black text-violet-400 tracking-tight">امتحان عشوائي</span>
          </div>
          <Link href="/dashboard" className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-slate-800/50 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-container-margin pt-28 space-y-8">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">جهز تحديك! 🎲</h1>
          <p className="text-on-surface-variant">اختر تفاصيل الاختبار العشوائي وابدأ المنافسة مع نفسك.</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 md:p-8 space-y-8">
          
          {/* Question Count */}
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-4">عدد الأسئلة</h3>
            <div className="grid grid-cols-4 gap-3">
              {[10, 20, 40, 80].map(num => (
                <button 
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`py-3 rounded-xl font-title-sm transition-colors ${numQuestions === num ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(211,187,255,0.2)]' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-4">الفصول</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setChapters([])}
                className={`flex-1 py-3 rounded-xl font-title-sm transition-colors ${chapters.length === 0 ? 'bg-secondary text-on-secondary shadow-[0_0_15px_rgba(78,222,163,0.2)]' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'}`}
              >
                كل الفصول
              </button>
              <button 
                onClick={() => alert('اختيار فصول معينة سيتم برمجته قريباً')}
                className={`flex-1 py-3 rounded-xl font-title-sm transition-colors ${chapters.length > 0 ? 'bg-secondary text-on-secondary shadow-[0_0_15px_rgba(78,222,163,0.2)]' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'}`}
              >
                تحديد فصول
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-4">الصعوبة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['مختلط', 'سهل', 'متوسط', 'صعب'].map(level => (
                <button 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-xl font-title-sm transition-colors ${difficulty === level ? 'bg-tertiary text-on-tertiary shadow-[0_0_15px_rgba(255,183,132,0.2)]' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

        </div>

        <button onClick={startExam} className="w-full bg-primary-container text-on-primary-container py-5 rounded-2xl font-title-sm text-title-sm hover:brightness-110 shadow-[0_10px_30px_rgba(76,29,149,0.3)] hover:shadow-[0_15px_40px_rgba(76,29,149,0.5)] transition-all flex items-center justify-center gap-3 mt-8">
          <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
          ابدأ الاختبار الآن!
        </button>

      </main>
    </div>
  );
}

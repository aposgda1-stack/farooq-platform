'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';

export default function ReviewPage() {
  const { stats, isLoaded, saveStats } = useUserStats();
  const [activeTab, setActiveTab] = useState('all');
  // FIX #11: Replace confirm() with a state-based modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // FIX #12: Styled loading state
  if (!isLoaded) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface-variant text-sm">جاري تحميل بياناتك...</p>
    </div>
  );

  const wrongAnswers = stats.wrongAnswers || [];
  const chaptersWithErrors = [...new Set(wrongAnswers.map(w => w.chapterId))];
  const filteredAnswers = activeTab === 'all'
    ? wrongAnswers
    : wrongAnswers.filter(w => w.chapterId === activeTab);

  const clearAll = () => {
    saveStats({ ...stats, wrongAnswers: [] });
    setShowConfirmModal(false);
  };

  return (
    <div className="pb-28 min-h-screen bg-background text-on-background">
      {/* FIX #15: Use design tokens instead of hardcoded slate-900/violet-400 */}
      <header className="fixed z-40 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 w-full top-0">
        <div className="flex flex-row-reverse justify-between items-center px-5 h-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="material-symbols-outlined text-primary icon-filled text-2xl">history_edu</span>
            <span className="text-lg font-black text-primary">مراجعة الأخطاء</span>
          </div>
          <Link href="/dashboard" className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-5 pt-24 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">أخطاؤك السابقة</h1>
            <p className="text-on-surface-variant text-sm mt-1">راجع الأسئلة اللي غلطت فيها عشان متغلطش تاني.</p>
          </div>
          {wrongAnswers.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-error/10 text-error px-4 py-2 rounded-xl font-bold text-sm hover:bg-error/20 transition-colors flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              مسح الكل
            </button>
          )}
        </div>

        {wrongAnswers.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-secondary mb-4 icon-filled">check_circle</span>
            <h2 className="font-bold text-xl text-on-surface mb-2">ممتاز! مفيش أي أخطاء</h2>
            <p className="text-on-surface-variant mb-6">أنت ماشي صح ومفيش أي أخطاء مسجلة.</p>
            <Link href="/chapters" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all">
              روح حل امتحانات
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs transition-colors ${activeTab === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                كل الفصول ({wrongAnswers.length})
              </button>
              {chaptersWithErrors.map(id => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs transition-colors ${activeTab === id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  الفصل {id} ({wrongAnswers.filter(w => w.chapterId === id).length})
                </button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {filteredAnswers.map((item, index) => (
                <div key={index} className="glass-card rounded-2xl p-5 relative">
                  <span className="absolute top-4 left-4 bg-surface-container px-2 py-1 rounded-lg text-xs text-on-surface-variant">
                    الفصل {item.chapterId}
                  </span>
                  <h3 className="font-bold text-on-background text-base leading-relaxed mb-4 pr-2 pt-4">
                    {item.question}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {item.options.map((opt, i) => {
                      const isCorrect = opt === item.answer;
                      const isUserOption = opt === item.userOption;
                      let cls = 'bg-surface-container/40 border-outline-variant/30 opacity-60';
                      let icon = 'radio_button_unchecked';
                      let iconColor = 'text-outline-variant';
                      if (isCorrect) { cls = 'bg-secondary/10 border-secondary/50'; icon = 'check_circle'; iconColor = 'text-secondary'; }
                      else if (isUserOption) { cls = 'bg-error/10 border-error/50'; icon = 'cancel'; iconColor = 'text-error'; }
                      return (
                        <div key={i} className={`flex items-center gap-3 border rounded-xl p-3 ${cls}`}>
                          <span className={`material-symbols-outlined icon-filled ${iconColor} text-lg shrink-0`}>{icon}</span>
                          <span className="text-sm">{opt}</span>
                          {isUserOption && !isCorrect && <span className="mr-auto text-xs font-bold text-error shrink-0">إجابتك</span>}
                        </div>
                      );
                    })}
                  </div>
                  {item.explanation && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                      <span className="material-symbols-outlined text-primary icon-filled shrink-0">lightbulb</span>
                      <p className="text-sm text-on-surface-variant">{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FIX #11: Confirm Modal instead of browser confirm() */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-surface-container rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-error text-4xl block mb-4 icon-filled">warning</span>
            <h2 className="font-bold text-xl text-on-background mb-2">مسح جميع الأخطاء؟</h2>
            <p className="text-on-surface-variant text-sm mb-6">هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-2xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-bright transition-colors">
                إلغاء
              </button>
              <button onClick={clearAll} className="flex-1 py-3 rounded-2xl bg-error text-white font-bold hover:brightness-110 transition-all">
                مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

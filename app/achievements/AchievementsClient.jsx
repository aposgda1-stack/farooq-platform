'use client';

import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';
import { BADGES } from '@/lib/badges';

export default function AchievementsClient() {
  const { stats, isLoaded } = useUserStats();

  if (!isLoaded) return <div className="text-center mt-20">جاري التحميل...</div>;

  const userBadges = stats.badges || [];
  const allBadges = BADGES ? Object.values(BADGES) : [];

  return (
    <div className="pb-24 min-h-screen bg-background text-on-background">
      <header className="fixed z-40 bg-slate-900/70 backdrop-blur-md text-violet-500 font-lexend text-right docked full-width top-0 border-b border-slate-800/50 shadow-xl">
        <div className="flex flex-row-reverse justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-row-reverse">
            <span className="material-symbols-outlined icon-filled text-2xl">military_tech</span>
            <span className="text-lg font-black text-violet-400 tracking-tight">الإنجازات</span>
          </div>
          <Link href="/dashboard" className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-slate-800/50 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-5 pt-28 space-y-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 border-4 border-primary/20 shadow-xl">
            <span className="material-symbols-outlined text-5xl text-primary icon-filled">workspace_premium</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">لوحة الشرف</h1>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            لقد جمعت <strong className="text-primary">{userBadges.length}</strong> من أصل {allBadges.length} أوسمة متاحة. استمر في التفوق لفتح الباقي!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBadges.map((badge) => {
            const isUnlocked = userBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`relative overflow-hidden flex flex-col items-center text-center p-6 rounded-3xl transition-all duration-300 ${isUnlocked ? 'bg-white/5 border border-white/10 shadow-lg hover:-translate-y-1' : 'bg-white/2 border border-transparent opacity-60 grayscale'}`}
              >
                <div className={`text-6xl mb-4 filter drop-shadow-md transition-transform duration-500 ${isUnlocked ? 'scale-110' : ''}`}>
                  {badge.icon}
                </div>
                <h3 className={`text-sm font-bold mb-2 ${isUnlocked ? 'text-on-surface' : 'text-outline'}`}>
                  {badge.name}
                </h3>
                <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase">
                  {badge.desc}
                </p>
                {isUnlocked && (
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-success">check</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

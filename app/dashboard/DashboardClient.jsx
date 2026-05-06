'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStats } from '@/lib/useUserStats';
import { BADGES } from '@/lib/badges';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

export default function DashboardClient() {
  const { user: clerkUser, isSignedIn, isLoaded: isAuthLoaded } = useUser();
  const { activeUser, stats, isLoaded: isStatsLoaded } = useUserStats();
  const [topStudents, setTopStudents] = useState([]);

  const whatsappLink = `https://wa.me/201015960695?text=${encodeURIComponent('مرحباً 👋 وصلت من منصة الفروق الفردية، محتاج مساعدة في...')}`;

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setTopStudents(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  const handleCustomLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (!isStatsLoaded || !isAuthLoaded) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface-variant text-sm">جاري التحميل...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-28 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[5%] left-[-5%] w-64 h-64 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="flex flex-row-reverse justify-between items-center px-5 h-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {!activeUser && (
                <Link href="/auth/login" className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all">
                  <span className="material-symbols-outlined text-sm">login</span>
                  دخول
                </Link>
              )}
              {activeUser?.source === 'clerk' && (
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-primary/30 rounded-2xl" } }} />
              )}
              {activeUser?.source === 'custom' && (
                <button onClick={handleCustomLogout} className="w-9 h-9 flex items-center justify-center bg-surface-variant/50 border-2 border-primary/30 rounded-2xl text-error hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-sm">logout</span>
                </button>
              )}
            </div>
            <div className="leading-none text-right">
              <p className="font-bold text-sm text-on-background">أهلاً {activeUser?.name?.split(' ')[0] || 'يا بطل'} 🎓</p>
              {activeUser && stats && (
                <p className="text-xs font-bold text-primary mt-1">{stats.totalPoints} <span className="text-[10px] text-on-surface-variant font-normal">نقطة</span></p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🌹</span>
            <span className="font-lexend font-black text-xs ruby-gradient">منصة الفروق الفردية</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Notifications Section */}
        {stats?.notifications?.length > 0 && (
          <div className="space-y-3">
            {stats.notifications.filter(n => !n.read).map((n, i) => (
              <div key={n.id || i} className={`relative overflow-hidden p-5 rounded-[28px] border-2 transition-all ${n.type === 'warning' ? 'bg-error/5 border-error/20 text-error' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'warning' ? 'bg-error/10' : 'bg-primary/10'}`}>
                    <span className="material-symbols-outlined icon-filled text-xl">{n.type === 'warning' ? 'warning' : 'notifications'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black mb-1 flex items-center justify-between">
                      {n.type === 'warning' ? 'تنبيه هام' : 'رسالة جديدة'}
                      <span className="opacity-50 font-normal">{new Date(n.date).toLocaleDateString('ar-EG')}</span>
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-on-background opacity-90">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 text-primary text-3xl">⭐</div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">إجمالي نقاطك</p>
            <p className="font-black text-4xl text-on-background">{stats?.totalPoints || 0}</p>
            <p className="text-on-surface-variant text-xs">نقطة تراكمية · Seniors 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/chapters" className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">auto_stories</span>
            <p className="font-bold text-on-background text-sm">الفصول الدراسية</p>
          </Link>
          <Link href="/final-exam" className="rounded-2xl p-5 flex flex-col gap-3 bg-primary/15 border border-primary/30">
            <span className="material-symbols-outlined text-primary text-2xl">assignment_turned_in</span>
            <p className="font-bold text-primary text-sm">الامتحان النهائي</p>
          </Link>
          <Link href="/leaderboard" className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <span className="material-symbols-outlined text-tertiary text-2xl">emoji_events</span>
            <p className="font-bold text-on-background text-sm">لوحة المتفوقين</p>
          </Link>
          <Link href="/review" className="glass-card rounded-2xl p-5 flex flex-col gap-3">
            <span className="material-symbols-outlined text-error text-2xl">history_edu</span>
            <p className="font-bold text-on-background text-sm">مراجعة أخطائي</p>
          </Link>
        </div>

        {/* Top students mini */}
        {topStudents.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <Link href="/leaderboard" className="text-primary text-xs font-bold hover:underline">عرض الكل</Link>
              <h2 className="font-bold text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-lg icon-filled">trophy</span>
                المتصدرون
              </h2>
            </div>
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl bg-surface-container/50`}>
                  <span className="text-lg w-6 text-center shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                  </span>
                  <p className="flex-1 font-bold text-on-background text-sm truncate">{s.name}</p>
                  <p className="font-black text-primary text-sm">{s.totalPoints || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {stats?.badges?.length > 0 && (
          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-bold text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary icon-filled">military_tech</span>
              أوسمتك
            </h2>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((b, i) => (
                <div key={i} className="px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}

        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
          واجهت مشكلة؟ تواصل على واتساب
        </a>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-primary/10">
        <div className="flex flex-row-reverse justify-around items-center px-4 h-16 max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl icon-filled">home</span>
            الرئيسية
          </Link>
          <Link href="/chapters" className="flex flex-col items-center gap-1 text-on-surface-variant p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">auto_stories</span>
            الفصول
          </Link>
          <Link href="/final-exam" className="flex flex-col items-center gap-1 text-on-surface-variant p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            الامتحان
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-on-surface-variant p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">emoji_events</span>
            المتفوقون
          </Link>
        </div>
      </nav>
    </div>
  );
}

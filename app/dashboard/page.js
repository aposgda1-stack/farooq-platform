'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStats, BADGES } from '@/lib/useUserStats';
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { user } = useUser();
  const { stats, isLoaded: isStatsLoaded } = useUserStats();
  const [topStudents, setTopStudents] = useState([]);

  const whatsappLink = `https://wa.me/201015960695?text=${encodeURIComponent('مرحباً 👋 وصلت من منصة الفروق الفردية، محتاج مساعدة في...')}`;

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setTopStudents(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  if (!isStatsLoaded) return (
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
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=student"}
                alt="Profile"
                className="w-9 h-9 rounded-2xl border-2 border-primary/30 object-cover bg-primary/10"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-sm text-on-background">أهلاً {user?.firstName || 'يا بطل'} 🎓</p>
              <p className="text-[10px] text-on-surface-variant mt-1">جاهز تلم المنهج؟</p>
            </div>
          </div>
          {/* Brand */}
          <div className="flex items-center gap-1.5">
            <span className="text-base">🌹</span>
            <span className="font-lexend font-black text-xs ruby-gradient">منصة الفروق الفردية</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-3xl mx-auto space-y-6 relative z-10">

        {/* Score hero */}
        <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl icon-filled">stars</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">إجمالي نقاطك</p>
              <div className="flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-bold text-success uppercase tracking-tight">Cloud Sync</span>
              </div>
            </div>
            <p className="font-black text-4xl text-on-background">{stats?.totalPoints || 0}</p>
            <p className="text-on-surface-variant text-xs">نقطة تراكمية · Seniors 2026</p>
          </div>
        </div>

        {/* Quick actions — Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/chapters" className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all group">
            <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">auto_stories</span>
            <p className="font-bold text-on-background text-sm">الفصول الدراسية</p>
          </Link>
          <Link href="/final-exam" className="rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all group bg-primary/15 border border-primary/30">
            <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">assignment_turned_in</span>
            <p className="font-bold text-primary text-sm">الامتحان النهائي</p>
          </Link>
          <Link href="/leaderboard" className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all group">
            <span className="material-symbols-outlined text-tertiary text-2xl group-hover:scale-110 transition-transform">emoji_events</span>
            <p className="font-bold text-on-background text-sm">لوحة المتفوقين</p>
          </Link>
          <Link href="/review" className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all group">
            <span className="material-symbols-outlined text-error text-2xl group-hover:scale-110 transition-transform">history_edu</span>
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

        {/* WhatsApp CTA */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-sm text-white hover:scale-[1.02] transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          واجهت مشكلة؟ تواصل على واتساب
        </a>

        <p className="text-center text-on-surface-variant/40 text-xs pb-2">
          منصة الفروق الفردية · Seniors 2026 · منصة تطوعية غير ربحية
        </p>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-primary/10">
        <div className="flex flex-row-reverse justify-around items-center px-4 h-16 max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl icon-filled">home</span>
            الرئيسية
          </Link>
          <Link href="/chapters" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">auto_stories</span>
            الفصول
          </Link>
          <Link href="/final-exam" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            الامتحان
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">emoji_events</span>
            المتفوقون
          </Link>
        </div>
      </nav>
    </div>
  );
}

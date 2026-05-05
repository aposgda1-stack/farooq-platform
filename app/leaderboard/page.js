'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const whatsappLink = `https://wa.me/201015960695?text=${encodeURIComponent('مرحباً 👋 وصلت من منصة الفروق الفردية، محتاج مساعدة في...')}`;

  useEffect(() => {
    fetch('/api/leaderboard', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })
      .then(res => res.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="flex flex-row-reverse justify-between items-center px-5 h-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <span>🌹</span>
            <span className="font-lexend font-black text-sm ruby-gradient">منصة الفروق الفردية</span>
          </div>
          <h1 className="font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary icon-filled">emoji_events</span>
            المتفوقون
          </h1>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-3xl mx-auto">
        {/* Seniors badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/10">
            <span className="text-sm">🌹</span>
            <span className="font-lexend font-bold text-primary text-xs tracking-widest">SENIORS 2026</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm">جاري جلب قائمة الأبطال...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-primary/10">
            <span className="text-5xl block mb-4">🏆</span>
            <p className="text-on-surface-variant">لا يوجد متسابقون بعد</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">كن أول من يتصدر القائمة!</p>
            <Link href="/chapters" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:scale-105 transition-all">
              ابدأ التدريب الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  index === 0
                    ? 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10'
                    : 'glass-card border-primary/10'
                }`}
              >
                <div className="text-2xl w-8 text-center shrink-0">
                  {medals[index] || <span className="font-bold text-on-surface-variant text-sm">{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-background truncate">{student.name}</p>
                  <p className="text-on-surface-variant text-xs truncate">{student.email}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="font-black text-xl text-primary">{student.totalPoints || 0}</p>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">نقطة</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp footer note */}
        <div className="mt-10 text-center">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            واجهت مشكلة؟ تواصل على واتساب
          </a>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-primary/10" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="flex flex-row-reverse justify-around items-center px-4 h-16 max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">home</span>
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
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-primary p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl icon-filled">emoji_events</span>
            المتفوقون
          </Link>
        </div>
      </nav>
    </div>
  );
}

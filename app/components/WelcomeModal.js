'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';

export default function WelcomeModal() {
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const hasSeen = localStorage.getItem('farooq_hasSeenWelcome');
    if (!hasSeen && !isSignedIn) {
      const t = setTimeout(() => setIsOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [isLoaded, isSignedIn]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      localStorage.setItem('farooq_hasSeenWelcome', 'true');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end justify-center bg-black/80 backdrop-blur-lg transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg rounded-t-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-300 ${closing ? 'translate-y-full' : 'translate-y-0'}`}
        style={{
          background: 'linear-gradient(180deg, #1a1225 0%, #120d1a 100%)',
          border: '1px solid rgba(211,187,255,0.15)',
          borderBottom: 'none',
          animation: closing ? undefined : 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="relative px-7 pb-3 pt-2">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="relative z-10 flex items-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
              Seniors 2026 · منصة الفروق الفردية
            </div>
          </div>

          {/* Heading */}
          <div className="relative z-10 mb-5 text-left" dir="ltr">
            <h2 className="text-[1.75rem] font-black text-white tracking-tight leading-tight mb-3 font-lexend">
              Welcome to the Platform! 👋<br />
              <span className="ruby-gradient">Seniors 2026</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed font-medium font-lexend">
              This is our final semester together. Sign in to save your progress, secure your spot on the leaderboard, and let's finish this journey strong <strong className="ruby-gradient">together.</strong>
            </p>
          </div>

          {/* Divider */}
          <div className="relative z-10 border-t border-white/5 mb-5" />

          {/* Actions */}
          <div className="relative z-10 space-y-3 pb-8">
            {/* Primary: Sign In */}
            <SignInButton fallbackRedirectUrl="/dashboard">
              <button
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}
              >
                <span className="material-symbols-outlined text-xl icon-filled">login</span>
                سجّل دخولك / أنشئ حساب
              </button>
            </SignInButton>

            {/* Secondary: Guest */}
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl border border-white/10 text-white/40 font-bold text-xs uppercase tracking-widest hover:border-white/20 hover:text-white/60 active:scale-95 transition-all"
            >
              متابعة كزائر — التقدم لن يُحفظ
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login, go to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('مشكلة في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-5" dir="rtl">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-primary/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary icon-filled">login</span>
          </div>
          <h1 className="text-2xl font-black text-on-background">تسجيل الدخول</h1>
          <p className="text-on-surface-variant text-sm mt-2">مرحباً بعودتك يا بطل</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-background mb-1">البريد الإلكتروني (أو رقم التليفون)</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-variant/50 border border-primary/10 focus:border-primary/50 focus:outline-none focus:ring-2 ring-primary/20 transition-all text-on-background"
              placeholder="example@gmail.com أو رقم الموبايل"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-background mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-variant/50 border border-primary/10 focus:border-primary/50 focus:outline-none focus:ring-2 ring-primary/20 transition-all text-on-background"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-primary text-white font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div className="text-sm text-on-surface-variant">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </div>
          
          <div className="pt-4 border-t border-primary/10 flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant">أو هل لديك حساب قديم؟</span>
            <Link href="/sign-in" className="text-xs font-bold text-tertiary hover:underline">
              الدخول باستخدام (Google/Clerk)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

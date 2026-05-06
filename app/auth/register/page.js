'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful registration, go to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'حدث خطأ أثناء التسجيل');
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
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-2xl font-black text-on-background">حساب جديد</h1>
          <p className="text-on-surface-variant text-sm mt-2">انضم لمنصة الفروق الفردية</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-background mb-1">الاسم الثلاثي</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-variant/50 border border-primary/10 focus:border-primary/50 focus:outline-none focus:ring-2 ring-primary/20 transition-all text-on-background"
              placeholder="اكتب اسمك الحقيقي (لشهادة التقدير)"
            />
          </div>
          
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
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            سجل دخولك
          </Link>
        </div>
      </div>
    </div>
  );
}

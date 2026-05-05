'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="glass-card p-10 rounded-3xl max-w-md w-full border border-error/20">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">عذراً، حدث خطأ غير متوقع</h2>
        <p className="text-on-surface-variant mb-8">لقد واجهنا مشكلة تقنية، لكن لا تقلق تقدمك محفوظ.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="bg-primary text-on-primary py-4 px-8 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            إعادة المحاولة
          </button>
          <a href="/" className="text-primary hover:underline">العودة للرئيسية</a>
        </div>
      </div>
    </div>
  );
}

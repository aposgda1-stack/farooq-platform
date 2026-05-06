'use client';

import dynamic from 'next/dynamic';

const FinalExamDynamic = dynamic(() => import('./FinalExamClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface-variant text-sm text-center">جاري تحضير الامتحان النهائي...</p>
    </div>
  )
});

export default function FinalExamPage() {
  return <FinalExamDynamic />;
}

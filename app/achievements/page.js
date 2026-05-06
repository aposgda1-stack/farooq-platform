'use client';

import dynamic from 'next/dynamic';

const AchievementsClient = dynamic(() => import('./AchievementsClient'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center text-primary font-bold">جاري التحميل...</div>
});

export default function AchievementsPage() {
  return <AchievementsClient />;
}

'use client';

import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface-variant text-sm text-center">جاري تحميل لوحة التحكم...</p>
    </div>
  )
});

export default function Dashboard() {
  return <DashboardClient />;
}

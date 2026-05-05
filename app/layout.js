import './globals.css'
import './globals.css'

export const metadata = {
  title: 'Summarized by Ruby | منصة فروق فردية',
  description: 'منصة Summarized by Ruby التعليمية — ملخصات احترافية وأسئلة تفاعلية لمساعدتك على التفوق في الفروق الفردية.',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#d3bbff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="ar" dir="rtl" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Lexend:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className="bg-background text-on-background font-body-base text-body-base min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-primary antialiased">
          {children}
        </body>
      </html>
    </>
  )
}

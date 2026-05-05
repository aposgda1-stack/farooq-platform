'use client';
import Link from 'next/link';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const whatsappNumber = '201015960695';
  const whatsappMessage = encodeURIComponent('مرحباً 👋 وصلت من منصة الفروق الفردية، محتاج مساعدة في...');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <>
      {/* Background orbs */}
      <div className="fixed top-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary-container/25 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary-container/20 blur-[130px] pointer-events-none z-0" />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background/70 backdrop-blur-xl">
        <div className="flex flex-row-reverse justify-between items-center px-5 h-16 max-w-5xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌹</span>
            <div className="leading-none">
              <p className="font-lexend font-black text-base tracking-tight ruby-gradient">منصة</p>
              <p className="font-lexend font-black text-base tracking-tight ruby-gradient">الفروق الفردية</p>
            </div>
          </div>
          {/* Auth + CTA */}
          <div className="flex items-center gap-3">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="flex items-center gap-1.5 text-primary border border-primary/30 font-bold text-sm px-4 py-2 rounded-full hover:bg-primary/10 transition-all duration-200">
                  <span className="material-symbols-outlined text-base">login</span>
                  دخول
                </button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-base icon-filled">school</span>
              ابدأ الآن
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <main className="relative z-10 pt-28 pb-20 px-5 max-w-2xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-lexend text-xs font-semibold text-primary tracking-widest uppercase">Seniors 2026</span>
        </div>

        {/* Heading */}
        <h1 className="font-lexend font-black text-4xl sm:text-5xl leading-tight text-on-background mb-5">
          <span className="ruby-gradient">منصة</span>
          <br />
          <span className="ruby-gradient">الفروق الفردية</span>
        </h1>

        {/* Personal message from Ruby */}
        <div className="glass-card rounded-3xl p-6 mb-8 text-right space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎓</span>
            <span className="font-lexend font-bold text-primary text-sm">رسالة من زميلكم</span>
          </div>
          <p className="text-on-surface leading-relaxed text-sm sm:text-base">
            ده آخر ترم في مسيرتنا التعليمية مع بعض، وأنا فخور بيكم جداً. اتمنى من قلبي إن كل واحد فيكم يوصل لأحلامه ويحقق اللي بيتمناه.
          </p>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            المنصة دي مجهود تطوعي خالص (مجانية 100%)، هدفها مساعدة زملائي ع المذاكرة وتشجيعهم على التقدم في مسيرتهم التعليمية.
          </p>

          {/* Disclaimer badge */}
          <div className="mt-4 p-3 rounded-2xl bg-surface-container border border-outline-variant/60 flex gap-2 items-start">
            <span className="material-symbols-outlined text-secondary text-lg mt-0.5 shrink-0">info</span>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              <span className="font-bold text-secondary">تنويه:</span> المنصة دي مخصصة للتدريب على الاختبارات فقط، غير ربحية، وغير تابعة لأي مؤسسة أو دكتور. كل المحتوى مقدّم بشكل تطوعي.
            </p>
          </div>
        </div>

        {/* Stats — real platform features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-primary text-2xl block mb-1 icon-filled">menu_book</span>
            <p className="font-bold text-on-background text-xl">11</p>
            <p className="text-on-surface-variant text-xs">فصل دراسي</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-secondary text-2xl block mb-1 icon-filled">emoji_events</span>
            <p className="font-bold text-on-background text-xl">لوحة</p>
            <p className="text-on-surface-variant text-xs">المتفوقين</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-tertiary text-2xl block mb-1 icon-filled">psychology</span>
            <p className="font-bold text-on-background text-xl">تدريب</p>
            <p className="text-on-surface-variant text-xs">ذكي وتفاعلي</p>
          </div>
        </div>

        {/* What's inside */}
        <div className="space-y-3 mb-10">
          {[
            { icon: 'quiz', color: 'text-primary', title: 'أسئلة تدريبية لكل فصل', desc: 'تدرب على أسئلة الفصول بشكل منفصل مع شرح الإجابة' },
            { icon: 'assignment_turned_in', color: 'text-secondary', title: 'امتحان نهائي شامل', desc: 'امتحان يجمع أسئلة من كل الفصول مع مؤقت وتقييم فوري' },
            { icon: 'emoji_events', color: 'text-tertiary', title: 'لوحة المتفوقين', desc: 'نافس زملاءك واتصدر القائمة بنقاطك التراكمية' },
            { icon: 'cloud_done', color: 'text-secondary', title: 'حفظ سحابي لتقدمك', desc: 'كل نقاطك وإنجازاتك محفوظة في حسابك وتقدر تفتحها من أي جهاز' },
            { icon: 'history_edu', color: 'text-primary', title: 'مراجعة أخطاءك', desc: 'راجع الأسئلة اللي أخطأت فيها وتعلم منها' },
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 text-right">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <span className={`material-symbols-outlined ${f.color} icon-filled`}>{f.icon}</span>
              </div>
              <div>
                <p className="font-bold text-on-background text-sm">{f.title}</p>
                <p className="text-on-surface-variant text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-base text-center shadow-xl shadow-primary/30 hover:scale-[1.02] hover:shadow-primary/50 transition-all">
            ابدأ المذاكرة الآن 🚀
          </Link>
          <Link href="/leaderboard" className="block w-full py-4 rounded-2xl glass-card text-on-background font-bold text-base text-center hover:border-primary/30 transition-all">
            🏆 لوحة المتفوقين
          </Link>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-primary/10 bg-surface-container-lowest py-8 px-5">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌹</span>
            <span className="font-lexend font-black text-base ruby-gradient">منصة الفروق الفردية</span>
          </div>

          {/* Disclaimer text */}
          <p className="text-on-surface-variant text-xs text-center leading-relaxed max-w-sm">
            منصة تطوعية غير ربحية · غير تابعة لأي جهة رسمية · مخصصة للتدريب على الاختبارات فقط
          </p>

          {/* WhatsApp CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm text-white shadow-lg hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            واجهت مشكلة؟ راسلني على واتساب
          </a>

          {/* Copyright */}
          <p className="text-on-surface-variant/50 text-xs">
            منصة الفروق الفردية · Seniors 2026
          </p>
        </div>
      </footer>
    </>
  );
}

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-5 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        {/* Text/Marketing Side */}
        <div className="hidden lg:flex flex-col text-right">
          <div className="flex items-center gap-3 mb-6 justify-end">
            <span className="text-4xl">🌹</span>
            <h1 className="font-lexend font-black text-3xl ruby-gradient">منصة الفروق الفردية</h1>
          </div>
          
          <h2 className="text-4xl font-black text-on-background leading-tight mb-6">
            مرحباً بك في رحلة <br />
            <span className="text-primary">التفوق والنجاح</span>
          </h2>
          
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md ml-auto">
            انضم إلى زملائك في Seniors 2026 وابدأ التدريب على أحدث الأسئلة التفاعلية. نقاطك، إنجازاتك، ومكانك في لوحة المتفوقين في انتظارك.
          </p>

          <div className="space-y-4">
            {[
              { icon: 'verified_user', text: 'دخول آمن وسريع عبر Clerk' },
              { icon: 'cloud_done', text: 'مزامنة تلقائية لتقدمك الدراسي' },
              { icon: 'emoji_events', text: 'نافس على المركز الأول في الدفعة' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-end text-on-surface-variant font-bold text-sm">
                <span>{item.text}</span>
                <span className="material-symbols-outlined text-primary icon-filled text-xl">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clerk Component Side */}
        <div className="flex flex-col items-center">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-5xl block mb-4">🌹</span>
            <h1 className="font-lexend font-black text-2xl ruby-gradient">منصة الفروق الفردية</h1>
          </div>

          <div className="glass-card p-2 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-transparent shadow-none border-none",
                  headerTitle: "text-on-background font-lexend font-black text-xl",
                  headerSubtitle: "text-on-surface-variant text-sm",
                  socialButtonsBlockButton: "bg-surface-container border-outline-variant hover:bg-surface-container-high transition-colors",
                  socialButtonsBlockButtonText: "text-on-surface font-bold",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25",
                  footerActionLink: "text-primary hover:text-primary/80 font-bold",
                  formFieldLabel: "text-on-surface font-bold text-xs mb-1.5",
                  formFieldInput: "bg-surface-container border-outline-variant rounded-xl focus:ring-primary focus:border-primary",
                  dividerLine: "bg-outline-variant",
                  dividerText: "text-on-surface-variant text-xs uppercase tracking-widest",
                  identityPreviewText: "text-on-background",
                  identityPreviewEditButton: "text-primary"
                }
              }}
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-error/5 border border-error/20 text-center w-full max-w-sm">
              <p className="text-xs font-bold text-error mb-2">هل واجهت مشكلة في الدخول؟ (العدد اكتمل)</p>
              <Link href="/auth/register" className="inline-block px-4 py-2 bg-background border border-primary/30 text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors">
                سجل بالطريقة التقليدية
              </Link>
            </div>

            <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold">
              العودة للرئيسية
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

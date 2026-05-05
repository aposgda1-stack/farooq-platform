import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-5 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-5%] w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        
        {/* Text Side */}
        <div className="hidden lg:flex flex-col text-right">
          <div className="flex items-center gap-3 mb-6 justify-end">
            <span className="text-4xl">🌹</span>
            <h1 className="font-lexend font-black text-3xl ruby-gradient">منصة الفروق الفردية</h1>
          </div>
          
          <h2 className="text-4xl font-black text-on-background leading-tight mb-6">
            كن جزءاً من <br />
            <span className="text-secondary">جيل المتفوقين</span>
          </h2>
          
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md ml-auto">
            بخطوات بسيطة، ابدأ رحلتك التعليمية التفاعلية. سجّل الآن لتتمكن من حفظ تقدمك، مراجعة أخطائك، ومنافسة زملائك على لقب "طالب الدفعة".
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="material-symbols-outlined text-primary text-2xl mb-2 icon-filled">bolt</span>
              <p className="font-bold text-xs text-on-background">نتائج فورية</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="material-symbols-outlined text-secondary text-2xl mb-2 icon-filled">leaderboard</span>
              <p className="font-bold text-xs text-on-background">ترتيب الدفعة</p>
            </div>
          </div>
        </div>

        {/* Clerk Component Side */}
        <div className="flex flex-col items-center">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-5xl block mb-4">🌹</span>
            <h1 className="font-lexend font-black text-2xl ruby-gradient">منصة الفروق الفردية</h1>
          </div>

          <div className="glass-card p-2 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
            <SignUp 
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
                  dividerText: "text-on-surface-variant text-xs uppercase tracking-widest"
                }
              }}
            />
          </div>

          <Link href="/" className="mt-8 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold">
            العودة للرئيسية
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

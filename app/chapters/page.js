import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

export default async function Chapters() {
  const dataFilePath = path.join(process.cwd(), 'public', 'data', 'chapters-meta.json');
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  const parsedData = JSON.parse(fileContents);
  const chapters = Array.isArray(parsedData) ? parsedData : (parsedData.chapters || []);
  const activeChapters = chapters.filter(c => c.included !== false);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="flex flex-row-reverse justify-between items-center px-5 h-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌹</span>
            <span className="font-lexend font-black text-sm ruby-gradient">Summarized by Ruby</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-background transition-colors text-sm">
            <span className="material-symbols-outlined text-base">home</span>
            الرئيسية
          </Link>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-lexend font-black text-2xl text-on-background mb-1">الفصول الدراسية</h1>
          <p className="text-on-surface-variant text-sm">اختار الفصل وابدأ التدريب أو الامتحان</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeChapters.map((chapter) => (
            <article
              key={chapter.id}
              className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(244,114,182,0.15)] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <span className="bg-primary/15 text-primary font-lexend text-xs font-bold px-3 py-1 rounded-full">
                  الفصل {chapter.id}
                </span>
                {chapter.focus && (
                  <span className="bg-tertiary/20 text-tertiary font-lexend text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs icon-filled">star</span>
                    مهم
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-bold text-on-background text-base leading-snug mb-1">{chapter.title}</h2>
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-sm">help_outline</span>
                  <span>{chapter.totalQuestions} سؤال</span>
                </div>
              </div>

              {/* Progress bar placeholder */}
              <div className="w-full bg-surface-variant/50 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full w-[0%]" />
              </div>

              <div className="flex gap-3 pt-2 border-t border-primary/10">
                <Link
                  href={`/quiz/${chapter.id}?mode=practice`}
                  className="flex-1 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition-colors text-center"
                >
                  تدريب
                </Link>
                <Link
                  href={`/quiz/${chapter.id}?mode=exam`}
                  className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-colors text-center"
                >
                  امتحان
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-primary/10" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="flex flex-row-reverse justify-around items-center px-4 h-16 max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">home</span>
            الرئيسية
          </Link>
          <Link href="/chapters" className="flex flex-col items-center gap-1 text-primary p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl icon-filled">auto_stories</span>
            الفصول
          </Link>
          <Link href="/final-exam" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            الامتحان
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors p-2 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xl">emoji_events</span>
            المتفوقون
          </Link>
        </div>
      </nav>
    </div>
  );
}

import QuizClient from './QuizClient';
import Link from 'next/link';

export default async function QuizPage({ params, searchParams }) {
  const chapterId = params.chapterId;
  const mode = searchParams.mode || 'practice';

  try {
    // Fetch chapter meta to get title using dynamic import for Vercel compatibility
    const metaContents = (await import('@/public/data/chapters-meta.json')).default;
    const chapters = Array.isArray(metaContents) ? metaContents : (metaContents.chapters || []);
    const chapterMeta = chapters.find(c => c.id.toString() === chapterId.toString());

    if (!chapterMeta) throw new Error('Chapter not found');

    // Fetch chapter questions using dynamic import so Webpack bundles them
    const paddedId = chapterId.toString().padStart(2, '0');
    const questions = (await import(`@/public/data/chapter-${paddedId}-questions.json`)).default;

    return (
      <QuizClient 
        chapterId={chapterId} 
        chapterTitle={chapterMeta?.title || `الفصل ${chapterId}`} 
        questions={questions} 
        mode={mode} 
      />
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <div className="glass-card p-10 rounded-3xl text-center border border-error/20">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-2xl font-bold mb-4">عذراً، الفصل غير متوفر</h2>
          <p className="text-on-surface-variant mb-8">لم نتمكن من العثور على أسئلة لهذا الفصل حالياً.</p>
          <Link href="/chapters" className="bg-primary text-on-primary px-8 py-3 rounded-xl inline-block">العودة للفصول</Link>
        </div>
      </div>
    );
  }
}

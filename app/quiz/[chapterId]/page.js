import QuizClient from './QuizClient';
import Link from 'next/link';

// Static mapping for Vercel bundling
const questionFiles = {
  '1': () => import('@/data/chapter-01-questions.json'),
  '2': () => import('@/data/chapter-02-questions.json'),
  '3': () => import('@/data/chapter-03-questions.json'),
  '4': () => import('@/data/chapter-04-questions.json'),
  '5': () => import('@/data/chapter-05-questions.json'),
  '6': () => import('@/data/chapter-06-questions.json'),
  '7': () => import('@/data/chapter-07-questions.json'),
  '8': () => import('@/data/chapter-08-questions.json'),
  '9': () => import('@/data/chapter-09-questions.json'),
  '10': () => import('@/data/chapter-10-questions.json'),
  '11': () => import('@/data/chapter-11-questions.json'),
  '13': () => import('@/data/chapter-13-questions.json'),
};

export default async function QuizPage({ params, searchParams }) {
  const chapterId = params.chapterId;
  const mode = searchParams.mode || 'practice';

  try {
    const metaContents = (await import('@/data/chapters-meta.json')).default;
    const chapters = Array.isArray(metaContents) ? metaContents : (metaContents.chapters || []);
    const chapterMeta = chapters.find(c => c.id.toString() === chapterId.toString());

    if (!chapterMeta || !questionFiles[chapterId]) throw new Error('Chapter not found');

    const questions = (await questionFiles[chapterId]()).default;

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

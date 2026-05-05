import QuizClient from './QuizClient';
import Link from 'next/link';
import { getChaptersMeta, getQuestionsByChapter } from '@/lib/contentService';

export default async function QuizPage({ params, searchParams }) {
  const resolvedParams = await params;
  const chapterId = resolvedParams.chapterId;
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams.mode || 'practice';

  try {
    const chapters = await getChaptersMeta();
    const chapterMeta = chapters.find(c => c.id.toString() === chapterId.toString());

    if (!chapterMeta) throw new Error('Chapter not found');

    const questions = await getQuestionsByChapter(chapterId);
    
    if (!questions || questions.length === 0) throw new Error('No questions found');

    return (
      <QuizClient 
        chapterId={chapterId} 
        chapterTitle={chapterMeta?.title || `الفصل ${chapterId}`} 
        questions={questions} 
        mode={mode} 
      />
    );
  } catch (error) {
    console.error('Quiz Page Error:', error);
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

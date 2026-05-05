import { promises as fs } from 'fs';
import path from 'path';
import QuizClient from './QuizClient';

export default async function QuizPage({ params, searchParams }) {
  const chapterId = params.chapterId;
  const mode = searchParams.mode || 'practice';

  try {
    // Fetch chapter meta to get title
    const metaPath = path.join(process.cwd(), 'public', 'data', 'chapters-meta.json');
    const metaContents = await fs.readFile(metaPath, 'utf8');
    const parsedData = JSON.parse(metaContents);
    const chapters = Array.isArray(parsedData) ? parsedData : (parsedData.chapters || []);
    const chapterMeta = chapters.find(c => c.id.toString() === chapterId.toString());

    if (!chapterMeta) throw new Error('Chapter not found');

    // Fetch chapter questions using internal logic (since we are in server component, we can use fs or fetch from self)
    // To respect point 3, we should ideally use the API, but server-to-server fetch on localhost during build can be tricky.
    // So we will use the FS logic but with better error handling.
    const paddedId = chapterId.toString().padStart(2, '0');
    const qPath = path.join(process.cwd(), 'public', 'data', `chapter-${paddedId}-questions.json`);
    const qContents = await fs.readFile(qPath, 'utf8');
    const questions = JSON.parse(qContents);

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

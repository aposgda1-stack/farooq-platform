import FinalExamClient from './FinalExamClient';
import { getChaptersMeta, getQuestionsByChapter } from '@/lib/contentService';

export default async function FinalExamPage() {
  try {
    const chapters = await getChaptersMeta();
    let finalExamSet = [];

    for (const chapter of chapters) {
      if (chapter.included === false) continue;
      const id = chapter.id.toString();
      
      const chQs = await getQuestionsByChapter(id);
      if (chQs && chQs.length > 0) {
        const mappedQs = chQs.map((q, idx) => ({
          ...q,
          uniqueId: `ch${id}-q${idx}`,
          chapterName: chapter.title,
          chapter: chapter.id
        }));
        
        const shuffled = [...mappedQs].sort(() => Math.random() - 0.5);
        // Chapter 1, 5, 6 are focus (15 questions each), others are 5
        const isFocus = [1, 5, 6].includes(chapter.id);
        const count = isFocus ? 15 : 5;
        finalExamSet = [...finalExamSet, ...shuffled.slice(0, count)];
      }
    }

    const globallyShuffled = [...finalExamSet].sort(() => Math.random() - 0.5);
    return <FinalExamClient pool={globallyShuffled} />;

  } catch (error) {
    console.error('Final Exam Error:', error);
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-error p-10 text-center">
        <span className="material-symbols-outlined text-6xl mb-4">gpp_maybe</span>
        <h1 className="text-2xl font-bold">خطأ في تحميل الأسئلة</h1>
        <p className="text-on-surface-variant mt-2">حدثت مشكلة أثناء تجهيز الامتحان.</p>
      </div>
    );
  }
}

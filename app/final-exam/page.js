import FinalExamClient from './FinalExamClient';

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

export default async function FinalExamPage() {
  try {
    const chaptersMeta = (await import('@/data/chapters-meta.json')).default;
    const chapters = Array.isArray(chaptersMeta) ? chaptersMeta : (chaptersMeta.chapters || []);
    
    let finalExamSet = [];

    for (const chapter of chapters) {
      if (chapter.included === false) continue;
      const id = chapter.id.toString();
      if (questionFiles[id]) {
        const chQs = (await questionFiles[id]()).default;
        const mappedQs = chQs.map((q, idx) => ({
          ...q,
          uniqueId: `ch${id}-q${idx}`,
          chapterName: chapter.title,
          chapter: chapter.id
        }));
        
        const shuffled = mappedQs.sort(() => Math.random() - 0.5);
        // Chapter 1, 5, 6 are focus (15 questions each), others are 5
        const isFocus = [1, 5, 6].includes(chapter.id);
        const count = isFocus ? 15 : 5;
        finalExamSet = [...finalExamSet, ...shuffled.slice(0, count)];
      }
    }

    const globallyShuffled = finalExamSet.sort(() => Math.random() - 0.5);
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

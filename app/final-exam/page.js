import { promises as fs } from 'fs';
import path from 'path';
import FinalExamClient from './FinalExamClient';

export const dynamic = 'force-dynamic';

// FIX #4: Add TTL to cache (10 minutes) so it refreshes properly
let globalPoolCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

async function getQuestionsPool() {
  const now = Date.now();
  if (globalPoolCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return globalPoolCache;
  }

  const dataDir = path.join(process.cwd(), 'public', 'data');
  const metaPath = path.join(dataDir, 'chapters-meta.json');
  const metaContent = await fs.readFile(metaPath, 'utf8');
  const parsedData = JSON.parse(metaContent);
  const chapters = Array.isArray(parsedData) ? parsedData : (parsedData.chapters || []);

  const pool = {};

  for (const chapter of chapters) {
    if (chapter.included === false) continue;
    const paddedNum = chapter.id < 10 ? `0${chapter.id}` : `${chapter.id}`;
    const questionsPath = path.join(dataDir, `chapter-${paddedNum}-questions.json`);

    try {
      const fileContent = await fs.readFile(questionsPath, 'utf8');
      const questions = JSON.parse(fileContent);
      pool[chapter.id] = questions.map((q, idx) => ({
        ...q,
        uniqueId: `ch${chapter.id}-q${idx}`,
        chapterName: chapter.title,
        chapter: chapter.id,
        focus: chapter.focus || false
      }));
    } catch {
      console.warn(`Could not load questions for chapter ${paddedNum}`);
    }
  }

  globalPoolCache = pool;
  cacheTimestamp = now;
  return pool;
}

export default async function FinalExamPage() {
  try {
    const pool = await getQuestionsPool();
    let finalExamSet = [];

    Object.keys(pool).forEach(chId => {
      const chQs = [...pool[chId]];
      const shuffled = chQs.sort(() => Math.random() - 0.5);
      const isFocus = chQs[0]?.focus;
      const count = isFocus ? 15 : 5;
      finalExamSet = [...finalExamSet, ...shuffled.slice(0, count)];
    });

    // FIX #20: Limit pool sent to client — only send what's needed (already sliced above)
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

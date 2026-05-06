import { NextResponse } from 'next/server';
import { getChaptersMeta, getQuestionsByChapter } from '@/lib/contentService';

export async function GET() {
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
        const isFocus = [1, 5, 6].includes(chapter.id);
        const count = isFocus ? 15 : 5;
        finalExamSet = [...finalExamSet, ...shuffled.slice(0, count)];
      }
    }

    const globallyShuffled = [...finalExamSet].sort(() => Math.random() - 0.5);
    return NextResponse.json(globallyShuffled);

  } catch (error) {
    console.error('Final Exam Pool Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

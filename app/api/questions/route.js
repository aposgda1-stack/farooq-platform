import { NextResponse } from 'next/server';

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const limit = searchParams.get('limit');
  const shuffle = searchParams.get('shuffle') === 'true';

  if (!chapterId && !limit) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    let allQuestions = [];
    
    if (chapterId && questionFiles[chapterId]) {
      const q = (await questionFiles[chapterId]()).default;
      allQuestions = [...q];
    } else {
      // Load all questions for final exam/speed mode
      const activeChapterIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '13'];
      
      for (const id of activeChapterIds) {
        if (questionFiles[id]) {
          const q = (await questionFiles[id]()).default;
          allQuestions = [...allQuestions, ...q];
        }
      }
    }

    if (shuffle) {
      allQuestions = allQuestions.sort(() => 0.5 - Math.random());
    }

    if (limit) {
      allQuestions = allQuestions.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json(allQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}

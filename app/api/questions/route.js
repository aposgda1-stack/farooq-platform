import { NextResponse } from 'next/server';
import { getQuestionsByChapter, getAllQuestions } from '@/lib/contentService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const limit = searchParams.get('limit');
  const shuffle = searchParams.get('shuffle') === 'true';

  if (!chapterId && !limit) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    let questions = [];
    
    if (chapterId) {
      questions = await getQuestionsByChapter(chapterId);
    } else {
      questions = await getAllQuestions();
    }

    if (shuffle) {
      questions = [...questions].sort(() => 0.5 - Math.random());
    }

    if (limit) {
      questions = questions.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}

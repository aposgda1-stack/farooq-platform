import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const limit = searchParams.get('limit');
  const shuffle = searchParams.get('shuffle') === 'true';

  if (!chapterId && !limit) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    let allQuestions = [];
    
    if (chapterId) {
      const paddedId = chapterId.padStart(2, '0');
      const filePath = path.join(dataDir, `chapter-${paddedId}-questions.json`);
      const content = await fs.readFile(filePath, 'utf8');
      allQuestions = JSON.parse(content);
    } else {
      // Load all questions for final exam/speed mode
      const files = await fs.readdir(dataDir);
      const questionFiles = files.filter(f => f.startsWith('chapter-') && f.endsWith('-questions.json'));
      
      for (const file of questionFiles) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf8');
        allQuestions = [...allQuestions, ...JSON.parse(content)];
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

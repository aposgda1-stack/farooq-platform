import { promises as fs } from 'fs';
import path from 'path';
import SpeedClient from './SpeedClient';

export default async function SpeedModePage() {
  // Read all chapter question files and pick 10 random questions
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const files = await fs.readdir(dataDir);
  const questionFiles = files.filter(f => f.startsWith('chapter-') && f.endsWith('-questions.json'));
  
  let allQuestions = [];
  
  for (const file of questionFiles) {
    const chapterId = file.split('-')[1]; // Extracts "01", "02", etc.
    const qContents = await fs.readFile(path.join(dataDir, file), 'utf8');
    const questions = JSON.parse(qContents);
    
    questions.forEach(q => {
      allQuestions.push({
        ...q,
        chapterId
      });
    });
  }

  // Shuffle and pick 10
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 10);

  return <SpeedClient initialQuestions={selectedQuestions} />;
}

import SpeedClient from './SpeedClient';
import { getAllQuestions } from '@/lib/contentService';

export default async function SpeedModePage() {
  const allQuestions = await getAllQuestions();

  // Shuffle and pick 10
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 10);

  return <SpeedClient initialQuestions={selectedQuestions} />;
}

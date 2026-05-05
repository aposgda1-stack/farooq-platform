import SpeedClient from './SpeedClient';

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

export default async function SpeedModePage() {
  let allQuestions = [];
  
  const activeChapterIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '13'];

  for (const id of activeChapterIds) {
    if (questionFiles[id]) {
      const q = (await questionFiles[id]()).default;
      q.forEach(item => {
        allQuestions.push({
          ...item,
          chapterId: id
        });
      });
    }
  }

  // Shuffle and pick 10
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 10);

  return <SpeedClient initialQuestions={selectedQuestions} />;
}

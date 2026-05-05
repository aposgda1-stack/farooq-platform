// Centralized service to handle all question and chapter data loading
// This matches the pattern in the scratch project while adapting to multi-file JSON structure

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

export async function getChaptersMeta() {
  try {
    const meta = (await import('@/data/chapters-meta.json')).default;
    return Array.isArray(meta) ? meta : (meta.chapters || []);
  } catch (error) {
    console.error('Error loading chapters meta:', error);
    return [];
  }
}

export async function getQuestionsByChapter(chapterId) {
  try {
    if (!questionFiles[chapterId]) return [];
    const questions = (await questionFiles[chapterId]()).default;
    return questions;
  } catch (error) {
    console.error(`Error loading questions for chapter ${chapterId}:`, error);
    return [];
  }
}

export async function getAllQuestions() {
  try {
    const activeChapterIds = Object.keys(questionFiles);
    let allQuestions = [];
    
    for (const id of activeChapterIds) {
      const q = await getQuestionsByChapter(id);
      allQuestions = [...allQuestions, ...q];
    }
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading all questions:', error);
    return [];
  }
}

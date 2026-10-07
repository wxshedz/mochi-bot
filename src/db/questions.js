import { QuestionUsed } from './schema.js';

/**
 * Mark a question as used
 * @param {string} question - The question text
 */
export async function markQuestionAsUsed(question) {
  await QuestionUsed.create({ question });
}

/**
 * Get all used questions
 * @returns {Promise<array>} Array of used question texts
 */
export async function getUsedQuestions() {
  const questions = await QuestionUsed.find().lean();
  return questions.map((q) => q.question);
}

/**
 * Clear all used questions (for rotation reset)
 */
export async function clearUsedQuestions() {
  await QuestionUsed.deleteMany({});
}

/**
 * Get count of used questions
 * @returns {Promise<number>} Number of used questions
 */
export async function getUsedQuestionCount() {
  return await QuestionUsed.countDocuments();
}

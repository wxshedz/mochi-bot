import { processXP } from '../services/levels.js';

export const name = 'messageCreate';

export async function execute(message) {
  // Ignore bots and DMs
  if (message.author.bot || !message.guild) return;

  // Process XP gain
  try {
    await processXP(message);
  } catch (error) {
    console.error('✧ error processing XP:', error);
  }
}

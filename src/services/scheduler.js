import cron from 'node-cron';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config.js';
import {
  markQuestionAsUsed,
  getUsedQuestions,
  clearUsedQuestions,
  getUsedQuestionCount,
} from '../db/questions.js';
import { getTopChatters, resetWeeklyMessages } from '../db/users.js';
import { getDailyQuestionMessage, getTopChatterMessage } from './personality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dailyQuestionCron = null;
let topChatterCron = null;

/**
 * Load questions from JSON file
 * @returns {array} Array of questions
 */
function loadQuestions() {
  try {
    const questionsPath = join(__dirname, '../data/questions.json');
    const questionsData = readFileSync(questionsPath, 'utf-8');
    return JSON.parse(questionsData);
  } catch (error) {
    console.error('✧ failed to load questions.json:', error);
    return [];
  }
}

/**
 * Get a random unused question
 * @returns {Promise<string|null>} Question text or null if none available
 */
async function getNextQuestion() {
  const allQuestions = loadQuestions();
  const usedQuestions = await getUsedQuestions();
  const usedCount = await getUsedQuestionCount();

  // If all questions have been used, reset
  if (usedCount >= allQuestions.length) {
    console.log('✧ all questions used, resetting rotation');
    await clearUsedQuestions();
    return getNextQuestion();
  }

  // Filter out used questions
  const availableQuestions = allQuestions.filter((q) => !usedQuestions.includes(q));

  if (availableQuestions.length === 0) {
    console.error('✧ no questions available');
    return null;
  }

  // Pick a random question
  const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  return question;
}

/**
 * Post daily question
 * @param {object} client - Discord client
 */
async function postDailyQuestion(client) {
  try {
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error('✧ guild not found for daily question');
      return;
    }

    const channel = guild.channels.cache.get(config.channels.dailyQuestion);
    if (!channel) {
      console.error('✧ daily question channel not found');
      return;
    }

    const question = await getNextQuestion();
    if (!question) {
      console.error('✧ no question available to post');
      return;
    }

    await markQuestionAsUsed(question);

    const message = getDailyQuestionMessage(question);
    let content = message;

    if (config.roles.dailyQuestionPing) {
      content = `<@&${config.roles.dailyQuestionPing}>\n\n${message}`;
    }

    await channel.send(content);

    console.log(`✧ posted daily question: ${question.substring(0, 50)}...`);
  } catch (error) {
    console.error('✧ error posting daily question:', error);
  }
}

/**
 * Announce weekly top chatter
 * @param {object} client - Discord client
 */
async function announceTopChatter(client) {
  try {
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error('✧ guild not found for top chatter');
      return;
    }

    const channel = guild.channels.cache.get(config.channels.topChatter);
    if (!channel) {
      console.error('✧ top chatter channel not found');
      return;
    }

    const topChatters = await getTopChatters(1);

    if (topChatters.length === 0 || topChatters[0].weeklyMessages === 0) {
      console.log('✧ no top chatter this week (no messages)');
      await resetWeeklyMessages();
      return;
    }

    const winner = topChatters[0];
    const messageCount = winner.weeklyMessages;

    let user;
    try {
      user = await client.users.fetch(winner.userId);
    } catch (error) {
      console.error('✧ could not fetch top chatter user:', error);
      await resetWeeklyMessages();
      return;
    }

    const topChatterRoleId = config.roles.topChatter;
    if (topChatterRoleId) {
      const membersWithRole = guild.members.cache.filter((member) =>
        member.roles.cache.has(topChatterRoleId)
      );

      for (const [_, member] of membersWithRole) {
        try {
          await member.roles.remove(topChatterRoleId);
          console.log(`✧ removed top chatter role from ${member.user.tag}`);
        } catch (error) {
          console.error(`✧ failed to remove top chatter role from ${member.user.tag}:`, error.message);
        }
      }

      try {
        const member = await guild.members.fetch(winner.userId);
        await member.roles.add(topChatterRoleId);
        console.log(`✧ assigned top chatter role to ${user.tag}`);
      } catch (error) {
        console.error(`✧ failed to assign top chatter role to ${user.tag}:`, error.message);
      }
    }

    const message = getTopChatterMessage(user, messageCount);
    await channel.send(message);

    console.log(`✧ announced top chatter: ${user.tag} (${messageCount} messages)`);

    await resetWeeklyMessages();
  } catch (error) {
    console.error('✧ error announcing top chatter:', error);
  }
}

/**
 * Start all scheduled tasks
 * @param {object} client - Discord client
 */
export function startScheduledTasks(client) {
  // Get cron schedules from config
  const dailyQuestionSchedule = config.cron?.dailyQuestion || '0 18 * * *';
  const topChatterSchedule = config.cron?.topChatter || '0 20 * * 0';

  // Validate cron expressions
  if (!cron.validate(dailyQuestionSchedule)) {
    console.error(`✧ invalid daily question cron schedule: ${dailyQuestionSchedule}`);
    return;
  }

  if (!cron.validate(topChatterSchedule)) {
    console.error(`✧ invalid top chatter cron schedule: ${topChatterSchedule}`);
    return;
  }

  dailyQuestionCron = cron.schedule(
    dailyQuestionSchedule,
    () => {
      postDailyQuestion(client);
    },
    {
      scheduled: true,
      timezone: config.timezone || 'Europe/Madrid',
    }
  );

  topChatterCron = cron.schedule(
    topChatterSchedule,
    () => {
      announceTopChatter(client);
    },
    {
      scheduled: true,
      timezone: config.timezone || 'Europe/Madrid',
    }
  );

  console.log(`✧ scheduled daily question: ${dailyQuestionSchedule} (${config.timezone})`);
  console.log(`✧ scheduled top chatter: ${topChatterSchedule} (${config.timezone})`);
}

/**
 * Stop all scheduled tasks
 */
export function stopScheduledTasks() {
  if (dailyQuestionCron) {
    dailyQuestionCron.stop();
    dailyQuestionCron = null;
  }

  if (topChatterCron) {
    topChatterCron.stop();
    topChatterCron = null;
  }

  console.log('✧ stopped all scheduled tasks');
}

/**
 * Manually trigger daily question (for testing or manual use)
 * @param {object} client - Discord client
 */
export async function triggerDailyQuestion(client) {
  await postDailyQuestion(client);
}

/**
 * Manually trigger top chatter announcement (for testing or manual use)
 * @param {object} client - Discord client
 */
export async function triggerTopChatter(client) {
  await announceTopChatter(client);
}

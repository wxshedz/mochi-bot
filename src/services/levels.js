import config from '../config.js';
import {
  getUser,
  updateUserXP,
  updateLastXPTime,
  incrementWeeklyMessages,
} from '../db/users.js';
import { getLevelUpMessage } from './personality.js';

/**
 * Calculate XP required for a specific level
 * Formula: a * level^2 + b * level + c
 * @param {number} level - Target level
 * @returns {number} XP required
 */
export function calculateXPForLevel(level) {
  const { a, b, c } = config.levelFormula;
  return a * level * level + b * level + c;
}

/**
 * Get level roles configuration
 * @returns {object} Map of level thresholds to role IDs
 */
export function getLevelRoles() {
  return config.roles.levelRoles || {};
}

/**
 * Get the appropriate level role for a given level
 * @param {number} level - User's current level
 * @returns {string|null} Role ID or null
 */
export function getRoleForLevel(level) {
  const levelRoles = getLevelRoles();
  const sortedLevels = Object.keys(levelRoles)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of sortedLevels) {
    if (level >= threshold) {
      return levelRoles[threshold];
    }
  }

  return null;
}

/**
 * Update user's level roles (remove old, add new)
 * @param {object} member - Discord guild member
 * @param {number} newLevel - New level reached
 */
async function updateLevelRoles(member, newLevel) {
  try {
    const levelRoles = getLevelRoles();
    const allLevelRoleIds = Object.values(levelRoles);
    const newRoleId = getRoleForLevel(newLevel);

    const rolesToRemove = member.roles.cache.filter((role) =>
      allLevelRoleIds.includes(role.id)
    );

    if (rolesToRemove.size > 0) {
      await member.roles.remove(rolesToRemove);
    }

    if (newRoleId) {
      const newRole = member.guild.roles.cache.get(newRoleId);
      if (newRole) {
        await member.roles.add(newRole);
        console.log(`✧ assigned level ${newLevel} role to ${member.user.tag}`);
      } else {
        console.error(`✧ level role ${newRoleId} not found`);
      }
    }
  } catch (error) {
    console.error(`✧ failed to update level roles for ${member.user.tag}:`, error.message);
    console.error('   make sure the bot role is above all level roles in the role hierarchy');
  }
}

/**
 * Process XP gain from a message
 * @param {object} message - Discord message object
 */
export async function processXP(message) {
  const userId = message.author.id;
  const channelId = message.channel.id;

  const ignoredChannels = config.xp?.ignoredChannels || [];
  if (ignoredChannels.includes(channelId)) {
    return;
  }

  const userData = await getUser(userId);
  const now = Math.floor(Date.now() / 1000);

  const cooldown = config.xp?.cooldown || 60;
  if (now - userData.lastXpTime < cooldown) {
    return;
  }

  const minXP = config.xp?.min || 15;
  const maxXP = config.xp?.max || 25;
  const xpGain = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;

  const newXP = userData.xp + xpGain;
  let newLevel = userData.level;

  let leveledUp = false;
  while (newXP >= calculateXPForLevel(newLevel + 1)) {
    newLevel++;
    leveledUp = true;
  }

  await updateUserXP(userId, newXP, newLevel);
  await updateLastXPTime(userId, now);
  await incrementWeeklyMessages(userId);

  if (leveledUp) {
    try {
      const member = await message.guild.members.fetch(userId);
      await updateLevelRoles(member, newLevel);

      const levelUpMsg = getLevelUpMessage(message.author, newLevel);
      await message.channel.send(levelUpMsg);

      console.log(`✧ ${message.author.tag} leveled up to level ${newLevel}`);
    } catch (error) {
      console.error('✧ error handling level up:', error);
    }
  }
}

/**
 * Get user's current level progress
 * @param {string} userId - Discord user ID
 * @returns {Promise<object>} Level progress data
 */
export async function getLevelProgress(userId) {
  const userData = await getUser(userId);
  const currentLevelXP = calculateXPForLevel(userData.level);
  const nextLevelXP = calculateXPForLevel(userData.level + 1);
  const progressXP = userData.xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  const percentage = (progressXP / requiredXP) * 100;

  return {
    level: userData.level,
    xp: userData.xp,
    currentLevelXP,
    nextLevelXP,
    progressXP,
    requiredXP,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}

import { User } from './schema.js';

/**
 * Get or create a user in the database
 * @param {string} userId - Discord user ID
 * @returns {Promise<object>} User data
 */
export async function getUser(userId) {
  let user = await User.findOne({ userId });

  if (!user) {
    user = await User.create({ userId });
  }

  return user;
}

/**
 * Update user XP and level
 * @param {string} userId - Discord user ID
 * @param {number} xp - New XP amount
 * @param {number} level - New level
 */
export async function updateUserXP(userId, xp, level) {
  await User.updateOne({ userId }, { xp, level });
}

/**
 * Update last XP time for cooldown tracking
 * @param {string} userId - Discord user ID
 * @param {number} timestamp - Unix timestamp
 */
export async function updateLastXPTime(userId, timestamp) {
  await User.updateOne({ userId }, { lastXpTime: timestamp });
}

/**
 * Increment weekly message count
 * @param {string} userId - Discord user ID
 */
export async function incrementWeeklyMessages(userId) {
  await getUser(userId);
  await User.updateOne({ userId }, { $inc: { weeklyMessages: 1 } });
}

/**
 * Get top chatters for the week
 * @param {number} limit - Number of top chatters to return
 * @returns {Promise<array>} Array of user data sorted by weekly messages
 */
export async function getTopChatters(limit = 10) {
  return await User.find({ weeklyMessages: { $gt: 0 } })
    .sort({ weeklyMessages: -1 })
    .limit(limit)
    .lean();
}

/**
 * Reset all weekly message counts
 */
export async function resetWeeklyMessages() {
  await User.updateMany({}, { weeklyMessages: 0 });
}

/**
 * Get leaderboard of users by XP
 * @param {number} limit - Number of users to return
 * @returns {Promise<array>} Array of top users
 */
export async function getLeaderboard(limit = 10) {
  return await User.find()
    .sort({ xp: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get user rank by XP
 * @param {string} userId - Discord user ID
 * @returns {Promise<number>} User's rank position
 */
export async function getUserRank(userId) {
  const user = await User.findOne({ userId });
  if (!user) return null;

  const rank = await User.countDocuments({ xp: { $gt: user.xp } });
  return rank + 1;
}

import { Giveaway } from './schema.js';

/**
 * Create a new giveaway
 * @param {object} data - Giveaway data
 * @returns {Promise<object>} Created giveaway
 */
export async function createGiveaway(data) {
  const { messageId, channelId, prize, winnerCount, endTime, hostId } = data;
  const giveaway = await Giveaway.create({
    messageId,
    channelId,
    prize,
    winnerCount,
    endTime,
    hostId,
    entries: [],
  });
  return giveaway;
}

/**
 * Get giveaway by message ID
 * @param {string} messageId - Discord message ID
 * @returns {Promise<object|null>} Giveaway data
 */
export async function getGiveawayByMessageId(messageId) {
  return await Giveaway.findOne({ messageId }).lean();
}

/**
 * Get giveaway by ID
 * @param {string} giveawayId - Giveaway ID
 * @returns {Promise<object|null>} Giveaway data
 */
export async function getGiveaway(giveawayId) {
  return await Giveaway.findById(giveawayId).lean();
}

/**
 * Get all active giveaways (not ended)
 * @returns {Promise<array>} Array of active giveaways
 */
export async function getActiveGiveaways() {
  return await Giveaway.find({ ended: false }).lean();
}

/**
 * Mark giveaway as ended
 * @param {string} giveawayId - Giveaway ID
 */
export async function endGiveaway(giveawayId) {
  await Giveaway.updateOne({ _id: giveawayId }, { ended: true });
}

/**
 * Add a user entry to a giveaway
 * @param {string} giveawayId - Giveaway ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} Success status
 */
export async function enterGiveaway(giveawayId, userId) {
  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) return false;
  
  if (giveaway.entries.includes(userId)) {
    return false; // Already entered
  }
  
  giveaway.entries.push(userId);
  await giveaway.save();
  return true;
}

/**
 * Remove a user entry from a giveaway
 * @param {string} giveawayId - Giveaway ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} Success status
 */
export async function leaveGiveaway(giveawayId, userId) {
  const result = await Giveaway.updateOne(
    { _id: giveawayId },
    { $pull: { entries: userId } }
  );
  return result.modifiedCount > 0;
}

/**
 * Get all entries for a giveaway
 * @param {string} giveawayId - Giveaway ID
 * @returns {Promise<array>} Array of user IDs
 */
export async function getGiveawayEntries(giveawayId) {
  const giveaway = await Giveaway.findById(giveawayId);
  return giveaway ? giveaway.entries : [];
}

/**
 * Get entry count for a giveaway
 * @param {string} giveawayId - Giveaway ID
 * @returns {Promise<number>} Number of entries
 */
export async function getGiveawayEntryCount(giveawayId) {
  const giveaway = await Giveaway.findById(giveawayId);
  return giveaway ? giveaway.entries.length : 0;
}

/**
 * Check if user has entered a giveaway
 * @param {string} giveawayId - Giveaway ID
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} Whether user has entered
 */
export async function hasUserEntered(giveawayId, userId) {
  const giveaway = await Giveaway.findById(giveawayId);
  return giveaway ? giveaway.entries.includes(userId) : false;
}

/**
 * Delete a giveaway
 * @param {string} giveawayId - Giveaway ID
 */
export async function deleteGiveaway(giveawayId) {
  await Giveaway.deleteOne({ _id: giveawayId });
}

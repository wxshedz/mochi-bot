import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config.js';
import {
  createGiveaway,
  getGiveawayByMessageId,
  getGiveawayEntries,
  enterGiveaway,
  leaveGiveaway,
  endGiveaway,
  hasUserEntered,
  getGiveawayEntryCount,
  getActiveGiveaways,
} from '../db/giveaways.js';
import { getGiveawayStartMessage, getGiveawayEndMessage } from './personality.js';

export function parseDuration(durationStr) {
  const regex = /(\d+)([dhm])/g;
  let totalMs = 0;
  let match;

  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        totalMs += value * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        totalMs += value * 60 * 60 * 1000;
        break;
      case 'm':
        totalMs += value * 60 * 1000;
        break;
    }
  }

  return totalMs;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function createGiveawayEmbed(prize, endTime, winners, entries) {
  const endTimestamp = Math.floor(endTime / 1000);
  const message = getGiveawayStartMessage(prize, `<t:${endTimestamp}:R>`, winners);

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('giveaway!')
    .setDescription(message)
    .addFields({ name: 'entries', value: `${entries}`, inline: true })
    .setFooter({ text: 'mochi - velvetmoon' })
    .setTimestamp(endTime);
}

function createGiveawayButton(giveawayId) {
  const button = new ButtonBuilder()
    .setCustomId(`giveaway_enter_${giveawayId}`)
    .setLabel('join giveaway')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🎁');

  return new ActionRowBuilder().addComponents(button);
}

export async function startGiveaway(interaction, prize, duration, winners) {
  const durationMs = parseDuration(duration);

  if (!durationMs || durationMs < 60000) {
    await interaction.reply({
      content: 'mochi needs a duration of at least 1 minute (use format like: 1h, 30m, 1d)',
      ephemeral: true,
    });
    return;
  }

  const endTime = Date.now() + durationMs;
  const embed = createGiveawayEmbed(prize, endTime, winners, 0);

  const giveawayChannel = interaction.guild.channels.cache.get(config.channels.giveaways);

  if (!giveawayChannel) {
    await interaction.reply({
      content: 'mochi could not find the giveaways channel',
      ephemeral: true,
    });
    return;
  }

  let content = '';
  if (config.roles.giveawayPing) {
    content = `<@&${config.roles.giveawayPing}>`;
  }

  const giveawayMessage = await giveawayChannel.send({
    content,
    embeds: [embed],
  });

  const giveaway = await createGiveaway({
    messageId: giveawayMessage.id,
    channelId: giveawayChannel.id,
    prize,
    winnerCount: winners,
    endTime: Math.floor(endTime / 1000),
    hostId: interaction.user.id,
  });

  const button = createGiveawayButton(giveaway._id.toString());
  await giveawayMessage.edit({
    content,
    embeds: [embed],
    components: [button],
  });

  await interaction.reply({
    content: `giveaway created! it ends in ${formatDuration(durationMs)}`,
    ephemeral: true,
  });

  setTimeout(() => {
    finishGiveaway(interaction.client, giveaway._id.toString());
  }, durationMs);

  console.log(`giveaway created: ${prize} (${winners} winners, ends in ${formatDuration(durationMs)})`);
}

export async function handleGiveawayButton(interaction) {
  const [_action, _type, giveawayIdStr] = interaction.customId.split('_');

  const giveaway = await getGiveawayByMessageId(interaction.message.id);

  if (!giveaway) {
    await interaction.reply({
      content: 'mochi could not find this giveaway',
      ephemeral: true,
    });
    return;
  }

  if (giveaway.ended) {
    await interaction.reply({
      content: 'this giveaway has already ended!',
      ephemeral: true,
    });
    return;
  }

  const alreadyEntered = await hasUserEntered(giveaway._id.toString(), interaction.user.id);

  if (alreadyEntered) {
    await leaveGiveaway(giveaway._id.toString(), interaction.user.id);
    await interaction.reply({
      content: 'you left the giveaway',
      ephemeral: true,
    });
  } else {
    await enterGiveaway(giveaway._id.toString(), interaction.user.id);
    await interaction.reply({
      content: 'you entered the giveaway! mochi is rooting for you',
      ephemeral: true,
    });
  }

  const entryCount = await getGiveawayEntryCount(giveaway._id.toString());
  const embed = createGiveawayEmbed(
    giveaway.prize,
    giveaway.endTime * 1000,
    giveaway.winnerCount,
    entryCount
  );
  const button = createGiveawayButton(giveaway._id.toString());

  await interaction.message.edit({
    embeds: [embed],
    components: [button],
  });
}

export async function finishGiveaway(client, giveawayId) {
  const { getGiveaway } = await import('../db/giveaways.js');
  const giveaway = await getGiveaway(giveawayId);

  if (!giveaway || giveaway.ended) {
    return;
  }

  await endGiveaway(giveawayId);

  const channel = await client.channels.fetch(giveaway.channelId);
  if (!channel) return;

  const message = await channel.messages.fetch(giveaway.messageId);
  if (!message) return;

  const entries = await getGiveawayEntries(giveawayId);
  const winners = [];

  if (entries.length > 0) {
    const winnerCount = Math.min(giveaway.winnerCount, entries.length);
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    winners.push(...shuffled.slice(0, winnerCount));
  }

  const winnerMentions = winners.map((userId) => `<@${userId}>`);

  const endMessage = getGiveawayEndMessage(giveaway.prize, winnerMentions);
  await channel.send(endMessage);

  const endedEmbed = new EmbedBuilder()
    .setColor('#808080')
    .setTitle('giveaway ended!')
    .setDescription(`**prize:** ${giveaway.prize}\n**winners:** ${winnerMentions.join(', ') || 'none'}\n\nthis giveaway has ended`)
    .setFooter({ text: 'mochi - velvetmoon' })
    .setTimestamp();

  await message.edit({
    embeds: [endedEmbed],
    components: [],
  });

  console.log(`giveaway ended: ${giveaway.prize} (${winners.length} winners)`);
}

export async function rerollGiveaway(interaction, messageId) {
  const giveaway = await getGiveawayByMessageId(messageId);

  if (!giveaway) {
    await interaction.reply({
      content: 'mochi could not find that giveaway',
      ephemeral: true,
    });
    return;
  }

  if (!giveaway.ended) {
    await interaction.reply({
      content: 'that giveaway has not ended yet!',
      ephemeral: true,
    });
    return;
  }

  const entries = await getGiveawayEntries(giveaway._id.toString());

  if (entries.length === 0) {
    await interaction.reply({
      content: 'no one entered that giveaway',
      ephemeral: true,
    });
    return;
  }

  const winnerCount = Math.min(giveaway.winnerCount, entries.length);
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, winnerCount);
  const winnerMentions = winners.map((userId) => `<@${userId}>`);

  await interaction.reply(
    `rerolled! new winner${winners.length > 1 ? 's' : ''}: ${winnerMentions.join(', ')}`
  );
}

export async function restoreGiveaways(client) {
  const activeGiveaways = await getActiveGiveaways();

  for (const giveaway of activeGiveaways) {
    const endTime = giveaway.endTime * 1000;
    const timeLeft = endTime - Date.now();

    if (timeLeft > 0) {
      setTimeout(() => {
        finishGiveaway(client, giveaway._id.toString());
      }, timeLeft);
      console.log(`restored giveaway: ${giveaway.prize} (ends in ${formatDuration(timeLeft)})`);
    } else {
      finishGiveaway(client, giveaway._id.toString());
    }
  }
}

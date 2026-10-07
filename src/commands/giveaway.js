import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { startGiveaway, rerollGiveaway, finishGiveaway } from '../services/giveaways.js';
import { getGiveawayByMessageId } from '../db/giveaways.js';
import config from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('manage giveaways')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('start')
      .setDescription('start a new giveaway')
      .addStringOption((option) =>
        option.setName('prize').setDescription('what are you giving away?').setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('duration')
          .setDescription('how long should it last? (e.g., 1h, 30m, 1d)')
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName('winners')
          .setDescription('how many winners?')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('end')
      .setDescription('end a giveaway early')
      .addStringOption((option) =>
        option
          .setName('message_id')
          .setDescription('the giveaway message id')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('reroll')
      .setDescription('reroll giveaway winners')
      .addStringOption((option) =>
        option
          .setName('message_id')
          .setDescription('the giveaway message id')
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  // Check if user has staff role
  const staffRoleId = config.roles.staff;
  const member = interaction.member;

  if (!member.roles.cache.has(staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: 'mochi says only staff can manage giveaways',
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'start') {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');

    await startGiveaway(interaction, prize, duration, winners);
  } else if (subcommand === 'end') {
    const messageId = interaction.options.getString('message_id');
    const giveaway = await getGiveawayByMessageId(messageId);

    if (!giveaway) {
      await interaction.reply({
        content: 'mochi could not find that giveaway',
        ephemeral: true,
      });
      return;
    }

    if (giveaway.ended) {
      await interaction.reply({
        content: 'that giveaway has already ended!',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: 'ending the giveaway now...',
      ephemeral: true,
    });

    await finishGiveaway(interaction.client, giveaway._id.toString());
  } else if (subcommand === 'reroll') {
    const messageId = interaction.options.getString('message_id');
    await rerollGiveaway(interaction, messageId);
  }
}

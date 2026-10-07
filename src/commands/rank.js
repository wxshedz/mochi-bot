import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, getUserRank } from '../db/users.js';
import { calculateXPForLevel } from '../services/levels.js';
import { getRankDescription } from '../services/personality.js';
import config from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('check your level and xp progress')
  .addUserOption((option) =>
    option.setName('user').setDescription('the user to check (optional)').setRequired(false)
  );

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const userData = await getUser(targetUser.id);
  const rank = await getUserRank(targetUser.id);

  if (!rank) {
    await interaction.reply({
      content: 'hmm, mochi could not find that users rank',
      ephemeral: true,
    });
    return;
  }

  const nextLevelXP = calculateXPForLevel(userData.level + 1);
  const description = getRankDescription(userData.xp, userData.level, nextLevelXP, rank);

  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setAuthor({
      name: `${targetUser.username}'s rank`,
      iconURL: targetUser.displayAvatarURL(),
    })
    .setDescription(description)
    .setFooter({ text: 'mochi - velvetmoon' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLeaderboard } from '../db/users.js';
import config from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('see the top members by xp');

export async function execute(interaction) {
  const topUsers = await getLeaderboard(10);

  if (topUsers.length === 0) {
    await interaction.reply({
      content: 'no one has earned xp yet... mochi is waiting',
      ephemeral: true,
    });
    return;
  }

  const leaderboardText = await Promise.all(
    topUsers.map(async (userData, index) => {
      try {
        const user = await interaction.client.users.fetch(userData.userId);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        return `${medal} **${user.username}** — level ${userData.level} (${userData.xp.toLocaleString()} xp)`;
      } catch (error) {
        return `${index + 1}. Unknown User — level ${userData.level} (${userData.xp.toLocaleString()} xp)`;
      }
    })
  );

  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('velvetmoon leaderboard')
    .setDescription(leaderboardText.join('\n'))
    .setFooter({ text: 'mochi - velvetmoon' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

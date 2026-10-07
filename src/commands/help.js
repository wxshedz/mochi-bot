import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('see all of mochi\'s commands');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('✧ mochi\'s command list')
    .setDescription('here\'s everything mochi can help you with! ♡')
    .addFields(
      {
        name: '☾ leveling & xp',
        value:
          '`/rank [user]` — check your level and xp progress\n' +
          '`/leaderboard` — see the top members by xp',
        inline: false,
      },
      {
        name: '🎁 giveaways (staff only)',
        value:
          '`/giveaway start <prize> <duration> <winners>` — start a new giveaway\n' +
          '`/giveaway end <message_id>` — end a giveaway early\n' +
          '`/giveaway reroll <message_id>` — reroll giveaway winners',
        inline: false,
      },
      {
        name: '☁︎ daily questions (staff only)',
        value: '`/question add <question>` — add a new daily question to the rotation',
        inline: false,
      },
      {
        name: '📋 server management (staff only)',
        value: '`/rules` — send the server rules to the rules channel',
        inline: false,
      },
      {
        name: '✨ fun & utility',
        value:
          '`/mochi` — mochi says something cute\n' +
          '`/help` — shows this message',
        inline: false,
      }
    )
    .addFields({
      name: '🌙 about mochi',
      value:
        'mochi is here to keep velvetmoon cozy! you earn xp by chatting, and mochi tracks weekly activity too. ' +
        'every day, mochi asks a question to spark conversation. on sundays, the top chatter gets a special role ౨ৎ',
      inline: false,
    })
    .setFooter({ text: 'mochi 🍡 · velvetmoon' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

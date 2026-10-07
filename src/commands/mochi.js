import { SlashCommandBuilder } from 'discord.js';
import { getRandomMochiPhrase } from '../services/personality.js';

export const data = new SlashCommandBuilder()
  .setName('mochi')
  .setDescription('mochi says something cute');

export async function execute(interaction) {
  const phrase = getRandomMochiPhrase();
  await interaction.reply(phrase);
}

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const data = new SlashCommandBuilder()
  .setName('question')
  .setDescription('manage daily questions')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('add a new daily question')
      .addStringOption((option) =>
        option.setName('question').setDescription('the question to add').setRequired(true)
      )
  );

export async function execute(interaction) {
  const staffRoleId = config.roles.staff;
  const member = interaction.member;

  if (!member.roles.cache.has(staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: 'mochi says only staff can manage questions',
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'add') {
    const newQuestion = interaction.options.getString('question');

    try {
      const questionsPath = join(__dirname, '../data/questions.json');
      const questionsData = readFileSync(questionsPath, 'utf-8');
      const questions = JSON.parse(questionsData);

      if (questions.includes(newQuestion)) {
        await interaction.reply({
          content: 'that question already exists!',
          ephemeral: true,
        });
        return;
      }

      questions.push(newQuestion);

      writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

      await interaction.reply({
        content: `added new question! mochi now has ${questions.length} questions total`,
        ephemeral: true,
      });

      console.log(`added new question: ${newQuestion.substring(0, 50)}...`);
    } catch (error) {
      console.error('error adding question:', error);
      await interaction.reply({
        content: 'oops, mochi could not add that question',
        ephemeral: true,
      });
    }
  }
}

import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  PermissionFlagsBits 
} from 'discord.js';
import config from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('reactionroles')
  .setDescription('manage reaction roles')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('send')
      .setDescription('send a reaction role panel')
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('which panel to send')
          .setRequired(true)
          .addChoices(
            { name: 'Pronouns', value: 'pronouns' },
            { name: 'Colors', value: 'colors' },
            { name: 'Notifications', value: 'notifications' },
            { name: 'Interests', value: 'interests' },
            { name: 'All Roles (combined)', value: 'all' }
          )
      )
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('channel to send the panel to (current channel if not specified)')
          .setRequired(false)
      )
  );

export async function execute(interaction) {
  const staffRoleId = config.roles.staff;
  const member = interaction.member;

  if (!member.roles.cache.has(staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: 'mochi says only staff can manage reaction roles',
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'send') {
    const type = interaction.options.getString('type');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      let embed, rows;

      switch (type) {
        case 'pronouns':
          ({ embed, rows } = createPronounsPanel());
          break;
        case 'colors':
          ({ embed, rows } = createColorsPanel());
          break;
        case 'notifications':
          ({ embed, rows } = createNotificationsPanel());
          break;
        case 'interests':
          ({ embed, rows } = createInterestsPanel());
          break;
        case 'all':
          ({ embed, rows } = createAllRolesPanel());
          break;
      }

      await targetChannel.send({ embeds: [embed], components: rows });

      await interaction.reply({
        content: `reaction role panel sent to ${targetChannel}`,
        ephemeral: true,
      });

      console.log(`${type} reaction role panel sent to ${targetChannel.name} by ${interaction.user.tag}`);
    } catch (error) {
      console.error('error sending reaction role panel:', error);
      await interaction.reply({
        content: 'oops, mochi could not send the reaction role panel',
        ephemeral: true,
      });
    }
  }
}

function createPronounsPanel() {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('pronouns')
    .setDescription('select your pronouns from the menu below\n\nyou can select multiple pronouns')
    .setFooter({ text: 'mochi - velvetmoon' });

  const select = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_pronouns')
    .setPlaceholder('choose your pronouns')
    .setMinValues(0)
    .setMaxValues(5)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('she/her')
        .setValue('pronoun_she_her')
        .setEmoji('💖'),
      new StringSelectMenuOptionBuilder()
        .setLabel('he/him')
        .setValue('pronoun_he_him')
        .setEmoji('💙'),
      new StringSelectMenuOptionBuilder()
        .setLabel('they/them')
        .setValue('pronoun_they_them')
        .setEmoji('💜'),
      new StringSelectMenuOptionBuilder()
        .setLabel('any pronouns')
        .setValue('pronoun_any')
        .setEmoji('✨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('ask me')
        .setValue('pronoun_ask')
        .setEmoji('❓')
    );

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, rows: [row] };
}

function createColorsPanel() {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('color roles')
    .setDescription('choose your name color from the menu below\n\nyou can only have one color at a time')
    .setFooter({ text: 'mochi - velvetmoon' });

  const select = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_colors')
    .setPlaceholder('choose your color')
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('red')
        .setValue('color_red')
        .setEmoji('❤️'),
      new StringSelectMenuOptionBuilder()
        .setLabel('orange')
        .setValue('color_orange')
        .setEmoji('🧡'),
      new StringSelectMenuOptionBuilder()
        .setLabel('yellow')
        .setValue('color_yellow')
        .setEmoji('💛'),
      new StringSelectMenuOptionBuilder()
        .setLabel('green')
        .setValue('color_green')
        .setEmoji('💚'),
      new StringSelectMenuOptionBuilder()
        .setLabel('blue')
        .setValue('color_blue')
        .setEmoji('💙'),
      new StringSelectMenuOptionBuilder()
        .setLabel('purple')
        .setValue('color_purple')
        .setEmoji('💜'),
      new StringSelectMenuOptionBuilder()
        .setLabel('pink')
        .setValue('color_pink')
        .setEmoji('💗')
    );

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, rows: [row] };
}

function createNotificationsPanel() {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('notification roles')
    .setDescription('get pinged for events and announcements\n\nselect the notifications you want to receive')
    .setFooter({ text: 'mochi - velvetmoon' });

  const select = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_notifications')
    .setPlaceholder('choose notification roles')
    .setMinValues(0)
    .setMaxValues(3)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('announcements')
        .setDescription('get notified about server announcements')
        .setValue('notif_announcements')
        .setEmoji('📢'),
      new StringSelectMenuOptionBuilder()
        .setLabel('events')
        .setDescription('get notified about community events')
        .setValue('notif_events')
        .setEmoji('🎉'),
      new StringSelectMenuOptionBuilder()
        .setLabel('polls')
        .setDescription('get notified about new polls')
        .setValue('notif_polls')
        .setEmoji('📊')
    );

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, rows: [row] };
}

function createInterestsPanel() {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('interests')
    .setDescription('share your interests with the community\n\nselect all that apply')
    .setFooter({ text: 'mochi - velvetmoon' });

  const select = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_interests')
    .setPlaceholder('choose your interests')
    .setMinValues(0)
    .setMaxValues(8)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('gaming')
        .setDescription('video games and gaming')
        .setValue('interest_gaming')
        .setEmoji('🎮'),
      new StringSelectMenuOptionBuilder()
        .setLabel('art')
        .setDescription('drawing, painting, digital art')
        .setValue('interest_art')
        .setEmoji('🎨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('music')
        .setDescription('music production, listening, instruments')
        .setValue('interest_music')
        .setEmoji('🎵'),
      new StringSelectMenuOptionBuilder()
        .setLabel('anime')
        .setDescription('anime and manga')
        .setValue('interest_anime')
        .setEmoji('✨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('reading')
        .setDescription('books, novels, fanfiction')
        .setValue('interest_reading')
        .setEmoji('📚'),
      new StringSelectMenuOptionBuilder()
        .setLabel('movies')
        .setDescription('films and cinema')
        .setValue('interest_movies')
        .setEmoji('🎬'),
      new StringSelectMenuOptionBuilder()
        .setLabel('coding')
        .setDescription('programming and development')
        .setValue('interest_coding')
        .setEmoji('💻'),
      new StringSelectMenuOptionBuilder()
        .setLabel('photography')
        .setDescription('photography and photo editing')
        .setValue('interest_photography')
        .setEmoji('📸')
    );

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, rows: [row] };
}

function createAllRolesPanel() {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('grab your roles')
    .setDescription(
      'use the menus below to customize your profile\n\n' +
      '**pronouns:** select your pronouns (multiple allowed)\n' +
      '**colors:** choose your name color (one only)\n' +
      '**notifications:** opt in to pings\n' +
      '**interests:** share what you enjoy'
    )
    .setFooter({ text: 'mochi - velvetmoon' });

  const pronounsSelect = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_pronouns')
    .setPlaceholder('pronouns')
    .setMinValues(0)
    .setMaxValues(5)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('she/her')
        .setValue('pronoun_she_her')
        .setEmoji('💖'),
      new StringSelectMenuOptionBuilder()
        .setLabel('he/him')
        .setValue('pronoun_he_him')
        .setEmoji('💙'),
      new StringSelectMenuOptionBuilder()
        .setLabel('they/them')
        .setValue('pronoun_they_them')
        .setEmoji('💜'),
      new StringSelectMenuOptionBuilder()
        .setLabel('any pronouns')
        .setValue('pronoun_any')
        .setEmoji('✨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('ask me')
        .setValue('pronoun_ask')
        .setEmoji('❓')
    );

  const colorsSelect = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_colors')
    .setPlaceholder('name color')
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('red')
        .setValue('color_red')
        .setEmoji('❤️'),
      new StringSelectMenuOptionBuilder()
        .setLabel('orange')
        .setValue('color_orange')
        .setEmoji('🧡'),
      new StringSelectMenuOptionBuilder()
        .setLabel('yellow')
        .setValue('color_yellow')
        .setEmoji('💛'),
      new StringSelectMenuOptionBuilder()
        .setLabel('green')
        .setValue('color_green')
        .setEmoji('💚'),
      new StringSelectMenuOptionBuilder()
        .setLabel('blue')
        .setValue('color_blue')
        .setEmoji('💙'),
      new StringSelectMenuOptionBuilder()
        .setLabel('purple')
        .setValue('color_purple')
        .setEmoji('💜'),
      new StringSelectMenuOptionBuilder()
        .setLabel('pink')
        .setValue('color_pink')
        .setEmoji('💗')
    );

  const notificationsSelect = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_notifications')
    .setPlaceholder('notifications')
    .setMinValues(0)
    .setMaxValues(3)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('announcements')
        .setValue('notif_announcements')
        .setEmoji('📢'),
      new StringSelectMenuOptionBuilder()
        .setLabel('events')
        .setValue('notif_events')
        .setEmoji('🎉'),
      new StringSelectMenuOptionBuilder()
        .setLabel('polls')
        .setValue('notif_polls')
        .setEmoji('📊')
    );

  const interestsSelect = new StringSelectMenuBuilder()
    .setCustomId('rolemenu_interests')
    .setPlaceholder('interests')
    .setMinValues(0)
    .setMaxValues(8)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('gaming')
        .setValue('interest_gaming')
        .setEmoji('🎮'),
      new StringSelectMenuOptionBuilder()
        .setLabel('art')
        .setValue('interest_art')
        .setEmoji('🎨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('music')
        .setValue('interest_music')
        .setEmoji('🎵'),
      new StringSelectMenuOptionBuilder()
        .setLabel('anime')
        .setValue('interest_anime')
        .setEmoji('✨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('reading')
        .setValue('interest_reading')
        .setEmoji('📚'),
      new StringSelectMenuOptionBuilder()
        .setLabel('movies')
        .setValue('interest_movies')
        .setEmoji('🎬'),
      new StringSelectMenuOptionBuilder()
        .setLabel('coding')
        .setValue('interest_coding')
        .setEmoji('💻'),
      new StringSelectMenuOptionBuilder()
        .setLabel('photography')
        .setValue('interest_photography')
        .setEmoji('📸')
    );

  const row1 = new ActionRowBuilder().addComponents(pronounsSelect);
  const row2 = new ActionRowBuilder().addComponents(colorsSelect);
  const row3 = new ActionRowBuilder().addComponents(notificationsSelect);
  const row4 = new ActionRowBuilder().addComponents(interestsSelect);

  return { embed, rows: [row1, row2, row3, row4] };
}

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import config from '../config.js';

const RULES_CHANNEL_ID = '1556053988581970060';

export const data = new SlashCommandBuilder()
  .setName('rules')
  .setDescription('send the server rules to the rules channel (staff only)');

export async function execute(interaction) {
  // Check if user has staff role or administrator permission
  const staffRoleId = config.roles.staff;
  const member = interaction.member;

  if (!member.roles.cache.has(staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: 'mochi says only staff can send rules',
      ephemeral: true,
    });
    return;
  }

  try {
    // Get the rules channel
    const rulesChannel = await interaction.guild.channels.fetch(RULES_CHANNEL_ID);
    
    if (!rulesChannel) {
      await interaction.reply({
        content: 'mochi could not find the rules channel',
        ephemeral: true,
      });
      return;
    }

    // Create the rules embeds
    const embed1 = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('welcome to velvetmoon')
      .setDescription(
        'velvetmoon is a cozy, aesthetic, and safe space for everyone. ' +
        'we are a community built on kindness, creativity, and respect. ' +
        'please read and follow our rules to keep this space welcoming for all.'
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
      .setFooter({ text: 'mochi - velvetmoon' })
      .setTimestamp();

    const embed2 = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('server rules')
      .addFields(
        {
          name: '1. be kind and respectful',
          value: 'treat everyone with kindness and respect. no harassment, bullying, hate speech, or discrimination of any kind.',
          inline: false,
        },
        {
          name: '2. keep it SFW',
          value: 'this is a safe-for-work server. no NSFW content, including images, text, links, or discussions.',
          inline: false,
        },
        {
          name: '3. no spam or self-promotion',
          value: 'avoid spamming messages, emojis, or pings. self-promotion and advertising require staff permission.',
          inline: false,
        },
        {
          name: '4. respect privacy',
          value: 'do not share personal information about yourself or others without consent. no doxxing.',
          inline: false,
        },
        {
          name: '5. follow discord TOS',
          value: 'all members must follow Discord Terms of Service and Community Guidelines. you must be 13+ to use Discord.',
          inline: false,
        },
        {
          name: '6. use channels appropriately',
          value: 'keep discussions in the correct channels. check channel descriptions and pinned messages.',
          inline: false,
        },
        {
          name: '7. listen to staff',
          value: 'respect staff decisions and follow their instructions. if you have concerns, DM a moderator privately.',
          inline: false,
        },
        {
          name: '8. have fun and be yourself',
          value: 'this is your space to relax, chat, and make friends. be authentic, be kind, and enjoy your time here.',
          inline: false,
        }
      )
      .setFooter({ text: 'mochi - velvetmoon' });

    const embed3 = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('consequences')
      .setDescription(
        'breaking these rules may result in:\n' +
        '- verbal warning\n' +
        '- temporary mute\n' +
        '- temporary ban\n' +
        '- permanent ban\n\n' +
        'the severity of the consequence depends on the rule broken and whether it is a repeat offense. ' +
        'staff have final say in all moderation decisions.'
      )
      .setFooter({ text: 'mochi - velvetmoon' });

    const embed4 = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('need help?')
      .setDescription(
        'if you have questions, concerns, or need to report something, please contact a staff member.\n\n' +
        'you can also use modmail or DM a moderator directly.\n\n' +
        'thank you for being part of velvetmoon. mochi hopes you have a wonderful time here.'
      )
      .setFooter({ text: 'mochi - velvetmoon' })
      .setTimestamp();

    // Send the embeds to the rules channel
    await rulesChannel.send({ embeds: [embed1] });
    await rulesChannel.send({ embeds: [embed2] });
    await rulesChannel.send({ embeds: [embed3] });
    await rulesChannel.send({ embeds: [embed4] });

    // Confirm to the staff member
    await interaction.reply({
      content: `rules sent successfully to ${rulesChannel}`,
      ephemeral: true,
    });

    console.log(`rules sent to ${rulesChannel.name} by ${interaction.user.tag}`);
  } catch (error) {
    console.error('error sending rules:', error);
    await interaction.reply({
      content: 'oops, mochi could not send the rules',
      ephemeral: true,
    });
  }
}

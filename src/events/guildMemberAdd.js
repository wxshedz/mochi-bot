import { EmbedBuilder } from 'discord.js';
import config from '../config.js';
import { getWelcomeMessage } from '../services/personality.js';

export const name = 'guildMemberAdd';

export async function execute(member) {
  try {
    // Get welcome channel
    const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
    
    if (!welcomeChannel) {
      console.error('✧ welcome channel not found');
      return;
    }

    // Assign moonchild role
    const moonchildRole = member.guild.roles.cache.get(config.roles.moonchild);
    
    if (moonchildRole) {
      try {
        await member.roles.add(moonchildRole);
        console.log(`✧ assigned moonchild role to ${member.user.tag}`);
      } catch (error) {
        console.error(`✧ failed to assign moonchild role to ${member.user.tag}:`, error.message);
        console.error('   make sure the bot role is above the moonchild role in the role hierarchy');
      }
    } else {
      console.error('✧ moonchild role not found');
    }

    // Send welcome message
    const welcomeText = getWelcomeMessage(member.user);
    
    await welcomeChannel.send({
      content: welcomeText,
    });

    console.log(`✧ welcomed ${member.user.tag} to the server`);
  } catch (error) {
    console.error('✧ error in welcome system:', error);
  }
}

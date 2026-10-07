import { getErrorReply } from '../services/personality.js';

export const name = 'interactionCreate';

export async function execute(interaction, client) {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`✧ no command found for: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`✧ error executing ${interaction.commandName}:`, error);
      
      const errorMessage = getErrorReply();
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  // Handle button interactions
  if (interaction.isButton()) {
    const [action, ...args] = interaction.customId.split('_');
    
    if (action === 'giveaway') {
      try {
        const { handleGiveawayButton } = await import('../services/giveaways.js');
        await handleGiveawayButton(interaction);
      } catch (error) {
        console.error('✧ error handling giveaway button:', error);
        await interaction.reply({
          content: 'oops, something went wrong',
          ephemeral: true,
        });
      }
    }
  }

  // Handle select menu interactions (for reaction roles)
  if (interaction.isStringSelectMenu()) {
    const [action, ...args] = interaction.customId.split('_');
    
    if (action === 'rolemenu') {
      try {
        const { handleReactionRoleMenu } = await import('../services/reactionRoles.js');
        await handleReactionRoleMenu(interaction);
      } catch (error) {
        console.error('✧ error handling reaction role menu:', error);
        await interaction.reply({
          content: 'oops, mochi could not update your roles',
          ephemeral: true,
        });
      }
    }
  }
}

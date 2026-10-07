import { roleConfig, getMutuallyExclusiveGroup } from '../config/reactionRoles.js';

export async function handleReactionRoleMenu(interaction) {
  const menuId = interaction.customId;
  const selectedValues = interaction.values;
  const member = interaction.member;

  const category = menuId.replace('rolemenu_', '');
  
  const categoryToPrefixMap = {
    'pronouns': 'pronoun',
    'colors': 'color',
    'notifications': 'notif',
    'interests': 'interest'
  };
  
  const prefix = categoryToPrefixMap[category] || category;

  try {
    const categoryRoleKeys = Object.keys(roleConfig).filter((key) => key.startsWith(prefix + '_'));

    const validRoleKeys = categoryRoleKeys.filter((key) => {
      const roleId = roleConfig[key];
      return roleId && !roleId.startsWith('YOUR_') && interaction.guild.roles.cache.has(roleId);
    });

    if (validRoleKeys.length === 0) {
      await interaction.reply({
        content: 'mochi says these roles are not configured yet. ask staff to set them up!',
        ephemeral: true,
      });
      return;
    }

    const currentRoles = categoryRoleKeys
      .map((key) => roleConfig[key])
      .filter((id) => id && !id.startsWith('YOUR_') && member.roles.cache.has(id));

    const exclusiveGroup = getMutuallyExclusiveGroup(categoryRoleKeys[0]);
    const isMutuallyExclusive = exclusiveGroup !== null;

    if (isMutuallyExclusive) {
      if (currentRoles.length > 0) {
        await member.roles.remove(currentRoles);
      }

      if (selectedValues.length > 0) {
        const roleId = roleConfig[selectedValues[0]];
        
        if (!roleId || roleId.startsWith('YOUR_')) {
          await interaction.reply({
            content: 'mochi says that role is not configured yet',
            ephemeral: true,
          });
          return;
        }
        
        const role = interaction.guild.roles.cache.get(roleId);
        
        if (role) {
          await member.roles.add(role);
          await interaction.reply({
            content: `updated your color to **${role.name}**`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'mochi could not find that role. ask staff to check the configuration',
            ephemeral: true,
          });
        }
      } else {
        await interaction.reply({
          content: 'removed your color role',
          ephemeral: true,
        });
      }
    } else {
      const selectedRoleIds = selectedValues
        .map((value) => roleConfig[value])
        .filter((id) => id && !id.startsWith('YOUR_') && interaction.guild.roles.cache.get(id));

      const rolesToRemove = currentRoles.filter((id) => !selectedRoleIds.includes(id));
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
      }

      const rolesToAdd = selectedRoleIds.filter((id) => !currentRoles.includes(id));
      if (rolesToAdd.length > 0) {
        await member.roles.add(rolesToAdd);
      }

      const selectedRoleNames = selectedRoleIds
        .map((id) => interaction.guild.roles.cache.get(id)?.name)
        .filter((name) => name);

      if (selectedRoleNames.length > 0) {
        const categoryName = category === 'notifications' ? 'notification roles' : category;
        await interaction.reply({
          content: `updated your ${categoryName}: **${selectedRoleNames.join(', ')}**`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `removed all ${category} roles`,
          ephemeral: true,
        });
      }
    }

    console.log(
      `${interaction.user.tag} updated ${category}: ${selectedValues.join(', ')}`
    );
  } catch (error) {
    console.error('error handling reaction role menu:', error);
    await interaction.reply({
      content: 'mochi could not update your roles. make sure the bot has permission and is above the roles in hierarchy',
      ephemeral: true,
    });
  }
}

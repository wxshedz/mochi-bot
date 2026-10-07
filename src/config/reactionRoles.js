// Role configuration for reaction role menus
// Replace placeholder IDs with actual role IDs from your server

export const roleConfig = {
  // Pronouns
  pronoun_she_her: 'YOUR_SHE_HER_ROLE_ID',
  pronoun_he_him: 'YOUR_HE_HIM_ROLE_ID',
  pronoun_they_them: 'YOUR_THEY_THEM_ROLE_ID',
  pronoun_any: 'YOUR_ANY_PRONOUNS_ROLE_ID',
  pronoun_ask: 'YOUR_ASK_ME_ROLE_ID',

  // Colors (mutually exclusive)
  color_red: 'YOUR_RED_ROLE_ID',
  color_orange: 'YOUR_ORANGE_ROLE_ID',
  color_yellow: 'YOUR_YELLOW_ROLE_ID',
  color_green: 'YOUR_GREEN_ROLE_ID',
  color_blue: 'YOUR_BLUE_ROLE_ID',
  color_purple: 'YOUR_PURPLE_ROLE_ID',
  color_pink: 'YOUR_PINK_ROLE_ID',

  // Notifications
  notif_announcements: 'YOUR_ANNOUNCEMENTS_ROLE_ID',
  notif_events: 'YOUR_EVENTS_ROLE_ID',
  notif_polls: 'YOUR_POLLS_ROLE_ID',

  // Interests
  interest_gaming: 'YOUR_GAMING_ROLE_ID',
  interest_art: 'YOUR_ART_ROLE_ID',
  interest_music: 'YOUR_MUSIC_ROLE_ID',
  interest_anime: 'YOUR_ANIME_ROLE_ID',
  interest_reading: 'YOUR_READING_ROLE_ID',
  interest_movies: 'YOUR_MOVIES_ROLE_ID',
  interest_coding: 'YOUR_CODING_ROLE_ID',
  interest_photography: 'YOUR_PHOTOGRAPHY_ROLE_ID',

  // Custom
  custom_1: 'YOUR_CUSTOM_1_ROLE_ID',
  custom_2: 'YOUR_CUSTOM_2_ROLE_ID',
  custom_3: 'YOUR_CUSTOM_3_ROLE_ID',
};

// Groups where only one role can be selected at a time
export const mutuallyExclusiveGroups = {
  colors: [
    'color_red',
    'color_orange',
    'color_yellow',
    'color_green',
    'color_blue',
    'color_purple',
    'color_pink',
  ],
};

export function getMutuallyExclusiveGroup(roleKey) {
  for (const [groupName, roles] of Object.entries(mutuallyExclusiveGroups)) {
    if (roles.includes(roleKey)) {
      return { groupName, roles };
    }
  }
  return null;
}

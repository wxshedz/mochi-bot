import { ActivityType } from 'discord.js';
import { startScheduledTasks } from '../services/scheduler.js';
import { restoreGiveaways } from '../services/giveaways.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`✧ mochi is online! logged in as ${client.user.tag}`);
  
  // Set bot status
  client.user.setPresence({
    activities: [{ name: 'over velvetmoon ☾', type: ActivityType.Watching }],
    status: 'online',
  });

  // Restore active giveaways
  restoreGiveaways(client);

  // Start scheduled tasks (daily questions, top chatter)
  startScheduledTasks(client);
  
  console.log('✧ all systems ready! mochi is here to help ♡');
}

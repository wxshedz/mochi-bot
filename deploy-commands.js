import { REST, Routes } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

/**
 * Load all command files and build commands array
 */
async function loadCommands() {
  const commandsPath = join(__dirname, 'src/commands');
  const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✧ loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠ command at ${file} is missing required "data" or "execute" property`);
    }
  }
}

/**
 * Deploy commands to Discord
 */
async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token) {
    console.error('✧ DISCORD_TOKEN is missing from .env file');
    process.exit(1);
  }

  if (!clientId) {
    console.error('✧ CLIENT_ID is missing from .env file');
    process.exit(1);
  }

  // Load commands
  await loadCommands();

  if (commands.length === 0) {
    console.error('✧ no commands found to deploy');
    process.exit(1);
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  try {
    console.log(`✧ started refreshing ${commands.length} application (/) commands...`);

    // Deploy commands globally (takes up to 1 hour to propagate)
    // For instant updates during development, use guild-specific deployment instead
    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(`✧ successfully reloaded ${data.length} application (/) commands!`);
    console.log('✧ commands:');
    data.forEach((cmd) => console.log(`   - /${cmd.name}`));
    console.log('\n✧ note: global commands can take up to 1 hour to appear in Discord');
    console.log('   for instant testing, deploy to a specific guild instead (see code comments)');
  } catch (error) {
    console.error('✧ error deploying commands:', error);
    process.exit(1);
  }
}

// Run deployment
deployCommands();

/* 
 * GUILD-SPECIFIC DEPLOYMENT (for instant testing):
 * 
 * Replace the rest.put() call above with:
 * 
 * const guildId = 'YOUR_GUILD_ID';
 * const data = await rest.put(
 *   Routes.applicationGuildCommands(clientId, guildId),
 *   { body: commands }
 * );
 * 
 * Guild commands update instantly, but only work in that specific server.
 */

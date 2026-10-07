import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDatabase } from './db/schema.js';
import config from './config.js';

dotenvConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✧ loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠ command at ${file} is missing required "data" or "execute" property`);
    }
  }
}

async function loadEvents() {
  const eventsPath = join(__dirname, 'events');
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(`file://${filePath}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✧ loaded event: ${event.name}`);
  }
}

async function init() {
  console.log('✧ starting bot...');

  await connectDatabase();
  await loadCommands();
  await loadEvents();

  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('✧ failed to login:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n✧ shutting down...');
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('✧ unhandled promise rejection:', error);
});

init();

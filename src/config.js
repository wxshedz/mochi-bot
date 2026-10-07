import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let config;

try {
  const configPath = join(__dirname, '../config.json');
  const configFile = readFileSync(configPath, 'utf-8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('✧ failed to load config.json');
  console.error('   make sure you copied config.example.json to config.json and filled it out');
  process.exit(1);
}

// Validate required fields
const requiredFields = [
  'guildId',
  'channels.welcome',
  'channels.chat',
  'roles.moonchild',
  'roles.staff',
];

for (const field of requiredFields) {
  const keys = field.split('.');
  let value = config;
  for (const key of keys) {
    value = value?.[key];
  }
  if (!value) {
    console.error(`✧ missing required config field: ${field}`);
    process.exit(1);
  }
}

export default config;

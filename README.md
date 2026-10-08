# mochi 🍡

A feature-rich Discord bot for the velvetmoon community. Handles leveling, giveaways, reaction roles, daily questions, and weekly leaderboards.

## Features

- **Leveling System** - XP gain from messages with automatic role progression
- **Giveaways** - Button-based entry system with persistent storage
- **Reaction Roles** - Self-assignable roles via dropdown menus (pronouns, colors, notifications, interests)
- **Daily Questions** - Scheduled questions with automatic rotation
- **Weekly Top Chatter** - Tracks and announces the most active member each week
- **Welcome System** - Greets new members and assigns base role

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Discord bot account with required intents enabled

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mochi-bot
npm install
```

2. Create a Discord application at the [Developer Portal](https://discord.com/developers/applications)
   - Enable **Server Members Intent** and **Message Content Intent** under Bot settings
   - Copy your bot token and client ID

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
MONGODB_URI=your_mongodb_uri
```

4. Configure the bot settings
```bash
cp config.example.json config.json
```

Edit `config.json` with your server IDs. Enable Developer Mode in Discord to copy IDs (right-click → Copy ID).

5. Deploy slash commands
```bash
npm run deploy-commands
```

6. Start the bot
```bash
npm start
```

## Configuration

### config.json

Main configuration file. Requires:
- Guild ID and channel IDs
- Role IDs for base role, staff, level roles
- XP settings (min/max, cooldown)
- Cron schedules for automated tasks
- Timezone for scheduling

### Reaction Roles

Edit `src/config/reactionRoles.js` to configure self-assignable roles:

```javascript
export const roleConfig = {
  pronoun_she_her: 'ROLE_ID_HERE',
  color_red: 'ROLE_ID_HERE',
  // ... etc
};
```

Send panels with `/reactionroles send <type>`.

### Level Roles

Configure in `config.json` under `roles.levelRoles`. Format:
```json
"levelRoles": {
  "1": "ROLE_ID",
  "5": "ROLE_ID",
  "10": "ROLE_ID"
}
```

Bot role must be positioned above all managed roles in the server hierarchy.

## Commands

### Everyone
- `/rank [user]` - View level and XP progress
- `/leaderboard` - Top 10 members by level
- `/mochi` - Random bot response
- `/help` - Command list

### Staff Only
- `/giveaway start <prize> <duration> <winners>` - Create a giveaway
- `/giveaway end <message_id>` - End a giveaway early
- `/giveaway reroll <message_id>` - Reroll winners
- `/question add <question>` - Add a daily question
- `/reactionroles send <type> [channel]` - Send reaction role panel

## Deployment

### Process Manager (PM2)
```bash
npm install -g pm2
pm2 start src/index.js --name mochi
pm2 save
pm2 startup
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "src/index.js"]
```

### Cloud Platforms
- **Railway**: Connect repo, add env vars, deploy
- **Fly.io**: `fly launch`, set secrets, `fly deploy`
- **Render**: Connect repo, set env vars, deploy

Compatible with any Node.js hosting that supports MongoDB connections.

## Project Structure

```
mochi-bot/
├── src/
│   ├── commands/       # Slash commands
│   ├── events/         # Discord event handlers
│   ├── services/       # Business logic
│   ├── db/             # Database models & helpers
│   ├── data/           # Static data (questions.json)
│   ├── config/         # Module configuration
│   └── index.js        # Entry point
├── config.json         # Bot configuration (gitignored)
├── .env                # Environment variables (gitignored)
└── package.json
```

## Troubleshooting

**Commands don't work**
- Verify slash commands were deployed with `npm run deploy-commands`
- Global commands can take up to an hour to register

**Roles aren't assigned**
- Check bot role hierarchy (must be above managed roles)
- Verify bot has "Manage Roles" permission
- Confirm role IDs in config files are correct

**Daily question doesn't post**
- Verify cron schedule format and timezone in config
- Check channel ID is correct
- Review console for errors

**Giveaways don't end**
- Giveaways are restored from database on bot restart
- Check console for scheduling errors

## License

MIT

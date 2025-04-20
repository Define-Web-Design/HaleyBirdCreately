
// Discord bot using Discord.js
const { Client, GatewayIntentBits, Events } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new client instance with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} has connected to Discord!`);
  console.log(`Bot is in ${client.guilds.cache.size} servers`);
});

// Listen for messages
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Command handling
  if (message.content.startsWith('!hello')) {
    await message.reply(`Hello ${message.author.username}!`);
  }
  
  if (message.content.startsWith('!ping')) {
    const sent = await message.reply('Pinging...');
    sent.edit(`Pong! Latency: ${Date.now() - message.createdTimestamp}ms`);
  }
});

// Get token from environment variables
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.warn("Warning: No DISCORD_TOKEN found in environment variables!");
  console.warn("Please add your bot token in the Secrets tab in Replit");
  console.warn("You need to create a bot at https://discord.com/developers/applications");
} else {
  // Login to Discord
  client.login(TOKEN);
}

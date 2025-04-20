
import os
import discord
from discord.ext import commands

# Set up the bot with command prefix '!'
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user.name} has connected to Discord!')
    print(f'Bot is in {len(bot.guilds)} servers')

@bot.command(name='hello')
async def hello(ctx):
    """Sends a hello message"""
    await ctx.send(f'Hello {ctx.author.name}!')

@bot.command(name='ping')
async def ping(ctx):
    """Check the bot's latency"""
    await ctx.send(f'Pong! Latency: {round(bot.latency * 1000)}ms')

# Replace 'YOUR_BOT_TOKEN' with your actual Discord bot token
# You should store this in Replit's Secrets tab for security
TOKEN = os.getenv('DISCORD_TOKEN')

if not TOKEN:
    print("Warning: No DISCORD_TOKEN found in environment variables!")
    print("Please add your bot token in the Secrets tab in Replit")
    print("You need to create a bot at https://discord.com/developers/applications")
else:
    bot.run(TOKEN)

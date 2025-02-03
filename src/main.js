const Discord = require('discord.js');
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({intents});

bot.commands = new Discord.Collection();

const loadCommands = require('./Bot/Loaders/loadCommands');
const { token } = require('./config.json');

bot.login(token);
loadCommands(bot);

bot.on("messageCreate", async message => {
    if(message.content == '!ping') return bot.commands.get("ping").run(bot, message);
})

bot.once('ready', () => {
    console.log('Bot is ready.');
})
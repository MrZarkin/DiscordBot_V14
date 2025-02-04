const Discord = require('discord.js');
const intents = new Discord.IntentsBitField(53608447);
const bot = new Discord.Client({intents});

bot.commands = new Discord.Collection();

const loadCommands = require('./Loaders/loadCommands');
const loadEvents = require('./Loaders/loadEvents');
const { token } = require('../config.json');

bot.login(token);
loadCommands(bot);
loadEvents(bot);
// Importation des éléments nécessaire
const { Client, Collection, Events, IntentsBitField } = require('discord.js');
const { token } = require('./config.json');
const loadEvents = require('./Loaders/loadEvents');
const loadCommands = require('./Loaders/loadCommands');
const loadSlashCommands = require('./Loaders/loadSlashCommands');

// Bot -> Nouveau client discord
const intent = new IntentsBitField(53608447);
const bot = new Client({intents: [intent]});

// Extension d'une "Map" en JS, mais permet de stocker les commands
bot.commands = new Collection();

loadCommands(bot);
loadSlashCommands(bot);
loadEvents(bot);

// Connection du bot à Discord
bot.login(token);
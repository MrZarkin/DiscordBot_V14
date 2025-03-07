const Discord = require('discord.js');

module.exports = async (bot, message) => {

    // Permet d'utiliser les commandes sans utiliser l'option /
    let prefix = "!";

    let messageArray = message.content.split(" ");
    let commandName = messageArray[0].slice(prefix.length);
    let args = messageArray.slice(1);

    if(!message.content.startsWith(prefix)) return;

    let command = require(`../Commands/${commandName}`)
    if(!command) return;

    command.run(bot, message, args);
}
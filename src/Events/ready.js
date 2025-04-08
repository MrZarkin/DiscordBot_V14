// Importation des éléments nécessaire de Discord.js
const { Events } = require('discord.js');

// Exportation du code
module.exports = {
    
    // Nom de l'évenement, et à exécuter qu'une fois 
    name: Events.ClientReady,
    once: true,

    execute(bot)
    {
        console.log(`Ready! Logged in as ${bot.user.tag}`)
    }
}
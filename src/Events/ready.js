// Importation des éléments nécessaire de Discord.js
const { Events } = require('discord.js');
const loadDatabase = require('../Loaders/loadDatabase');

// Exportation du code
module.exports = {
    
    // Nom de l'évenement, et à exécuter qu'une fois 
    name: Events.ClientReady,
    once: true,

    async execute(bot)
    {
        bot.db = loadDatabase();
        
        bot.db.connect((err) => {
            if(err)
                console.log('DataBase DISCONNECTED!');
            else
                console.log('DataBase connected!');
        })
        console.log(`Ready! Logged in as ${bot.user.tag}`);
    }
}
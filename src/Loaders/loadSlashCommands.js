// Importation des éléments nécessaire
const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../config.json');
const fs = require('fs');
const path = require('path');

// Exportation du code
module.exports = async bot => {
    
    // Tableau de l'ensemble des commandes
    let commands = [];

    // Lire dans le dossier 'Commands' tout les .js
    const commandsPath = path.join(__dirname, '../Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Pour chaque fichier .js trouvé ..
    for(const file of commandFiles)
    {
        // command = au contenu du fichier commande .js
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if('data' in command && 'execute' in command)
        {
            // On ajoute la commande au tableau en dernière position
            commands.push(command.data.toJSON());
        }
        else
        {
            console.log(`[WARNING] La commande dans ${filePath} est manquante une propriété "data" ou "execute" requise.`);
        }
    }

    try
    {
        // REST, permet de faire des requêtes à l'API Discord
        // Avec le jeton d'authentification (token)
        const rest = new REST({ version: '10' }).setToken(token);

        // En bref, charge la commande slash dans Discord
        await rest.put(
            Routes.applicationCommands(clientId), 
            { body: commands },
        );

        console.log('[+] Commandes Slash chargées avec succès !');
    } 
    catch(error)
    {
        console.error(error);
    }
}
// Importation des éléments nécessaire
const fs = require('fs');
const path = require('path');

// Exportation du code
module.exports = async bot => {

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
            // Ajouter la commande au bot, avec le nom dans le data
            bot.commands.set(command.data.name, command);
            console.log(`[+] ${file} Command loaded!`);
        }
        else
        {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
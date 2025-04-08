// Importation des éléments nécessaire
const fs = require('fs');
const path = require('path');

// Exportation du code
module.exports = async bot => {

    // Lire dans le dossier 'Events' tout les .js
    const eventsPath = path.join(__dirname, '../Events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    // Pour chaque fichier .js trouvé ..
    for(const file of eventFiles) 
    {
        // event = au contenu du fichier event .js
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        // Si il doit être exécuté qu'une fois
        if(event.once) 
        {
            // Faire l'événement avec ses arguments et son code
            bot.once(event.name, (...args) => event.execute(...args));
        }
        else
        {
            bot.on(event.name, (...args) => event.execute(...args));
        }
    }
}
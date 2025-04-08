// Importation des éléments nécessaire de Discord.js
const { Events, MessageFlags } = require('discord.js');

// Exportation du code
module.exports = {
	name: Events.InteractionCreate,

	async execute(interaction) {
        
        // Si ce n'est pas une commade '/'
        if(!interaction.isChatInputCommand()) return;

        // Récupérer la commande du bot en fonction de ce qu'il écrit
        const command = interaction.client.commands.get(interaction.commandName);
        
        if(!command)
        {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try 
        {
            // Essayer d'éxécuter le code que la commande doit faire
            await command.execute(interaction);
        } 
        catch(error) 
        {
            console.error(error);
            if (interaction.replied || interaction.deferred) 
            {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
            else
            {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
	},
};
// Importer librairies
const Discord = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = async (bot, interaction) => {

    // Si c'est une Slash commande et que l'Autocomplete est activé
    if(interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete)
    {
        // Permet de récupérer ce que l'utilisateur commence à écrire
        let entry = interaction.options.getFocused();

        // Récupérer ce que l'utilisateur commence à écrire
        let choices = bot.commands.filter(cmd => cmd.name.includes(entry));
        // Permet de filter parmi les commandes ce qu'il est en train d'écrire ( si c'est le cas )
        await interaction.respond(entry === "" ? bot.commands.map(cmd => ({name: cmd.name, value: cmd.name})) : choices.map(choice => ({name: choice.name, value: choice.name})));
    }

    // Si c'est une commande Slash
    if(interaction.type === Discord.InteractionType.ApplicationCommand)
    {
        // Récupère les commandes dans le dossier 'Commands' et les lancer avec leurs options
        let command = require(`../Commands/${interaction.commandName}`);
        command.run(bot, interaction, interaction.options);
    }
}
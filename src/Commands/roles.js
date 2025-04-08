// Importation des �l�ments n�cessaire
const { MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('roles')
            .setDescription('Get a list of server roles and member counts.')
            .setDefaultMemberPermissions(null),

    async execute(interaction)
    {
        const roles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position) // tri du plus haut au plus bas
            .map(role => `${role.name} ${role.members.size} members`)
            .join('\n');

        await interaction.reply({
            content: `Voici la liste des rôles :\n\n${roles || 'Aucun rôle trouvé.'}`,
            flags: MessageFlags.Ephemeral // facultatif, rend le message privé
        });
    }
}
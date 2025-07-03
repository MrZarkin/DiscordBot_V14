// Importation des éléments nécessaire
const { SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../functions/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Get a list of server roles and member counts.'),

    async execute(interaction)
    {
        // Récupère tous les rôles sauf @everyone
        const roles = interaction.guild.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position) // Du plus élevé au plus bas
            .map(role => {
                // Nombre de membres ayant ce rôle
                const memberCount = role.members.size;
                // Formatage du rôle avec le nombre de membres
                return `<@&${role.id}> (${memberCount} members)`;
            })
            .join(',\n');

        const rolesLength = interaction.guild.roles.cache.filter(role => role.id !== interaction.guild.id).size || '0';
        
        // Création de l'embed
        let Embed = createEmbed({
            title: 'List of roles',
            color: Colors.DarkRed,
            description: `**Roles** (${rolesLength})\n${roles.length > 0 ? roles : 'None'}`
        });

        await interaction.reply({ embeds: [Embed] });
    }
}
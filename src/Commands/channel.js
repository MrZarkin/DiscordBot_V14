// Importation des librairies nécessaire
const { SlashCommandBuilder, Colors, ChannelType } = require('discord.js');
const createEmbed = require('../functions/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Show informations about a channel.')
        .addChannelOption(option =>
            option
            .setName("channel")
            .setDescription("The channel to get informations.")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
            .addChannelTypes(ChannelType.GuildVoice)
        ),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const icon = interaction.guild.iconURL({ size: 2048, dynamic: true }); // Icon du serveur

        // Creation de l'embed de réponse
        let Embed = createEmbed({
            title: `${channel.name}`,
            description: `> **Name:** ${channel}\n> **ID:** \`${channel.id}\`\n> **Create on:** <t:${Math.floor(channel.createdAt / 1000)}:F>\n> **Type:** \`${channel.type === ChannelType.GuildText ? 'Text channel' : 'Voice channel'}\``,
            thumbnail: icon || null,
            color: Colors.DarkRed
        });

        return interaction.reply({ embeds: [Embed] });
    }
}
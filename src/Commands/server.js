// Importation des éléments nécessaire
const { MessageFlags, SlashCommandBuilder, ChannelType, Colors } = require('discord.js');
const createEmbed = require('../functions/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('server')
        .setDescription('Shows server informations.')
        .addSubcommand(command => 
            command
            .setName('icon')
            .setDescription('Send server\'s icon')
        )
        .addSubcommand(command => 
            command
            .setName('banner')
            .setDescription('Send server\'s banner')
        )
        .addSubcommand(command => 
            command
            .setName('info')
            .setDescription('Send server\'s informations')
        ),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const { options } = interaction;
        const sub = options.getSubcommand();
        const type = options.getString('type');
        const icon = interaction.guild.iconURL({ size: 2048, dynamic: true });
        const banner = interaction.guild.bannerURL({ size: 2048, dynamic: true })

        switch(sub)
        {
            case 'icon':
                // Pas d'icon
                if(!icon)
                    return interaction.reply({
                        content: `❌ **${interaction.guild.name}** doesn't have an icon!`,
                        flags: MessageFlags.Ephemeral
                    });
                
                return interaction.reply(icon);
                break;

            case 'banner':
                // Si pas de bannière
                if(!banner)
                    return interaction.reply({
                        content: `❌ **${interaction.guild.name}** doesn't have a banner!`,
                        flags: MessageFlags.Ephemeral
                    });
                
                return interaction.reply(banner);
                break;

            case 'info':
                // Récupère tous les rôles sauf @everyone
                const roles = interaction.guild.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position) // Du plus élevé au plus bas
                .map(role => `<@&${role.id}>`) // Format pour mentionner les rôles
                .join(', ');

                /*
                    Obtenir le proprio
                    Le nombre de salon
                    Le nombre de salon (Textuelle)
                    Le nombre de salon (Vocal)
                */
                let owner = await interaction.guild.fetchOwner();
                let channelLength = interaction.guild.channels.cache.size;
                let channelTextLength = interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size;
                let channelVoiceLength = interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size;

                // Création de l'embed
                let Embed = createEmbed({
                    title: `Server's informations`,
                    color: Colors.DarkRed,
                    description: `> **Name:** \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\n> **Owner:** <@${owner.id}>\n> **Created on:**: <t:${Math.floor(interaction.guild.createdAt / 1000)}:F>`,
                    fields: [
                        { name: `Members`, value: `${interaction.guild.memberCount}` },
                        { name: `Channels (${channelLength})`, value: `* Text channel: ${channelTextLength}\n* Voice channel: ${channelVoiceLength}` },
                        { name: `Roles (${interaction.guild.roles.cache.filter(role => role.id !== interaction.guild.id).size || '0'})`, value: roles.length > 0 ? roles : 'None' }
                    ],
                    thumbnail: icon || null
                });

                return interaction.reply({ embeds: [Embed] });
                break;

            default:
                break;
        }
    }
}
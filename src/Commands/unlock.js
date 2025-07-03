// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel from sending messages.')
        .addChannelOption(option => 
            option
            .setName('channel')
            .setDescription('Channel to unlock.')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        let channel = interaction.options.getChannel("channel") || interaction.channel;

        if(channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.allow.toArray(false).includes("SendMessages"))
            // Si le salon en question a déjà rendu la possibilitée d'envoyer des messages impossible pour tout le monde
            return interaction.reply({
                content: `❌ The channel is already unlocked!`,
                flags: MessageFlags.Ephemeral
            });

        if(channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id))
            // Si le salon possède des permissions pour le rôle @everyone
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {SendMessages: true});
        else
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.create(interaction.guild.roles.everyone.id, {SendMessages: true});

        // Répondre que le salon est désormé "bloqué"
        await interaction.reply(`🔓**${interaction.user.displayName}** unlocked the channel ${channel}!`);
    }
}
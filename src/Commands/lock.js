// Importation des librairies nécessaire
const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('lock')
            .setDescription('Lock a channel from sending messages.')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Channel to lock.')
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        let channel = interaction.options.getChannel("channel") || interaction.channel;
        const role = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);

        if(role?.deny.toArray(false).includes("SendMessages"))
            // Si le salon en question a déjà rendu la possibilitée d'envoyer des messages impossible pour tout le monde
            return interaction.reply({
                content: `❌ The channel is already locked!`,
                flags: MessageFlags.Ephemeral
            });

        if(role)
            // Si le salon possède des permissions pour le rôle @everyone
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {SendMessages: false});
        else
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.create(interaction.guild.roles.everyone.id, {SendMessages: false});

        // Répondre que le salon est désormé "bloqué"
        await interaction.reply(`🔒 **${interaction.user.displayName}** locked the channel ${channel}!`);
    }
}
// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('lock')
            .setDescription('Disables @everyone from sending messages in specific channel.')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Channel to lock.')
                    .setRequired(false)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason of the lock.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const reason = interaction.options.getString("reason") ?? "No reason given";
        let channel = interaction.options.getChannel("channel");

        // Si aucun salon est donné, alors on prend le salon actuel
        if(!channel)
            channel = interaction.channel;

        if(channel.type !== ChannelType.GuildText
            && channel.type !== ChannelType.PublicThread
            && channel.type !== ChannelType.PrivateThread)
        {
            // Si le salon n'est pas du Text, ou un thread public ou privée
            return interaction.reply('This isn\'t a good channel!');
        }

        if(channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.deny.toArray(false).includes("SendMessages"))
            // Si le salon en question a déjà rendu la possibilitée d'envoyer des messages impossible pour tout le monde
            return interaction.reply(`The channel ${channel} is already locked!`);

        if(channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id))
            // Si le salon possède des permissions pour le rôle @everyone
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {SendMessages: false});
        else
            // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
            await channel.permissionOverwrites.create(interaction.guild.roles.everyone.id, {SendMessages: false});

        // Répondre que le salon est désormé "bloqué"
        await interaction.reply(`The channel ${channel} has been locked for the reason: \`${reason}\`!`);
    }
}
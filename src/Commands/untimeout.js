// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user.')
        .addUserOption(option =>
            option
            .setName('member')
            .setDescription('The user to untimeout')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("member");
        const member = interaction.guild.members.cache.get(user.id);

        if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
        || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
        || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
        || (!member.moderatable)) // Si il est modérable
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be untimed out! I have not permission to manage this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Si sa communication n'est déjà coupée
        if(!member.isCommunicationDisabled())
            return interaction.reply({
                content: `❌ **${user.displayName}** is already untimed out!`,
                flags: MessageFlags.Ephemeral
            });

        // Envoyer en message priv�
        await interaction.reply({
            content: `🔊 ${user} has been untimed out from the server ${interaction.guild.name}!`,
            flags: MessageFlags.Ephemeral });

        // "Reset" son timeout -> L'enlever
        await member.timeout(null);
    }
}
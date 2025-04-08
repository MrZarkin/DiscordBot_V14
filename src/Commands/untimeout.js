// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('untimeout')
            .setDescription('Remove timeout from a user.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('The user to untimeout')
                    .setRequired(true)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);

        if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
            || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
            || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
            || (!member.moderatable) // Si il est modérable
            || (!member.isCommunicationDisabled())) // Si sa communication n'est pas déjà coupée
        {
            return interaction.reply({
                content: "I can't timeout this member!",
                flags: MessageFlags.Ephemeral
            });
        }

        // Envoyer en message priv�
        await interaction.reply({
            content: `${user} has been untimeout from the server ${interaction.guild.name}`,
            flags: MessageFlags.Ephemeral });

        // "Reset" son timeout -> L'enlever
        await member.timeout(null);
    }
}
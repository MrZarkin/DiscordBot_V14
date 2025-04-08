// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kicks a member.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('The user to kick.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason for the kick.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString("reason") ?? null;

        if (!user || !member)
            // ephemeral = true, permet de r�pondre un message visible seulement par l'auteur de la commande
            return interaction.reply({
                content: 'No member to ban!',
                flags: MessageFlags.Ephemeral
            });

        if ((interaction.user.id === user.id) // Si auteur du message = utilisateur choisi
            || (await interaction.guild.fetchOwner().id === user.id) // // Si proprio du serveur = utilisateur ciblé
            || (member && !member.kickable) // Si ce membre est bien sur le serveur et peut être kick
            || (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)) // // Si ce membre est bien sur le serveur et si il a un rang supérieur
        {
            return interaction.reply({
                content: "I can't kick this member!",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: `${user} has been kicked from this server for the reason: \`${reason == null ? "No reason given" : reason}\`.`,
            flags: MessageFlags.Ephemeral
        });

        // Kick le membre avec la raison
        await member.kick(reason);
    }
}
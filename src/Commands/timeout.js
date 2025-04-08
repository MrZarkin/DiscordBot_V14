// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('timeout')
            .setDescription('Timeout a user from sending messages, react or join voice channels.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('The user to timeout.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('The duration of timeout.')
                    .setRequired(false)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('The reason of timeout.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString("reason") ?? null;
        let time = interaction.options.getString("time") ?? null;

        if(time != null && isNaN(ms(time)))
            // Si on convertie time en milliseconde et que c'est pas un nombre ...
            return interaction.reply({
                content: "This type of duration is not recognized! Try the command `/timeout [user] {time m/h/d < 21d ?} <reason ?>`",
                flags: MessageFlags.Ephemeral
            });

        if (ms(time) > 1814400000)
            // Si le temps sup�rieure � 28j
            return interaction.reply({
                content: "You can't timeout a member +28 days !",
                flags: MessageFlags.Ephemeral
            });

        if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
            || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
            || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
            || (!member.moderatable) // Si il est modérable
            || (member.isCommunicationDisabled())) // Si sa communication est déjà coupée
        {
            return interaction.reply({
                content: "I can't timeout this member!",
                flags: MessageFlags.Ephemeral
            });
        }

        // Envoyer en message privé
        await interaction.reply({
            content: `${user} has been timeout for the reason: \`${reason}\`.  Duration: \`${time}\``,
            flags: MessageFlags.Ephemeral
        });

        // Timeout le membre avec la raison
        await member.timeout(ms(time), reason);
    }
}
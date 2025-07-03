// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const createEmbed = require('../functions/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user from sending messages, react or join voice channels.')
        .addUserOption(option =>
            option
            .setName('member')
            .setDescription('The user to timeout.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('duration')
            .setDescription('The duration of timeout.')
        )
        .addStringOption(option =>
            option
            .setName('reason')
            .setDescription('The reason of timeout.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("member");
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString("reason") || null;
        let time = interaction.options.getString("duration") || '4233600';

        // Si on convertie time en milliseconde et que c'est pas un nombre ...
        if(time != null && isNaN(ms(time)))
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be timed out! The duration The time given is not correct!`,
                flags: MessageFlags.Ephemeral
            });

        // Si le temps supérieure à 28j
        if (ms(time) > 1814400000)
            return interaction.reply({
                content: `❌ You can't time out a member +28 days !`,
                flags: MessageFlags.Ephemeral
            });

        if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
        || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
        || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
        || (!member.moderatable)) // Si il est modérable
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be timed out! I have not permission to manage this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Si sa communication est déjà coupée
        if(member.isCommunicationDisabled())
            return interaction.reply({
                content: `❌ **${user.displayName}** is already timed out!`,
                flags: MessageFlags.Ephemeral
            });

        // Enregistre le temps et le bon format
        const endTimestamp = new Date(Date.now() + ms(time)) // 👈 utiliser ms() pour parser
        const endDate = Math.floor(endTimestamp.getTime() / 1000);
            
        // Creation d'un embed de réponse
        let Embed = createEmbed({
            title: '🔇 Time out',
            color: Colors.DarkRed,
            description: `**${user.displayName}** has been timed out!`,
            fields: [
                { name: '', value: `> Author: ${interaction.user}\n> Until: <t:${endDate}:f>\n> Reason: **${reason}**`},
            ],
            timestamp: true
        });

        // Envoyer en message privé
        await interaction.reply({ embeds: [Embed] });

        // Timeout le membre avec la raison
        await member.timeout(ms(time), reason);
    }
}
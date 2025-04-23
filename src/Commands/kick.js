// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../scripts/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('The member to be kicked from the server/voice channel.')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription("Type of action.")
                    .setRequired(true)
                    .addChoices(
                        { name: 'Server', value: 'server' },
                        { name: 'Voice', value: 'voice' }
                    )
            )
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('The user to kick.')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Kick reason.')
                    .setRequired(false)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        const type = interaction.options.getString('type');
        let reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member)
            // ephemeral = true, permet de répondre un message visible seulement par l'auteur de la commande
            return interaction.reply({
                content: '❌ This member is not on/is no longer on this server!',
                flags: MessageFlags.Ephemeral
            });

        // Création d'un Embed de réponse
        let Embed;

        if(type === 'server')
        {
            if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
            || (interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = utilisateur ciblé
            || (member && !member.kickable) // Si ce membre est bien sur le serveur et peut être kickable
            || (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            {
                return interaction.reply({
                    content: `❌ **${user.displayName}** cannot be kicked! I have not permission to kick this user!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            // Kick le membre avec la raison
            await member.kick(reason);

            Embed = createEmbed({
                title: '🔨 Kick',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been kicked from the server.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });
        }
        else if(type === 'voice')
        {
            if ((member.voice.channelId === null) // Si le membre n'est pas dans un salon vocal
            || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (!member.moderatable) // Si le membre n'est pas modérable 
            || (await interaction.guild.fetchOwner().id === user.id)) // Si proprio du serveur = utilisateur ciblé
            {
                // Si c'est le proprio du serveur / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si il n'est pas dans un vocal
                return interaction.reply({
                    content: `❌ **${user.displayName}** cannot be kicked! I have not permission to kick this user!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            Embed = createEmbed({
                title: '🔨 Kick from voice',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been kicked from the voice channel.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Reason: \`${reason}\``},
                ],
                timestamp: true
            });

            // Forcer la personne à quitter le vocal actuel
            await member.voice.disconnect();
        }

        await interaction.reply({ embeds : [Embed] });
    }
}
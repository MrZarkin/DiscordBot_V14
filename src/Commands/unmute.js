// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('Unmutes a member from text/voice channels.')
            .addStringOption(option => 
                option
                    .setName('type')
                    .setDescription('Type of mute.')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Text', value: 'text' },
                        { name: 'Voice', value: 'voice' },
                    )
                )
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to unmute.')
                    .setRequired(true)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const type = interaction.options.getString('type');

        // Si c'est un salon text ou vocal ..
        if(type === 'text')
        {
            // Si le membre ne possède pas un rôle 'Muted'
            if(!member.roles.cache.some(role => role.name === 'Muted'))
                return interaction.reply({
                    content: "This member is already unmuted from text!`",
                    flags: MessageFlags.Ephemeral 
                });

            if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable
                || (!member.roles.cache.some(role => role.name === "Muted"))) // Si le membre ne possède pas le rôle 'Muted'
            {
                return interaction.reply({
                    content: "I can't unmute this member!",
                    flags: MessageFlags.Ephemeral
                });
            }

            // Suppression du rôle au membre
            await member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Muted"));
        }
        else if(type === 'voice')
        {
            // Si le membre n'est pas mute
            if(member.voice.mute == false)
                return interaction.reply({ content: "This member is already unmuted from voice!`", flags: MessageFlags.Ephemeral });

            // Si la personne cibl� c'est nous / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si pas d�j� mute vocal / Si c'est membre
            if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable
                || (member.voice.channelId === null)) // Si le membre n'est pas dans un vocal
            {
                return interaction.reply({
                    content: "I can't unmute this member!",
                    flags: MessageFlags.Ephemeral
                });
            }

            // Supprimer le mute en vocal de l'utilisateur 
            await member.voice.setMute(false);
        }

        // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
        await interaction.reply({
            content: `${user} unmuted from the channel!`,
            flags: MessageFlags.Ephemeral
        });
    }
}
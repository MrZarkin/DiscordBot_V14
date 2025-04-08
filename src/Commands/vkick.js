// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: new SlashCommandBuilder()
        .setName('vkick')
        .setDescription('Kicks a member from a voice channel.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to kick.')
                .setRequired(true)
            )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);

        if ((member.voice.channelId === null) // Si le membre n'est pas dans un salon vocal
            || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (!member.moderatable) // Si le membre n'est pas modérable 
            || (await interaction.guild.fetchOwner().id === user.id)) // Si proprio du serveur = utilisateur ciblé
        {
            // Si c'est le proprio du serveur / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si il n'est pas dans un vocal
            return interaction.reply({ content: "I can't kick this member!", flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `${user} has been kicked from the channel !`, flags: MessageFlags.Ephemeral });

        // Forcer la personne � quitter le vocal actuel
        await member.voice.disconnect();
    }
}
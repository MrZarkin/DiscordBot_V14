// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: new SlashCommandBuilder()
        .setName('moveme')
        .setDescription('Moves you to another voice channel.')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('Channel/user to be moved to.')
                .setRequired(true)
            )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(interaction)
    {
        // Utilisation de l'id de l'auteur du message
        const author = interaction.guild.members.cache.get(interaction.user.id);

        // Récupéré la valeurs des options
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        // Si l'auteur du message n'est pas dans un vocal
        if(author.voice.channelId === null) 
            return interaction.reply('You are not connected to a voice channel!');

        // Si le membre n'est pas dans un salon vocal
        if(member.voice.channelId === null)
            return interaction.reply('The member is not connected to a voice channel!');

        // Si nous sommes dans le meme salon vocal que le membre ciblé
        if(member.voice.channelId === author.voice.channelId)
            return interaction.reply('You\'re already in your voice channel!');

        // Changement de salon vocal
        author.voice.setChannel(member.voice.channelId);
        return interaction.reply(`${user.username} moved to ${author.voice.channel.name}`);
    }
}
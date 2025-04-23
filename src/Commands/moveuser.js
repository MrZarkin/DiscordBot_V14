// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data:
        new SlashCommandBuilder()
            .setName('moveuser')
            .setDescription('Moves a member to another voice channel.')
            .addUserOption(option => 
                option
                    .setName('user')
                    .setDescription('The user to move.')
                    .setRequired(true)
                )
            .addChannelOption(option => 
                option
                    .setName('channel')
                    .setDescription('Channel to move the user to.')
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildVoice)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(interaction)
    {
        // Utilisation de l'id de l'auteur du message
        const author = interaction.guild.members.cache.get(interaction.user.id);

        // Récupéré la valeurs des options
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const channelToMoveTo = interaction.options.getChannel('channel') || author.voice.channelId;

        // Si l'auteur du message n'est pas dans un vocal
        if(author.voice.channelId === null)
            await interaction.reply({
                content: `❌ You're not connected to a voice channel!`,
                flags: MessageFlags.Ephemeral
            }); 

        // Si le membre n'est pas dans un salon vocal
        if(member.voice.channelId === null)
            await interaction.reply({
                content: `❌ ${user} isn't connected to a voice channel!`,
                flags: MessageFlags.Ephemeral
            }); 

        // Si nous sommes dans le meme salon vocal que le membre ciblé
        if(member.voice.channelId === author.voice.channelId)
            await interaction.reply({
                content: `❌ ${user} is already in your voice channel!`,
                flags: MessageFlags.Ephemeral
            }); 

        // Changement de salon vocal
        member.voice.setChannel(channelToMoveTo);
        return interaction.reply(`✅ Sucess! ${user} has been moved to ${author.voice.channel}!`);
    }
}
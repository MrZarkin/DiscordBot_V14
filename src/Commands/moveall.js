// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('moveall')
            .setDescription('Move all members to the voice channel to which you are currently connected.')
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
        const user = interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        // Si l'autheur n'est pas dans un salon vocal
        if(member.voice.channelId === null)
            await interaction.reply({
                content: `❌ You're not connected to a voice channel!`,
                flags: MessageFlags.Ephemeral
            });

        // Récupéré la valeurs des options
        const channelToMoveTo = interaction.options.getChannel('channel') || member.voice.channelId;
        
        interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).forEach(async channel => {
            // Si il y a des gens dans tel salon
            if(channel.members.size > 0)
            {
                // Pour chaque membre dans le salon
                for(const [memberId, member] of channel.members)
                {
                    // On évite de déplacer les membres déjà dans le bon salon
                    if(member.voice.channelId !== channelToMoveTo)
                    {
                        try
                        {
                            // Changement de salon vocal
                            await member.voice.setChannel(channelToMoveTo);
                            return interaction.reply(`✅ Sucess! ${user} has been moved to ${channelToMoveTo}!`);
                        } 
                        catch (error)
                        {
                            console.log(error);
                        }
                    }
                }
            }
        });
    }
}
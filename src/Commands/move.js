// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, ChannelType } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data:
        new SlashCommandBuilder()
        .setName('move')
        .setDescription("Moves a member/all members to another voice channel.")
        .addSubcommand(command => 
            command
            .setName('all')
            .setDescription('Move all members to the voice channel to which you are currently connected.')
            .addChannelOption(option => 
                option
                .setName('channel')
                .setDescription('Channel to move the user to.') 
                .addChannelTypes(ChannelType.GuildVoice)
            )
        )
        .addSubcommand(command => 
            command
            .setName('user')
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
                .addChannelTypes(ChannelType.GuildVoice)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(interaction)
    {
        // Récupérer les valeurs des options
        const { options } = interaction;
        const sub = options.getSubcommand();

        // options
        let user = interaction.user;
        let member;
        const author = interaction.guild.members.cache.get(interaction.user.id);
        const channelToMoveTo = options.getChannel('channel') || author.voice.channel;

        // Faire comprendre à discord que le bot réfléchie
        await interaction.deferReply();

        switch(sub)
        {
            // Si /move all ...
            case 'all':
                member = interaction.guild.members.cache.get(user.id);

                // Si l'autheur n'est pas dans un salon vocal
                if(member.voice.channelId === null)
                    return interaction.reply({
                        content: `❌ You're not connected to a voice channel!`,
                        flags: MessageFlags.Ephemeral
                    });
                    
                // Nombre de membre + filtrer les falons en fonctions des vocaux
                let movedCount = 0;
                const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

                for(const [_, channel] of voiceChannels)
                {
                    for (const [memberId, member] of channel.members)
                    {
                        // Si les membres sont des salons différents
                        if (member.voice.channelId !== channelToMoveTo.id)
                        {
                            try
                            {
                                // Changement de salon, membre par membre
                                await member.voice.setChannel(channelToMoveTo);
                                movedCount++;
                            }
                            catch(err)
                            {
                                console.error(`Failed to move ${member.user.tag}:`, err);
                            }
                        }
                    }
                }
                
                // Si il n'y a personne à 'bouger'
                if(movedCount === 0)
                    return interaction.editReply(`❌ No members needed to be moved.`);
            
                return interaction.editReply(`✅ Moved \`${movedCount}\` member(s) to ${channelToMoveTo}!`);

            // Si /move user ...
            case 'user':
                user = options.getUser('user');
                member = interaction.guild.members.cache.get(user.id);

                // Si l'auteur du message n'est pas dans un vocal
                if(author.voice.channelId === null)
                    await interaction.editReply({
                        content: `❌ You're not connected to a voice channel!`,
                        flags: MessageFlags.Ephemeral
                    }); 

                // Si le membre n'est pas dans un salon vocal
                if(member.voice.channelId === null)
                    await interaction.editReply({
                        content: `❌ ${user} isn't connected to a voice channel!`,
                        flags: MessageFlags.Ephemeral
                    }); 

                // Si nous sommes dans le meme salon vocal que le membre ciblé
                if(member.voice.channelId === author.voice.channelId)
                    await interaction.editReply({
                        content: `❌ ${user} is already in your voice channel!`,
                        flags: MessageFlags.Ephemeral
                    }); 

                // Changement de salon vocal
                member.voice.setChannel(channelToMoveTo);
                return interaction.editReply(`✅ Sucess! ${user} has been moved to ${author.voice.channel}!`);

            default:
                return;
        }
    }
}
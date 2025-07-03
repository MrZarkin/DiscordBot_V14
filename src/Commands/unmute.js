// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('The member to be unmuted.')
        .addSubcommand(command => 
            command
            .setName('text')
            .setDescription('Unmute a member from text')
            .addUserOption(option =>
                option
                .setName('member')
                .setDescription('User to unmute.')
                .setRequired(true)
            )
        )
        .addSubcommand(command => 
            command
            .setName('voice')
            .setDescription('Unmute a member from voice')
            .addUserOption(option =>
                option
                .setName('member')
                .setDescription('User to unmute.')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const { options } = interaction;
        const sub = options.getSubcommand();
        const user = options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        const type = options.getString('type');

        if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
        || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
        || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
        || (member && !member.moderatable)) // Si le membre n'est pas modérable
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be unmuted! I have not permission to unmute this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        switch(sub)
        {
            case 'text':
                // Si le membre a déjà le rôle Muted ou qu'il n'est pas mute
                if(!member.roles.cache.some(role => role.name === 'Muted'))
                    return interaction.reply({
                        content: `❌ **${user.displayName}** is already unmuted!`,
                        flags: MessageFlags.Ephemeral
                    });

                // Suppression du rôle au membre
                await member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Muted"));
                break;

            case 'voice':
                if(member.voice.mute == false)
                    return interaction.reply({
                        content: `❌ **${user.displayName}** is already unmuted!`,
                        flags: MessageFlags.Ephemeral
                    });
    
                // Si le membre n'est pas dans un vocal
                if (member.voice.channelId === null)
                {
                    return interaction.reply({
                        content: `❌ **${user.displayName}** cannot be unmuted! He isn't in a voice channel!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
    
                // Supprimer le mute en vocal de l'utilisateur 
                await member.voice.setMute(false);
                break;

            default:
                break;
        }

        // ephemeral = true -> répondre un message visible seulement par l'auteur de la commande
        await interaction.reply({
            content: `🔊 **${user.displayName}** has been unmuted from the server!`,
            flags: MessageFlags.Ephemeral
        });
    }
}
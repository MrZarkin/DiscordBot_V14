// Importer les librairies
const { PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unmutevoice",
    description: "Mute a member from voice channels so they cannot speak.",
    permissions: PermissionFlagsBits.ManageGuild,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "User to mute.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            const user = args.getUser("user");
            const member = message.guild.members.cache.get(user.id);

            // Si le membre n'est pas mute
            if(member.voice.mute == false)
                return message.reply({ content: "This member is already unmuted from voice!`", flags: MessageFlags.Ephemeral });

            // Si la personne cibl� c'est nous / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si pas d�j� mute vocal / Si c'est membre
            if ((message.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await message.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable
                || (member.voice.channelId === null)) // Si le membre n'est pas dans un vocal
            {
                return message.reply({ content: "I can't unmute this member!", flags: MessageFlags.Ephemeral });
            }

            // Supprimer le mute en vocal de l'utilisateur 
            await member.voice.setMute(false);

            // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
            await message.reply({ content: `${user} unmuted from the voice!`, flags: MessageFlags.Ephemeral });
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unmutevoice [user] {time m/h/d ?} <reason ?>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
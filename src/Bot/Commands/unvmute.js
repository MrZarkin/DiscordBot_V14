// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unvmute",
    description: "Unmute a member from a voice channel",
    permission: PermissionFlagsBits.MuteMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "The member to mute",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres + Cherche si ce user est dans le serveur actuel
            let user = args.getUser("member");
            let member = message.guild.members.cache.get(user.id);

            if (!user || !member)
                return message.reply({ content: "This member doesn't exist !", flags: MessageFlags.Ephemeral });

            // Si la personne cibl� c'est nous / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si pas d�j� mute vocal / Si c'est membre
            if ((message.user.id === user.id)
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable)
                || (member.voice.mute === false)
                || (!member))
            {
                return message.reply({ content: "I can't unmute this member!", flags: MessageFlags.Ephemeral });
            }

            // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
            await message.reply({ content: `${user} has been unmuted!`, flags: MessageFlags.Ephemeral });

            // Supprimer le mute en vocal de l'utilisateur 
            await member.voice.setMute(false);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unvmute [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
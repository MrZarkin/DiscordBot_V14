// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unmute",
    description: "Unmute a member",
    permission: PermissionFlagsBits.ModerateMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "The member to unmute",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres + Cherche si ce user est dans le serveur
            let user = args.getUser("member");
            let member = message.guild.members.cache.get(user.id);

            if (!user || !member)
                // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: "This member doesn't exist !", flags: MessageFlags.Ephemeral });

            // Si il a un rang sup�rieur / Si peut pas �tre mod�r� / si sa communication est d�j� activ�
            if ((message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable)
                || (!member.isCommunicationDisabled()))
            {
                return message.reply({ content: "I can't unmute this member!", flags: MessageFlags.Ephemeral });
            }

            // Envoyer en message priv�
            await user.send({ content: `You've been unmuted from the server ${message.guild.name} by ${message.user.tag}`, flags: MessageFlags.Ephemeral });
            await message.reply({ content: `${user} has been unmuted from the server ${message.guild.name}`, flags: MessageFlags.Ephemeral });

            // "Reset" son timeout -> L'enlever
            await member.timeout(null);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unmute [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
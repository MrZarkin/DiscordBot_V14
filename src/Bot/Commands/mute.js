// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "mute",
    description: "Mute a member",
    permission: PermissionFlagsBits.ModerateMembers,
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
        },
        {
            type: "string",
            name: "time",
            description: "The time to mute",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "reason",
            description: "The reason for the mute",
            required: false,
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
            let reason = args.getString("reason");
            let time = args.getString("time");

            if (!user || !member)
                // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: "This member doesn't exist !", flags: MessageFlags.Ephemeral });

            if (!time)
                return message.reply({ content: "No time !", flags: MessageFlags.Ephemeral });
            else if (isNaN(ms(time)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return message.reply({ content: "This type of duration is not recognized! Try the command `/mute [user] {time m/h/d < 28d} <reason>`", flags: MessageFlags.Ephemeral });

            if (ms(time) > 2419200000)
                // Si le temps sup�rieure � 28j
                return message.reply({ content: "You can't mute a member +28 days !", flags: MessageFlags.Ephemeral });

            if (!reason)
                reason = "No reason given!";

            /*
               Si l'auteur du message = l'utilisateur cibl�
               Si proprio du serveur
               Si membre et si il a un rang sup�rieur
               Ne peut pas �tre mod�r�
               Communication d�j� d�sactiv�
            */
            if ((message.user.id === user.id)
                || (await message.guild.fetchOwner().id === user.id)
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable)
                || (member.isCommunicationDisabled()))
            {
                return message.reply({ content: "I can't mute this member!", flags: MessageFlags.Ephemeral });
            }

            // Envoyer en message priv�
            await user.send({ content: `You've been muted from the server ${message.guild.name} by ${message.user.tag}. Reason: \`${reason}\`. Duration: \`${time}\``, flags: MessageFlags.Ephemeral });
            await message.reply({ content: `${user} has been muted for the reason: \`${reason}\`.  Duration: \`${time}\``, flags: MessageFlags.Ephemeral });

            // Timeout le membre avec la raison
            await member.timeout(ms(time), reason);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/mute [user] {time m/h/d < 28d} <reason>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
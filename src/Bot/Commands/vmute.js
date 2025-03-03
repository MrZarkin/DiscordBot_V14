// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information nécessaire à la commande
    name: "vmute",
    description: "Mute a member from a voice channel",
    permission: PermissionFlagsBits.ManageGuild,
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
            // Récupérer la valeur des paramètres + Cherche si ce user est dans le serveur actuel
            let user = args.getUser("member");
            let member = message.guild.members.cache.get(user.id);
            let time = args.getString("time");
            let reason = args.getString("reason");

            if (!user || !member)
                return message.reply({ content: "This member doesn't exist !", flags: MessageFlags.Ephemeral });
                // ephemeral = true -> répondre un message visible seulement par l'auteur de la commande

            if (!time)
                return message.reply({ content: "No time !", flags: MessageFlags.Ephemeral });
            else if (isNaN(ms(time)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return message.reply({ content: "This type of duration is not recognized! Try the command `/mute [user] {time m/h/d < 28d} <reason>`", flags: MessageFlags.Ephemeral });

            if (ms(time) > 2419200000)
                // Si le temps supérieure à 28j
                return message.reply({ content: "You can't mute a member +28 days !", flags: MessageFlags.Ephemeral })

            if (!reason)
                reason = "No reason given!";

            // Si c'est nous / Si c'est un membre / Si il a un rang supérieur / Si c'est le proprio
            if ((message.user.id === user.id)
                || (await message.guild.fetchOwner().id === user.id)
                || (!member)
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable))
            {
                return message.reply({ content: "I can't mute this member!", flags: MessageFlags.Ephemeral });
            }

            await message.reply({ content: `${user} has been muted for the reason: \`${reason}\`.  Duration: \`${time}\``, flags: MessageFlags.Ephemeral });

            // Mute vocal la personne
            await member.voice.setMute(true);

            // Unmute à la fin du temps
            if (time != null) {
                setTimeout(async () => {
                    member.voice.setMute(false);
                }, ms(time));
            }
        }
        catch (err)
        {
            // En cas de problème
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/vmute [user] {time m/h/d < 28d} <reason>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
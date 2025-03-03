// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information nécessaire à la commande
    name: "ban",
    description: "Ban a member",
    permission: PermissionFlagsBits.BanMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "The member to ban",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "time",
            description: "The time to ban",
            required: false,
            autocomplete: false
        },
        {
            type: "string",
            name: "reason",
            description: "The reason for the ban",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            /*
            Permet de bannir des personnes que le bot ne connait pas et qui n'est pas sur le serveur
            A la différence de bot.users.cache.get() qui va chercher un membre sur le serveur, donc un membre qu'il connait

            Cherche si ce user est dans le serveur actuel
            Récupérer la valeur des paramètres
            */

            let user = await bot.users.fetch(args._hoistedOptions[0].value);
            let member = message.guild.members.cache.get(user.id);
            let reason = args.getString("reason");
            let time = args.getString("time");

            if (!user)
                // ephemeral = true -> répondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: 'No member to ban!', flags: MessageFlags.Ephemeral });

            if(!time)
                time = null;
            else if (isNaN(ms(time)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return message.reply({ content: "This type of duration is not recognized! Try the command `/ban [user] {time m/h/d} <reason>`", flags: MessageFlags.Ephemeral });

            if(!reason)
                reason = "No reason given";

            // Si l'auteur du message = l'utilisateur ciblé / Si proprio du serveur / si c'est un membre et si il est pas bannissable / Si membre et si il a un rang supérieur
            if((message.user.id === user.id) 
                || (await message.guild.fetchOwner().id === user.id)
                || (member && !member.bannable)
                || (member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (await message.guild.bans.fetch()).get(user.id)) 
            { 
                return message.reply({ content: "I can't ban this member!", flags: MessageFlags.Ephemeral });
            }

            // Envoyer en message privé
            if(!member.user.bot)
            {
                await user.send(`You've been banned from the server ${message.guild.name} by ${message.user.tag}. Reason: \`${reason}\`. Duration: \`${time == null ? "No limits" : time}\``);
            }
            await message.reply({ content: `${user} has been banned for the reason: \`${reason}\`.  Duration: \`${time == null ? "No limits" : time}\``, flags: MessageFlags.Ephemeral });

            // Bannir le membre avec la raison
            await message.guild.bans.create(user.id, {reason: reason});

            // Ban à la fin du temps
            if(time != null)
            {
                setTimeout(async () => {
                    message.guild.members.unban(user);
                }, ms(time));
            }
        }
        catch(err)
        {
            // En cas de problème
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/ban [user] {time m/h/d} <reason>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
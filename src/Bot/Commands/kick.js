// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "kick",
    description: "Kick a member",
    permission: PermissionFlagsBits.KickMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "The member to kick",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "reason",
            description: "The reason for the kick",
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
            A la diff�rence de bot.users.cache.get() qui va chercher un membre sur le serveur, donc un membre qu'il connait

            Cherche si ce user est dans le serveur actuel
            R�cup�rer la valeur des param�tres
            */

            let user = args.getUser("member");
            let member = message.guild.members.cache.get(user.id);
            let reason = args.getString("reason");

            if (!user || !member)
                // ephemeral = true, permet de r�pondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: 'No member to ban!', flags: MessageFlags.Ephemeral });

            if (!reason)
                reason = "No reason given";

            // Si l'auteur du message = l'utilisateur cibl� / Si proprio du serveur / si c'est un membre et si il n'est pas kickable / Si membre et si il a un rang sup�rieur
            if ((message.user.id === user.id)
                || (await message.guild.fetchOwner().id === user.id)
                || (member && !member.kickable)
                || (member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0))
            {
                return message.reply({ content: "I can't kick this member!", flags: MessageFlags.Ephemeral });
            }

            await message.reply({ content: `${user} has been kicked from this server!`, flags: MessageFlags.Ephemeral });

            // Kick le membre avec la raison
            await member.kick(reason);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/kick [user] <reason>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
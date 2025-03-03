// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "nick",
    description: "Change nickname of a member",
    permission: PermissionFlagsBits.ManageNicknames,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "Change the nickname of a member",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "nickname",
            description: "Choose your nickname",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        // ERREUR : IMPOSSIBLE DE CHANGER LE NOM DU PROPIETAIRE DU SERVEUR CAR SON RANG >= CELUI DU BOT

        try
        {
            /*
            Permet de bannir des personnes que le bot ne connait pas et qui n'est pas sur le serveur
            A la diff�rence de bot.users.cache.get() qui va chercher un membre sur le serveur, donc un membre qu'il connait

            Cherche si ce user est dans le serveur actuel
            R�cup�rer la valeur des param�tres
            */

            let user = await bot.users.fetch(args._hoistedOptions[0].value);
            let member = message.guild.members.cache.get(user.id);
            let name = args.getString("nickname");

            if (!name)
            {
                await message.reply({ content: `The nickname of ${user} on this server has been reset !`, flags: MessageFlags.Ephemeral });
                return member.setNickname(null); // null pour enlever
            }

            if ((message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable))
            {
                return message.reply({ content: "You can't change his nickname!", flags: MessageFlags.Ephemeral })
            }

            if (!user)
                // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: 'No member!', flags: MessageFlags.Ephemeral });

            // Changer le surnom
            await member.setNickname(name);

            await message.reply({ content: `The nickname of ${user} on this server has been changed to **${name}**!`, flags: MessageFlags.Ephemeral });
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/nick [user] <NewNickname>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
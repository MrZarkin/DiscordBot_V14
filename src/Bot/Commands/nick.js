// Importer les librairies
const { PermissionFlagsBits, MessageFlags} = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "nick",
    description: "Changes the nickname of a member.",
    permission: PermissionFlagsBits.ManageNicknames,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "User to set nick for.",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "new_nick",
            description: "The new nickname.",
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

            const user = await bot.users.fetch(args.getUser("user"));
            const member = message.guild.members.cache.get(user.id);
            const name = args.getString("new_nick");

            if (!name)
            {
                await message.reply({ content: `The nickname of ${user} on this server has been reset !`, flags: MessageFlags.Ephemeral });
                return member.setNickname(null); // null pour reset le surnom
            }

            if ((message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable)) // Si le membre n'est pas modérable 
            {
                return message.reply({ content: "You can't change his nickname!", flags: MessageFlags.Ephemeral })
            }

            // Changer le surnom
            await member.setNickname(name);

            await message.reply({ content: `The nickname of ${user} on this server has been changed to **${name}**!`, flags: MessageFlags.Ephemeral });
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/nick [user] <New_Nickname ?>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
// Importer les librairies
const { PermissionFlagsBits, MessageFlags} = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "untimeout",
    description: "Remove timeout from a user.",
    permission: PermissionFlagsBits.ModerateMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "The user to untimeout.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres + Cherche si ce user est dans le serveur
            const user = args.getUser("user");
            const member = message.guild.members.cache.get(user.id);

            if ((message.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await message.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
                || (!member.moderatable) // Si il est modérable
                || (!member.isCommunicationDisabled())) // Si sa communication n'est pas déjà coupée
            {
                return message.reply({ content: "I can't timeout this member!", flags: MessageFlags.Ephemeral });
            }

            // Envoyer en message priv�
            await message.reply({ content: `${user} has been untimeout from the server ${message.guild.name}`, flags: MessageFlags.Ephemeral });

            // "Reset" son timeout -> L'enlever
            await member.timeout(null);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/untimeout [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
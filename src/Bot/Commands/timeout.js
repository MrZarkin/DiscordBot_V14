// Importer les librairies
const { PermissionFlagsBits, MessageFlags} = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "timeout",
    description: "Timeout a user from sending messages, react or join voice channels.",
    permission: PermissionFlagsBits.ModerateMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "The user to timeout.",
            required: true,
            autocomplete: false
        },
        {
            type: "string",
            name: "time",
            description: "The duration of timeout.",
            required: false,
            autocomplete: false
        },
        {
            type: "string",
            name: "reason",
            description: "The reason of timeout.",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres + Cherche si ce user est dans le serveur actuel
            const user = args.getUser("user");
            const member = message.guild.members.cache.get(user.id);
            let reason = args.getString("reason");
            let time = args.getString("time");

            if (!time)
                time = "3w";
            else if (isNaN(ms(time)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return message.reply({ content: "This type of duration is not recognized! Try the command `/timeout [user] {time m/h/d < 21d ?} <reason ?>`", flags: MessageFlags.Ephemeral });

            if (ms(time) > 1814400000)
                // Si le temps sup�rieure � 28j
                return message.reply({ content: "You can't timeout a member +28 days !", flags: MessageFlags.Ephemeral });

            if ((message.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await message.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si il a un rang supérieur
                || (!member.moderatable) // Si il est modérable
                || (member.isCommunicationDisabled())) // Si sa communication est déjà coupée
            {
                return message.reply({ content: "I can't timeout this member!", flags: MessageFlags.Ephemeral });
            }

            // Envoyer en message privé
            await message.reply({ content: `${user} has been timeout for the reason: \`${reason == null ? "No reason given" : reason}\`.  Duration: \`${time}\``, flags: MessageFlags.Ephemeral });

            // Timeout le membre avec la raison
            await member.timeout(ms(time), reason == null ? null : reason);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/timeout [user] {time m/h/d < 21d ?} <reason ?>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
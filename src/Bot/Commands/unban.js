// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unban",
    description: "Unban a member",
    permission: PermissionFlagsBits.BanMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "member",
            description: "The member to unban",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres
            let user = args.getUser("member");

            if (!user)
                return message.reply({ content: "This member doesn't exist !", flags: MessageFlags.Ephemeral });
                // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande

            // Est-ce que le membre est banni ...
            if (!(await message.guild.bans.fetch()).get(user.id))
                return message.reply({ content: "This member isn't ban!", flags: MessageFlags.Ephemeral });

            await message.reply({ content: `${user.tag} has been unbanned from the server !`, flags: MessageFlags.Ephemeral });

            // D�bannir le membre
            await message.guild.members.unban(user);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unmute [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
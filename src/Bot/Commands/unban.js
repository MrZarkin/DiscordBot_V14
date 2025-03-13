// Importer les librairies
const { PermissionFlagsBits, MessageFlags} = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unban",
    description: "Unbans a member.",
    permission: PermissionFlagsBits.BanMembers,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "User to remove the ban of.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres
            const user = args.getUser("user");

            // Est-ce que le membre est banni ...
            if (!(await message.guild.bans.fetch()).get(user.id)) // Si le membre n'est pas ban
                return message.reply({ content: "This member isn't ban!", flags: MessageFlags.Ephemeral });

            await message.reply({ content: `${user.tag} has been unbanned from the server !`, flags: MessageFlags.Ephemeral });

            // D�bannir le membre
            await message.guild.members.unban(user);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unban [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
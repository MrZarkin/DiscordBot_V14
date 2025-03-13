// Importer les librairies
const { PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unmutetext",
    description: "Unmutes a member from voice channels.",
    permissions: PermissionFlagsBits.ManageGuild,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "User to mute.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            const user = args.getUser("user");
            const member = message.guild.members.cache.get(user.id);

            // Si le membre ne possède pas un rôle 'Muted'
            if(!member.roles.cache.some(role => role.name === 'Muted'))
                return message.reply({ content: "This member is already unmuted from text!`", flags: MessageFlags.Ephemeral });

            if((message.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await message.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable
                || (!member.roles.cache.some(role => role.name === "Muted"))) // Si le membre ne possède pas le rôle 'Muted'
            {
                return message.reply({ content: "I can't unmute this member!", flags: MessageFlags.Ephemeral });
            }

            // Suppression du rôle au membre
            await member.roles.remove(message.guild.roles.cache.find(role => role.name === "Muted"));

            // Envoyer en message priv�
            await message.reply({ content: `${user} unmuted from the text!`, flags: MessageFlags.Ephemeral });
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unmutetext [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
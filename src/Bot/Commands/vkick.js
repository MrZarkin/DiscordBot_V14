// Importer les librairies
const { PermissionFlagsBits, MessageFlags} = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "vkick",
    description: "Kicks a member from a voice channel.",
    permission: PermissionFlagsBits.ManageGuild,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "user",
            name: "user",
            description: "The member to kick",
            required: true,
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

            if ((member.voice.channelId === null) // Si le membre n'est pas dans un salon vocal
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable 
                || (await message.guild.fetchOwner().id === user.id)) // Si proprio du serveur = utilisateur ciblé
            {
                // Si c'est le proprio du serveur / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si il n'est pas dans un vocal
                return message.reply({ content: "I can't kick this member!", flags: MessageFlags.Ephemeral });
            }

            await message.reply({ content: `${user} has been kicked from the channel !`, flags: MessageFlags.Ephemeral });

            // Forcer la personne � quitter le vocal actuel
            await member.voice.disconnect();
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/vkick [user]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
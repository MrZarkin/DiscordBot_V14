// Importer les librairies
const { PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "vkick",
    description: "Kick a member from a voice channel",
    permission: PermissionFlagsBits.ManageGuild,
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
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // R�cup�rer la valeur des param�tres + Cherche si ce user est dans le serveur actuel
            let user = args.getUser("member");
            let member = message.guild.members.cache.get(user.id);

            if (!user || !member)
                // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
                return message.reply({ content: 'No member to kick!', flags: MessageFlags.Ephemeral });

            // Si c'est le proprio du serveur / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si il n'est pas dans un vocal
            if (member.voice.channelId === null
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
                || (!member.moderatable)
                || (await message.guild.fetchOwner().id === user.id))
            {
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
// Importer les librairies
const { PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const ms = require('ms');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "mutetext",
    description: "Mute a member from text channels so they cannot type.",
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
        },
        {
            type: "string",
            name: "time",
            description: "Time duration for the mute.",
            required: false,
            autocomplete: false
        },
        {
            type: "string",
            name: "reason",
            description: "Reason of the mute.",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            const user = args.getUser("user");
            const member = message.guild.members.cache.get(user.id);
            const role = message.guild.roles.cache.find(role => role.name === "Muted");
            let time = args.getString("time");
            let reason = args.getString("reason");

            if(!time)
                time = null;
            else if (isNaN(ms(time)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return message.reply({ content: "This type of duration is not recognized! Try the command `/mutetext [user] {time m/h/d ?} <reason ?>`", flags: MessageFlags.Ephemeral });
            
            // Si le membre possède un rôle 'Muted'
            if(member.roles.cache.some(role => role.name === 'Muted'))
                return message.reply({ content: "This member is already muted from text!`", flags: MessageFlags.Ephemeral });
            
            if(!role)
            {
                try
                {
                    // On créer un rôle 'Muted', aucune permissions activées
                    let muterole = await message.guild.roles.create({
                        name: 'Muted',
                        permissions: []
                    });
                    
                    // Pour chaque salon textuelles : Interdire l'envoie de message et d'ajouter des reactions pour le rôle 'Muted'
                    message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach( async channel => {
                        await channel.permissionOverwrites.create(message.guild.roles.cache.find(role => role.name === "Muted"), {
                            SendMessages: false,
                            AddReactions: false
                        });
                    });
                }
                catch(e)
                {
                    console.log(e);
                }
            }

            if((message.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await message.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable)) // Si le membre n'est pas modérable
            {
                return message.reply({ content: "I can't mute this member!", flags: MessageFlags.Ephemeral });
            }

            // Ajouter du rôle au membre
            await member.roles.add(message.guild.roles.cache.find(role => role.name === "Muted"), reason == null ? null : reason);

            // Envoyer en message priv�
            await message.reply({ content: `${user} muted from the text!`, flags: MessageFlags.Ephemeral });

            // Ban à la fin du temps
            if(time != null)
            {
                setTimeout(async () => {
                    member.roles.remove(message.guild.roles.cache.find(role => role.name === "Muted"));
                }, ms(time));
            }
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/mutetext [user] {time m/h/d ?} <reason ?>`!", flags: MessageFlags.Ephemeral });
        }
    }
}
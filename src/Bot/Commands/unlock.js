// Importer les librairies
const { PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');

// Exporter l'tuilisation de la commande pour l'utiliser dans un require()
module.exports = 
{
    // Information n�cessaire � la commande
    name: "unlock",
    description: "Allow @everyone to send messages in a specific channel.",
    permission: PermissionFlagsBits.ManageChannels,
    dm: false,
    options:
    [
        // Option de la commande. Ex: /ban option1 option2 option3
        {
            type: "channel",
            name: "channel",
            description: "Channel to lock.",
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            // Récupérer la valeur des paramètres
            let channel = args.getChannel("channel");

            // Si aucun salon est donné, alors on prend le salon actuel
            if(!channel)
                channel = message.channel;
            
            if(channel.type !== ChannelType.GuildText
                && channel.type !== ChannelType.PublicThread
                && channel.type !== ChannelType.PrivateThread)
            {
                // Si le salon n'est pas du Text, ou un thread public ou privée
                return message.reply('This isn\'t a good channel!');
            }

            if(channel.permissionOverwrites.cache.get(message.guild.roles.everyone.id)?.allow.toArray(false).includes("SendMessages"))
                // Si le salon en question a déjà rendu la possibilitée d'envoyer des messages impossible pour tout le monde
                return message.reply(`The channel ${channel} is already unlocked!`);
 
            if(channel.permissionOverwrites.cache.get(message.guild.roles.everyone.id))
                // Si le salon possède des permissions pour le rôle @everyone
                // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
                await channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {SendMessages: true});
            else
                // Modifier les permisions du role @everyone, pour que tout le monde ne puisse plus écrire
                await channel.permissionOverwrites.create(message.guild.roles.everyone.id, {SendMessages: true});

            // Répondre que le salon est désormé "bloqué"
            await message.reply(`The channel ${channel} has been unlocked!`);
        }
        catch (err)
        {
            // En cas de probl�me
            console.log(err);
            message.reply({ content: "A problem has arisen. Please try again later or try the command `/unlock [channel ?]`!", flags: MessageFlags.Ephemeral });
        }
    }
}
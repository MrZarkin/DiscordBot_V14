const Discord = require('discord.js');

module.exports = 
{
    name: "ban",
    description: "Ban a member",
    permission: Discord.PermissionFlagsBits.BanMembers,
    dm: false,
    options:
    [
        {
            type: "user",
            name: "member",
            description: "The member to ban",
            required: true
        },
        {
            type: "string",
            name: "reason",
            description: "The reason for the ban",
            required: false
        }
    ],

    async run(bot, message, args)
    {
        try
        {
            /*
            Permet de bannir des personnes que le bot ne connait pas et qui n'est pas sur le serveur
            A la différence de bot.users.cache.get() qui va chercher un membre sur le serveur, donc un membre qu'il connait
            */
            let user = await bot.users.fetch(args._hoistedOptions[0].value);
            if(!user) return message.reply('No member to ban!');

            let member = message.guild.members.cache.get(user.id);

            let reason = args.getString("reason");
            if(!reason) reason = "No reason given";

            // Propriétaire / si c'est un membre et si il est bannable / Si membre et si il n'a pas de rang suérieur
            if((message.user.id === user.id) || 
                (await message.guild.fetchOwner().id === user.id) || 
                (member && !member.bannable) ||
                (member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) ||
                (await message.guild.bans.fetch()).get(user.id)) 
            { return message.reply("I can't ban this member!"); }

            try
            {
                await user.send(`You've been banned from the server ${message.guild.name} by ${message.user.tag}. Reason: \`${reason}\` `)
            }
            catch(err)
            {
                message.reply("A problem has arisen. Please try again later!")
            }

            await message.reply(`${message.user} has been banned for the reason: \`${reason}\` `);
            await message.guild.bans.create(user.id, {reason: reason});

        }
        catch(err)
        {
            return message.reply("This member doesn't exit !");
        }

    }

}
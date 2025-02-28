const Discord = require('discord.js');

module.exports = 
{
    name: "kick",
    description: "Kick a member",
    permission: Discord.PermissionFlagsBits.KickMembers,
    dm: false,
    options:
    [
        {
            type: "user",
            name: "member",
            description: "The member to kick",
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
        let user = args.getUser("member");
        let member = message.guild.members.cache.get(user.id);
        let reason = args.getString("reason");

        if(!user || !member) return message.reply('No member to kick!');
        if(!reason) reason = "No reason given";

        if((message.user.id === user.id) || 
            (await message.guild.fetchOwner().id === user.id) || 
            (member && !member.kickable) ||
            (member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)) 
        { return message.reply("I can't kick this member!"); }

        try
        {
            await user.send(`You've been kicked from the server ${message.guild.name} by ${message.user.tag}. Reason: \`${reason}\``)
        }
        catch(err)
        {
            message.reply("A problem has arisen. Please try again later!")
        }

        await message.reply(`${message.user} has been kicked. Reason: \`${reason}\``);
        await member.kick(reason);
    }

}
const Discord = require('discord.js');

module.exports = 
{
    name: "unban",
    description: "Unban a member",
    permission: Discord.PermissionFlagsBits.BanMembers,
    dm: false,
    options:
    [
        {
            type: "user",
            name: "member",
            description: "The member to unban",
            required: true
        }
    ],

    async run(bot, message, args)
    {
        let user = args.getUser("member");
        if(!user) return message.reply("This member doesn't exist !");

        if(!(await message.guild.bans.fetch()).get(user.id))
        {
            return message.reply("This member isn't ban !");
        }

        await message.reply(`${user.tag} has been unban from the server !`);
        await message.guild.members.unban(user);
    }
}
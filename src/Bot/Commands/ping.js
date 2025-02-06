module.exports =
{
    name: "ping",
    description: "Renvoie pong",
    permission: null,

    async run(bot, message)
    {
        await message.reply('Ping');
    }

}
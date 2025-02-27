module.exports =
{
    name: "ping",
    description: "Renvoie pong",
    permission: null,
    options: [],

    async run(bot, message, args)
    {
        await message.reply('Ping');
    }

}
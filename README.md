<p align="center">
    <img src="https://miro.medium.com/v2/resize:fit:1400/1*7P8znG0tW7qmpOpZmSxj7w.png" alt="Banner"/>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Stable_Version-v1.1.6.1-2490D7.svg?style=for-the-badge" alt="Version"/>
    <a href="https://discord.com"><img src="https://img.shields.io/badge/Discord_Server-ADD-7289DA.svg?style=for-the-badge" alt="Discord"/></a>
    <a href=""><img src="https://img.shields.io/badge/LICENSE-GPL_2.0-43B02A.svg?style=for-the-badge" alt="License"/></a>
    <img src="https://img.shields.io/badge/npm-v14.21.0-43B02A.svg?style=for-the-badge" alt="DiscordJS"/>
    <img src="https://img.shields.io/github/last-commit/MrZarkin/DiscordBot_V14?color=yellow&style=for-the-badge&logo=github" alt="GitHub"/>
    
</p>

---

> [!NOTE]
> The bot is currently in development, so it has no support server, and is not permanently active. This is just the beginning of an open source project (see license for details).

## <img src="https://img.icons8.com/?size=100&id=83240&format=png&color=000000" width="23"> 》Features

### Moderation

* `/ban <member> [reason] [duration]` -> Bans a member from the server.
* `/clear <amount>` -> Cleans up channel messages.
* `/kick <type> <member> [reason]` -> The member to be kicked from the server/voice channel.
* `/lock [channel]` -> Lock a channel from sending messages.
* `/mute <type> <member> [duration] [reason]` -> The member to be muted.
* `/nickname <member> [nickname]` -> Changes the nickname of a member.
* `/slowmode <type> [duration] [channel] [reason]` -> Enable/Disable slow mode.
* `/unban <user>` -> Unbans a member.
* `/unlock [channel]` -> Unlock a channel from sending messages.
* `/unmute <type> <member>` -> The member to be unmuted.
* `/warn <member> [reason]` -> Warns a member.
* `/warnings <type> [member] [warnID]` -> Manage members warnings.
* `/move [user] [channel ?]` -> Move all members to the voice channel to which you are currently connected.
* `/timeout <user> [time] [reason]` -> Timeout a user from sending messages, react or join voice channels.
* `/untimeout <member>` -> Remove timeout from a user.

### Information

* `/bot` -> Shows bot informations.
* `/channel [channel]` -> Show informations about a channel.
* `/ping` -> Show the bot response time.
* `/role <type> <user> <role>` -> Gives/Removes a role to a user.
* `/roles` -> Get a list of server roles and member counts.
* `/server <type>` -> Shows server informations.
* `/user <type> [member]` -> Shows bot informations.

### Tickets

* `/ticket` -> Manage the ticket system.
    * `/ticket menu` -> Get access to the Ticket Setup Panel.
    * `/ticket config` -> Change the settings of the Ticket System.
    * `/ticket stats` -> Shows results of ticket system quality surveys.
    * ... and a lot of action buttons!


### Leveling

> Incoming...

### Giveaways

> Incoming...


## <img src="https://img.icons8.com/?size=100&id=21866&format=png&color=006400" width="23"> 》Installation

### Resources

- NodeJS. Get it from [Installing Node on Windows](https://nodejs.org/en)
- VS Code. Get it from [Visual Studio Code](https://code.visualstudio.com)
- XAMPP. Get it from [Xampp](https://www.apachefriends.org/fr/download.html), then run Apache and MySQL, and finally go to this [page](http://localhost/phpmyadmin/). NOTE: You need to create a new database named `DiscordBot`, with a `warns` table, with the columns `(guildID, userID, authorID, warnID, reason, date)`.
- Discord.js library. Get it from [discord.js](https://www.npmjs.com/package/discord.js)
- REST from Discord.js library. Get it from [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest)
- ms library. Get it from [ms](https://www.npmjs.com/package/ms)
- mysql library. Get it from [mysql](https://www.npmjs.com/package/mysql)
- path library. Get it from [path](https://www.npmjs.com/package/path)
- fs library. Get it from [fs](https://www.npmjs.com/package/fs)

For a better understanding of the code, I recommend that you familiarize yourself with the Discord.js library on their [documentation](https://discord.js.org) and on their [guide](https://discordjs.guide/).

> [!WARNING]
> An important thing to remember. Some commands can't be executed unless the database is up and running.

### Setting Up

1. Clone this project on your machine. Before running it, make sure to create a `config.json` file at the root of the project so that the hierarchy looks like this:
```
src/
├── Commands/
├── Events/
├── Loader/
├── functions/
├── main.js
└── config.json
```
Finally, you must put in this file :
```JSON
{
    "token": "<TOKEN>",
    "clientId": "<CLIENT ID>",
    "guildId": "<GUILD ID>",
    "clientID_Secret" : "<CLIENT SECRET ID>"
}
```
You will replace `TOKEN`, `CLIENTID`, `CLIENTID_SECRET` in your [Discord Developer Portal](https://discord.com/developers/applications). Choose any application if you have one, otherwise create one. Go to the Bot tab, and choose 'RESET TOKET'. Copy it and put it in `config.json`.

2. Once finished, open a new terminal and type the command: `npm i discord.js`, `npm i @discordjs/rest`, and all the libs said before.

3. All that's left to do is launch the bot by typing `node start`. ( Make sure you've set the right path: `cd .\src\`.
 
**IMPORTANT**

If this is the first discord application you've created, be sure to activate the options (in the bot tab) `PUBLIC BOT`, `PRESENCE INTENT`, `SERVER MEMBERS INTENT` and `MESSAGE CONTENT INTENT`.

## <img src="https://img.icons8.com/?size=100&id=35635&format=png&color=000000" width="23"> 》Updates

If you update the bot, please run `npm update` before starting it again. If you have issues with this, you can try deleting your node_modules folder and then running `npm install` again.

## <img src="https://img.icons8.com/?size=100&id=83244&format=png&color=000000" width="23"> 》 Help

If you encounter a problem with the bot, please go to the Issue tab and let me know!
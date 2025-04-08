<p align="center">
    <img src="https://miro.medium.com/v2/resize:fit:1400/1*7P8znG0tW7qmpOpZmSxj7w.png" alt="Banner"/>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Stable_Version-v1.1.4-2490D7.svg?style=for-the-badge" alt="Version"/>
    <a href="https://discord.com"><img src="https://img.shields.io/badge/Discord_Server-ADD-7289DA.svg?style=for-the-badge" alt="Discord"/></a>
    <a href=""><img src="https://img.shields.io/badge/LICENSE-GPL_2.0-43B02A.svg?style=for-the-badge" alt="License"/></a>
    <img src="https://img.shields.io/badge/npm-v14.18.0-43B02A.svg?style=for-the-badge" alt="DiscordJS"/>
    <img src="https://img.shields.io/github/last-commit/MrZarkin/DiscordBot_V14?color=yellow&style=for-the-badge&logo=github" alt="GitHub"/>
    
</p>

---

## <img src="https://img.icons8.com/?size=100&id=85604&format=png&color=ff8000" width="23"> 》Notice

>The bot is currently in development, so it has no support server, and is not permanently active. This is just the beginning of an open source project (see license for details).

## <img src="https://img.icons8.com/?size=100&id=83240&format=png&color=000000" width="23"> 》Features

### Server management

* `/ban [user] {time m/h/d ?} <reason ?>` -> Bans a member.
* `/clear {number_of_messages}` -> Cleans up channel messages.
* `/kick [user] <reason ?>` -> Kicks a member.
* `/lock [channel ?] <reason ?>` -> Disables @everyone from sending messages in specific channel.
* `/moveall [channel ?]` -> Move all members to the voice channel to which you are currently connected.
* `/moveme [user]` -> Moves you to another voice channel.
* `/moveuser [user] {channel ?}` -> Moves a member to another voice channel.
* `/mute <type Text/Voice> [user] {time m/h/d ?} <reason ?>` -> Mute a member from text channels so they cannot type.
* `/nick [user] <New_Nickname ?>` -> Changes the nickname of a member.
* `/role [type Give/Remove] {user} <Role>` -> Gives/Removes a role to a user.
* `/roles` -> Get a list of server roles and member counts.
* `/timeout [user] {time m/h/d < 21d ?} <reason ?>` -> Timeout a user from sending messages, react or join voice channels.
* `/unban [user]` -> Unbans a member.
* `/unmute <type Text/Voice> [user]` -> Unmutes a member from text/voice channels.
* `/unlock [channel ?]` -> Allow @everyone to send messages in a specific channel.
* `/untimeout [user]` -> Remove timeout from a user.
* `/vkick [user]` -> Kicks a member from a voice channel.


## <img src="https://img.icons8.com/?size=100&id=21866&format=png&color=006400" width="23"> 》Installation

### Resources

- NodeJS. Get it from [Installing Node on Windows](https://nodejs.org/en)
- VS Code. Get it from [Visual Studio Code](https://code.visualstudio.com)
- Discord.js library. Get it from [discord.js](https://www.npmjs.com/package/discord.js)
- REST from Discord.js library. Get it from [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest)
- ms library. Get it from [ms](https://www.npmjs.com/package/ms)

For a better understanding of the code, I recommend that you familiarize yourself with the Discord.js library on their [documentation](https://discord.js.org) and on their [guide](https://discordjs.guide/).


### Setting Up

1. Clone this project on your machine. Before running it, make sure to create a `config.json` file at the root of the project so that the hierarchy looks like this:
```
src/
├── Commands/
├── Events/
├── Loader/
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

2. Once finished, open a new terminal and type the command: `npm i discord.js`, `npm i @discordjs/rest`, then `npm i fs` and finally `npm i ms`.

3. All that's left to do is launch the bot by typing `node start`. ( Make sure you've set the right path: `cd .\src\`.
 
**IMPORTANT**

If this is the first discord application you've created, be sure to activate the options (in the bot tab) `PUBLIC BOT`, `PRESENCE INTENT`, `SERVER MEMBERS INTENT` and `MESSAGE CONTENT INTENT`.

## <img src="https://img.icons8.com/?size=100&id=35635&format=png&color=000000" width="23"> 》Updates

If you update the bot, please run `npm update` before starting it again. If you have issues with this, you can try deleting your node_modules folder and then running `npm install` again.

## <img src="https://img.icons8.com/?size=100&id=83244&format=png&color=000000" width="23"> 》 Help

If you encounter a problem with the bot, please go to the Issue tab and let me know!
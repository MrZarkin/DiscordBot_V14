<p align="center">
    <img src="https://miro.medium.com/v2/resize:fit:1400/1*7P8znG0tW7qmpOpZmSxj7w.png" alt="Banner"/>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Stable_Version-v1.1.2-2490D7.svg?style=for-the-badge" alt="Version"/>
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

#### General

* `/ban [user] {time s/m/h/d/mo/y} <reason>` -> Ban a server member. With User as a reference, and the reason (not mandatory). Exemple: /ban @MrZarkin 1d trashtalk
* `/unban [userID]` -> Unban a member from your server. Exemple: /unban 916639542285565953
* `/kick [user] <reason>` -> Kick a server member, with User as a reference, and the reason (not mandatory). Exemple : /kick @MrZarkin trashtalk
* `/nick [user] <NewNickname>` -> Select a user to change his nickname. NewNickname is optional, if its null, the nickname will be reset. Exemple: /nick @MrZarkin MZ

#### Text

* `/mute [user] {time s/m/h/d} <reason>` -> Timeout a person in the living rooms writes temporarily. Time must be under 28 days. Exemple: /mute @MrZarkin 20d A reason
* `/unmute [user]` -> Untimeout a person in writing salons. Exemple: /unmute @MrZarkin

#### Voice

* `/vmute [user] {time s/m/h/d} <reason>` -> Mute a person in the voice chat. Time must be under 28 days. Exemple: /vmute @MrZarkin 20d A reason
* `/unmute [user]` -> Unmute a person in vocal salons. Exemple: /unmute @MrZarkin
* `/vkick [user]` -> Kick a server member from a voice channel. Exemple : /kick @MrZarkin

## <img src="https://img.icons8.com/?size=100&id=21866&format=png&color=006400" width="23"> 》Installation

### Resources

- NodeJS. Get it from [Installing Node on Windows](https://nodejs.org/en)
- VS Code. Get it from [Visual Studio Code](https://code.visualstudio.com)
- Discord.js library. Get it from [discord.js](https://www.npmjs.com/package/discord.js)
- REST from Discord.js library. Get it from [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest)
- ms library. Get it from [ms](https://www.npmjs.com/package/ms)


### Setting Up

1. Clone this project on your machine. Before running it, make sure to create a `config.json` file at the root of the project so that the hierarchy looks like this:
```
src/
|--- Bot/
|--- Start.js
|--- config.json
```
Finally, you must put in this file :
```JSON
{
    “token": ‘<TOKEN>’,
    “clientID": ‘<CLIENTID>’,
    “clientID_Secret": ”<CLIENTID_SECRET>”
}
```
You will replace `TOKEN`, `CLIENTID`, `CLIENTID_SECRET` in your [Discord Developer Portal](https://discord.com/developers/applications). Choose any application if you have one, otherwise create one. Go to the Bot tab, and choose 'RESET TOKET'. Copy it and put it in `config.json`.

2. Once finished, open a new terminal and type the command: `npm i discord.js`, `npm i @discordjs/rest`, then `npm i fs` and finally `npm i ms`.

3. All that's left to do is launch the bot by typing `node start`. ( Make sure you've set the right path: `cd .\src\`.

## <img src="https://img.icons8.com/?size=100&id=35635&format=png&color=000000" width="23"> 》Updates

If you update the bot, please run `npm update` before starting it again. If you have issues with this, you can try deleting your node_modules folder and then running `npm install` again.

## <img src="https://img.icons8.com/?size=100&id=83244&format=png&color=000000" width="23"> 》 Help

If you encounter a problem with the bot, please go to the Issue tab and let me know!
const Discord = require('discord.js');

module.exports = async bot => {

    fs.readdirSync("./Bot/Events").filter(f => f.endsWith(".js")).forEach(async file => {
        
        let event = require(`../Events/${file}`);
        bot.on(file.split(".js").join(""), event.bind(null, bot))
        console.log(`[+] ${file} Evenement charged!`)
    })
}
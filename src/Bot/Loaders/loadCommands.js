const fs = require('fs');

module.exports = async bot => {

    fs.readdirSync('./Bot/Commands').filter(f => f.endsWith(".js")).forEach(async file => {
        
        let command = require(`../Commands/${file}`);
        if(!command.name || typeof command.name !== 'string')
        {
            throw new TypeError(`${file.slice(0, file.length - 3)} ===>  NO NAME`);
        }

        bot.commands.set(command.name, command);

        console.log(`[+] ${file} Command charged !`)
    });
}
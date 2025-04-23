// Importation de mysql2
const mysql = require('mysql2');

function loadDatabase()
{
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'DiscordBot'
    });

    return db;
}

module.exports = loadDatabase;
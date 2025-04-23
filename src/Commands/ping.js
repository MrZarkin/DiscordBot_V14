// Importation des librairies nécessaire
const { SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../scripts/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Show the bot response time.'),

    async execute(interaction)
    {
        await interaction.reply({ content: '⏱️ Calcul du ping...' });
        
        // Calcul du ping
        const sent = await interaction.fetchReply();
        const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = interaction.client.ws.ping;

        // Création d'un embed de réponse
        const Embed = createEmbed({
            color: Colors.DarkRed,
            title: "🏓 Pong!",
            description: `> **Ping:** \`${roundTrip}ms\`\n> **WS:** \`${wsPing >= 0 ? `${wsPing}ms` : 'Toujours en attente...' }\` `,
            timestamp: true
        });

        await interaction.editReply({ embeds: [Embed] });
    }
}
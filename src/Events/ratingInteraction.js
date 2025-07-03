// Importation des éléments nécessaire de Discord.js
const { Events, ActionRowBuilder, ButtonStyle, Colors } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createButton = require('../functions/createButton');
const { guild } = require('../functions/sharedStore');

// Exporter le code
module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, bot, db)
    {
        // Si l'interaction n'est pas un bouton
        if (!interaction.isButton())
            return;

        // Exécuter en fonction de l'id du Bouton
        switch(interaction.customId)
        {
            case 'rateVeryBad':
            case 'rateBad':
            case 'rateRegular':
            case 'rateGood':
            case 'rateVeryGood':
            {
                switch(interaction.customId)
                {
                    case 'rateVeryBad':
                    {
                        db.query(`UPDATE ticket_rating SET veryBad = veryBad + 1 WHERE guildID = ?`, [guild.id]);
                        break;
                    }

                    case 'rateBad':
                    {
                        db.query(`UPDATE ticket_rating SET bad = bad + 1 WHERE guildID = ?`, [guild.id]);
                        break;
                    }

                    case 'rateRegular':
                    {
                        db.query(`UPDATE ticket_rating SET regular = regular + 1 WHERE guildID = ?`, [guild.id]);
                        break;
                    }

                    case 'rateGood':
                    {
                        db.query(`UPDATE ticket_rating SET good = good + 1 WHERE guildID = ?`, [guild.id]);
                        break;
                    }

                    case 'rateVeryGood':
                    {
                        db.query(`UPDATE ticket_rating SET veryGood = veryGood + 1 WHERE guildID = ?`, [guild.id]);
                        break;
                    }
                }

                db.query(`UPDATE ticket_rating SET numberRate = numberRate + 1 WHERE guildID = ?`, [guild.id]);
                
                const embed = createEmbed({
                    title: 'Thank you!',
                    description: `Glad to hear that! Thank you for **rating** this server's ticket support experience, your feedback **helps** the server to improve your support experience, we truly **appreciate** your feedback.`,
                    footer: 'DSecure\'s Ticket System',
                    color: Colors.Orange
                });

                // Bouton d'interaction
                const cpn = new ActionRowBuilder()
                .addComponents(
                    createButton({
                        label: 'Invite DSecure!',
                        style: ButtonStyle.Link,
                        url: 'https://discord.com/oauth2/authorize?client_id=1336099778941161472&permissions=8&integration_type=0&scope=bot+applications.commands'
                    })
                );

                interaction.update({
                    embeds: [embed],
                    components: [cpn]
                });
                break;
            }
        }
    }
}
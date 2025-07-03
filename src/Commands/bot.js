// Importation des librairies nécessaire
const { SlashCommandBuilder, Colors, ActionRowBuilder, ButtonStyle } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createButton = require('../functions/createButton');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Shows bot informations.'),

    async execute(interaction, bot)
    {
        // On récupère le nombre de server / Le nombre de membre
        const totalGuilds = bot.guilds.cache.size;
        const totalUsers = bot.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const upTime = Date.now() - bot.launchTime;

        // 'Traduction' du temps dans le bon format
        const formatDuration = (ms) => {
            const min = Math.floor((ms / (1000 * 60)) % 60);
            const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24);
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));

            return `${days}d ${hrs}h ${min}m`;
        };

        // Création d'un embed de réponse
        const Embed = createEmbed({
            author: bot.user.username,
            color: Colors.DarkRed,
            description: `> **User:** ${bot.user}\n> **Created On:** <t:${Math.floor(bot.user.createdTimestamp / 1000)}:F>\n> **Online since:**: \`${formatDuration(upTime)}\`\n> **Developper:** \`Zarkin\`\n`,
            fields: [
                { name: '\u200B', value: '**__Statistics:__**' },
                { name: '**Commands Executed**', value: `${bot.commandsUsed}`, inline: true },
                { name: '**Servers**', value: `${totalGuilds}`, inline: true },
                { name: '**Users (cached)**', value: `${totalUsers}`, inline: true }
            ],
            timestamp: true,
            thumbnail: bot.user.displayAvatarURL(),
            bot: bot
        });

        // Création de boutons
        const inviteButton = createButton({
            customId: 'invite',
            label: 'Invite',
            style: ButtonStyle.Link,
            url: 'https://discord.com/oauth2/authorize?client_id=1336099778941161472&permissions=8&integration_type=0&scope=bot+applications.commands'
        });
        const supportButton = createButton({
            customId: 'support',
            label: 'Support',
            style: ButtonStyle.Link,
            url: 'https://discord.gg/EdZDZVzFv3'
        });
        const webButton = createButton({
            customId: 'dashboard',
            label: 'Dashboard',
            style: ButtonStyle.Link,
            url: 'https://discord.com/'
        });

        const comp = new ActionRowBuilder()
        .addComponents(inviteButton, supportButton, webButton)

        // Envoie de l'embed et des boutons
        return interaction.reply({ 
            embeds: [Embed],
            components: [comp]
        });
    }
}
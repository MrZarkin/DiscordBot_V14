// Importation des librairies nécessaire
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, Colors, ButtonStyle } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createButton = require('../functions/createButton');
const { guild } = require('../functions/sharedStore');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage the ticket system')
        .addSubcommand(command => 
            command
            .setName('menu')
            .setDescription('Get access to the Ticket Setup Panel.')
        )
        .addSubcommand(command => 
            command
            .setName('config')
            .setDescription('Change the settings of the Ticket System.')
        )
        .addSubcommand(command => 
            command
            .setName('stats')
            .setDescription('Shows results of ticket system quality surveys.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction, bot, db)
    {
        const { options } = interaction;
        const sub = options.getSubcommand();

        let embed, cpn = '';

        switch(sub)
        {
            case 'menu':
            {
                // Embed de réponse
                embed = new createEmbed({
                    color: Colors.DarkBlue,
                    title: 'Open Ticket Setup Menu',
                    description: 'You can change the embed message using the **Setup Embed** button, add or remove panels by pressing the **Setup Panels** button, and once you are ready just click the green **All Ready** button to send the Ticket Menu!'
                })

                // Création des boutons (actions grâce à ticketInteraction.js)
                cpn = new ActionRowBuilder()
                .addComponents(
                    createButton({
                        label: 'Setup Embed',
                        customId: 'setup_embed',
                        style: ButtonStyle.Primary
                    }),
                    createButton({
                        label: 'Setup Ticket Panel(s)',
                        customId: 'setup_panels',
                        style: ButtonStyle.Secondary
                    }),
                    createButton({
                        label: 'All ready (send)',
                        customId: 'send',
                        style: ButtonStyle.Success
                    })
                )

                interaction.reply({ embeds: [embed], components: [cpn] });
                break;
            }

            case 'config':
            {
                // Embed de réponse
                embed = new createEmbed({
                    color: Colors.DarkBlue,
                    title: 'Ticket Config Setup',
                    description: `Hey **${interaction.user.displayName}**! You can configure aspects of the Ticket System bu using the buttons below.`,
                    fields: [
                        { name: 'General Settings', value: 'This area allows you to customize the general settings, including the closing time, ticket category, and rating options.' },
                        { name: 'Role Settings', value: 'You can designate up to the three staff or blacklisted roles in the area, the previous values are replaced by ones you provide.' },
                        { name: 'Embed Settings (Coming soon)', value: 'You can customize the default texts and other settings for the Instructions Ticket Embed in this area.' }
                    ]
                })

                // Création des boutons (actions grâce à ticketInteraction.js)
                cpn = new ActionRowBuilder()
                .addComponents(
                    createButton({
                        label: 'General Settings',
                        customId: 'generalSettings',
                        style: ButtonStyle.Primary
                    }),
                    createButton({
                        label: 'Role Settings',
                        customId: 'roleSettings',
                        style: ButtonStyle.Secondary
                    }),
                    createButton({
                        label: 'Embed Settings',
                        customId: 'embedSettings',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    })
                )
                interaction.reply({ embeds: [embed], components: [cpn] });
                break;
            }

            case 'stats':
            {
                // Récupère la configuration dans la bdd (ensemble soit vide, soit non-vide)
                const getConfig = () => new Promise(resolve => {
                    db.query(`SELECT * FROM ticket_config WHERE guildID = '${interaction.guild.id}'`, (err, res) => resolve(res?.[0] || {}));
                });

                const getRating = () => new Promise(resolve => {
                    db.query(`SELECT * FROM ticket_rating WHERE guildID = '${interaction.guild.id}'`, (err, res) => resolve(res?.[0] || {}));
                });

                const config = await getConfig();
                const rating = await getRating();

                if(Object.keys(rating).length !== 0)
                {
                    const rate = {
                        veryBad: parseInt(rating.veryBad),
                        bad: parseInt(rating.bad),
                        regular: parseInt(rating.regular),
                        good: parseInt(rating.good),
                        veryGood: parseInt(rating.veryGood)
                    }

                    const total = parseInt(rating.numberRate) || 0;

                    function makeBar(percent, filledEmoji, emptyEmoji = '⬜')
                    {
                        const totalBlock = 10;
                        const filledBlock = Math.round((percent / 100) * totalBlock);
                        const emptyBlocks = totalBlock - filledBlock;
                        return filledEmoji.repeat(filledBlock) + emptyEmoji.repeat(emptyBlocks);
                    };

                    const colorMap = {
                        veryBad: '🟥',
                        bad: '🟥',
                        regular: '🟦',
                        good: '🟩',
                        veryGood: '🟩'
                    };

                    const labelMap = {
                        veryBad: 'Very Bad',
                        bad: 'Bad',
                        regular: 'Regular',
                        good: 'Good',
                        veryGood: 'Very Good'
                    };

                    const statsFields = Object.entries(rate).map(([key, value]) => {
                        const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                        const filledEmoji = colorMap[key];
                        const bar = makeBar(percent, filledEmoji);

                        return {
                            name: `${labelMap[key]} — ${value}`,
                            value: `${bar} \`${percent}%\``,
                            inline: false
                        };
                    });
                    

                    embed = createEmbed({
                        bot: bot,
                        author: interaction.guild.name,
                        description: `> **${config.ticketOpened}** tickets has been created on this server!\n> **${rating.numberRate}** total reviews! **${parseInt(rating.veryGood) + parseInt(rating.good) + parseInt(rating.regular)}** positives, **${parseInt(rating.bad) + parseInt(rating.veryBad)}** negatives!`,
                        fields: statsFields,
                        footer: `Req by ${interaction.user.username}`,
                        color: Colors.Green
                    });
                }
                else
                {
                    embed = createEmbed({
                        color: Colors.Red,
                        description: 'There is no data to show!'
                    });
                }

                interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}
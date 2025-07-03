// Importation des éléments nécessaire de Discord.js
const { Events, Colors, MessageFlags, ActionRowBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createButton = require('../functions/createButton');
const store = require('../functions/sharedStore');
const { guild } = require('../functions/sharedStore');

// Exportation du code
module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, bot, db) 
    {
        if (!interaction.isModalSubmit())
            return;

        // Récupère la configuration dans la bdd (ensemble soit vide, soit non-vide)
        const getConfig = () => new Promise(resolve => {
            db.query(`SELECT * FROM ticket_config WHERE guildID = '${interaction.guild.id}'`, (err, res) => resolve(res?.[0] || {}));
        });

        let title;
        function handlePanelTitle(_title) {
            title = _title;
        }

        module.exports = { handlePanelTitle };

        switch (interaction.customId) {

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////  Prévisualisation d'un embed  /////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'customEmbedModal': 
            {
                const { guild, fields } = interaction;

                const title = fields.getTextInputValue('titleTextEmbed');
                const description = fields.getTextInputValue('descriptionTextEmbed');
                const footer = fields.getTextInputValue('footerTextEmbed');
                const color = fields.getTextInputValue('colorTextEmbed');
                const imageURL = fields.getTextInputValue('imageTextEmbed');

                const embed = createEmbed({
                    color: color || Colors.DarkBlue,
                    title,
                    description,
                    footer: footer || null,
                    image: imageURL || null,
                });

                db.query(`
                    INSERT INTO ticket_config (guildID, title, description, footer, color, imageURL)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        title = VALUES(title),
                        description = VALUES(description),
                        footer = VALUES(footer),
                        color = VALUES(color),
                        imageURL = VALUES(imageURL)
                `, [guild.id, title, description, footer || null, color || null, imageURL || null]);

                return interaction.reply({
                    content: '> _This is just a preview of the embed, you can dismiss it._',
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral
                });
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////  Création d’un ticket  /////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'ticketSubjectModal_panel':
            case 'ticketSubjectModal':
            {
                const config = await getConfig();

                const subject = interaction.fields.getTextInputValue('subject');
                const parent = interaction.guild.channels.cache.get(config.categoryID) || interaction.channel?.parent;

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.id}`,
                    type: ChannelType.GuildText,
                    topic: `Ticket user: ${interaction.user.username}; Ticket reason: ${subject}`,
                    parent,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                        },
                    ],
                });

                if(config.roleStaffID)
                {
                    channel.permissionOverwrites.create(config.roleStaffID, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    })
                }

                const authorUser = interaction.user;
                module.exports = { authorUser }; // On exporte l'auteur du ticket

                const fields = [
                    {
                        name: '',
                        value: `Hello **${interaction.user.displayName}**, this is your ticket!\nPlease, write down below details about your problem. Support will be with you shortly!`
                    },
                    {
                        name: '',
                        value: 'You are allowed to ping a support member once after 30 minutes of no response, avoid mass-pinging!'
                    },
                    {
                        name: '',
                        value: 'You can close this ticket at anytime by using the **close** button.\nStaff can manage this ticket by using the **panel** button.'
                    }
                ];

                // Ajouter le champ "Ticket Panel" si c'est un panel
                if (interaction.customId === 'ticketSubjectModal_panel') {
                    fields.push({
                        name: 'Ticket Panel',
                        value: `\`\`\`${store.panelTitle}\`\`\``
                    });
                }

                // Champ commun à tous
                fields.push({
                    name: 'Ticket Subject',
                    value: `\`\`\`${subject || 'No subject given'}\`\`\``
                });

                // Création finale de l'embed
                const embedChannel = createEmbed({
                    title: 'New Ticket!',
                    bot: bot,
                    author: {
                        name: interaction.user.displayName,
                        iconURL: interaction.user.displayAvatarURL()
                    },
                    fields,
                    image: 'https://i.imgur.com/AZlgvgi.png',
                    thumbnail: 'https://avatars.githubusercontent.com/u/79794618?s=280&v=4',
                    color: Colors.DarkBlue
                });

                const buttons = new ActionRowBuilder().addComponents(
                    createButton({
                        label: 'Close Ticket',
                        customId: 'closeTicket',
                        emoji: '🔒',
                        style: ButtonStyle.Danger,
                    }),
                    createButton({
                        label: 'Staff Panel',
                        customId: 'staffPanel',
                        emoji: '🛠️',
                        style: ButtonStyle.Primary,
                    }),
                );

                channel.send({ embeds: [embedChannel], components: [buttons] });
                db.query(`UPDATE ticket_config SET ticketOpened = ticketOpened + 1 WHERE guildID = ?`, [guild.id]);
                db.query(`INSERT INTO ticket_list (guildID, channelID) VALUES (?, ?)`, [guild.id, channel.id]);

                const embed = createEmbed({
                    color: Colors.DarkGreen,
                    description: `${interaction.user} You successfully opened the ticket ${channel}!`,
                });

                await interaction.reply({ 
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral 
                });

                // Envoie de l'embed si il y a un salon logs
                if(config.channelLogsID)
                {
                    const embedLogs = createEmbed({
                        color: Colors.DarkBlue,
                        title: 'New Ticked Created!',
                        description: `Ticket \`${channel.name}\`(${channel}) has been **created** by ${interaction.user}(**${interaction.user.displayName}**)!`,
                        fields: [
                            { name : 'Subject', value: `\`\`\`${subject || 'No subject given'}\`\`\`` }
                        ]
                    })

                    const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);
                    return channelLogs.send({ embeds: [embedLogs] });
                }
                break;
            }

            case 'addPanel':
            {
                const { guild, fields } = interaction;

                const title = fields.getTextInputValue('panelTitle');
                const description = fields.getTextInputValue('panelDescription');

                const [rows] = await db.promise().query(
                    'SELECT COUNT(*) AS count FROM ticket_panels WHERE guildID = ?',
                    [guild.id]
                );
                const newID = rows[0].count + 1;

                await db.promise().query(
                    'INSERT INTO ticket_panels (guildID, title, description, ID) VALUES (?, ?, ?, ?)',
                    [guild.id, title, description, newID]
                );

                const embed = createEmbed({
                    title: 'Success!',
                    description: `Successfully added panel ID **${newID.toString()}**`,
                    fields: [
                        { name: 'Panel ID', value: ` \`\`\`${newID.toString()}\`\`\` `, inline: true },
                        { name: 'Panel Title', value: ` \`\`\`${title}\`\`\` `, inline: true },
                        { name: 'Panel Description', value: ` \`\`\`${description}\`\`\` `, inline: true }
                    ],
                    color: Colors.DarkGreen
                });

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                break;
            }

            case 'editPanel':
            {
                const { guild, fields } = interaction;
                const selectedId = store.id;

                const title = fields.getTextInputValue('panelTitle');
                const description = fields.getTextInputValue('panelDescription');

                await db.promise().query(
                    `UPDATE ticket_panels SET title = ?, description = ? WHERE guildID = ? AND ID = ?`,
                    [title, description, guild.id, selectedId]
                );

                const embed = createEmbed({
                    title: 'Success!',
                    description: `Successfully edited panel ID **${selectedId}**`,
                    fields: [
                        { name: 'Panel ID', value: ` \`\`\`${selectedId}\`\`\` `, inline: true },
                        { name: 'Panel Title', value: ` \`\`\`${title}\`\`\` `, inline: true },
                        { name: 'Panel Description', value: ` \`\`\`${description}\`\`\` `, inline: true }
                    ],
                    color: Colors.DarkGreen
                });

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                break;
            }





            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////  Paramètres généraux  /////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'generalSettings':
            {
                const categoryInput = interaction.fields.getTextInputValue('categoryTicket');
                const logChannelInput = interaction.fields.getTextInputValue('logsTicket');
                const closeTime = interaction.fields.getTextInputValue('closeTimeTicket');
                const rating = interaction.fields.getTextInputValue('ratingEmbed').toLowerCase();

                const category = categoryInput ? interaction.guild.channels.cache.find(
                    c => (c.name === categoryInput && c.type === ChannelType.GuildCategory) || c.id === categoryInput
                ) : null;
                const logChannel = logChannelInput ? interaction.guild.channels.cache.find(
                    c => (c.name === logChannelInput && c.type === ChannelType.GuildText) || c.id === logChannelInput
                ) : null;

                if (!category && categoryInput) {
                    return interaction.reply({ 
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Incorrect or non-existent category name!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (!logChannel && logChannelInput) {
                    return interaction.reply({
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Incorrect or non-existent log channel name!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (isNaN(closeTime)) {
                    return interaction.reply({
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Close time must be a number!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (rating !== 'true' && rating !== 'false') {
                    return interaction.reply({
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Rating must be either true or false!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                db.query(`
                    UPDATE ticket_config
                    SET categoryID = ?, channelLogsID = ?, closeTime = ?, rating = ?
                    WHERE guildID = ?
                `, [category ? category.id : null, logChannel ? logChannel.id : null, closeTime, rating, interaction.guild.id]);

                const embed = createEmbed({
                    color: Colors.DarkGreen,
                    title: 'Success!',
                    description: '> **0** problems found! Changes have been applied successfully.',
                    fields: [
                        { name: 'Rating System', value: `\`\`\`${rating === 'false' ? 'Disabled (false)' : 'Enabled (true)'}\`\`\``, inline: true },
                        { name: 'Close Button Timer', value: `\`\`\`${closeTime} seconds\`\`\``, inline: true },
                        { name: 'Ticket Logs Channel', value: `${logChannel}` },
                        { name: 'Tickets Category', value: `${category}` },
                    ]
                });

                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////  Role Settings  ////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'roleSettings':
            {
                const roleStaffInput = interaction.fields.getTextInputValue('roleStaff');
                const blacklistedRoleInput = interaction.fields.getTextInputValue('blacklistedRole');

                const roleStaff = roleStaffInput ? interaction.guild.roles.cache.find(
                    r => (r.name === roleStaffInput) || r.id === roleStaffInput
                ) : null;
                const blacklistedRole = blacklistedRoleInput ? interaction.guild.roles.cache.find(
                    r => (r.name === blacklistedRoleInput) || r.id === blacklistedRoleInput
                ) : null;

                if (!roleStaff && roleStaffInput) {
                    return interaction.reply({
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Incorrect role name or ID!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (!blacklistedRole && blacklistedRoleInput) {
                    return interaction.reply({
                        embeds: [createEmbed({
                            color: Colors.DarkRed,
                            title: 'Error!',
                            description: '> **1** problem found! Incorrect role name or ID!\nNo changes have been applied.',
                        })],
                        flags: MessageFlags.Ephemeral
                    });
                }

                db.query(`
                    UPDATE ticket_config
                    SET roleStaffID = ?, blacklistedRoleID = ?
                    WHERE guildID = ?
                `, [roleStaff ? roleStaff.id : null, blacklistedRole ? blacklistedRole.id : null, interaction.guild.id]);

                const embed = createEmbed({
                    color: Colors.DarkGreen,
                    title: 'Success!',
                    description: 'The previous values have been successfully updated to the new values!',
                    fields: [
                        { name: 'Staff Role', value: `${roleStaff || 'No role provided'}`, inline: true },
                        { name: 'Blacklisted Role', value: `${blacklistedRole || 'No role provided'}`, inline: true }
                    ]
                });

                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }

            default:
                return;
        }
    }
}
// Importation des éléments nécessaire de Discord.js
const { Events, ModalBuilder, TextInputStyle, ActionRowBuilder, ButtonStyle, Colors, MessageFlags } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createButton = require('../functions/createButton');
const createTextInput = require('../functions/createTextInput');
const createMenuBuilder = require('../functions/createMenuBuilder');
const { guild } = require('../functions/sharedStore');

// Forcer la conversion en type String
const ensureString = (val) => (typeof val === 'string' ? val : '');

// Variable pour vérifier si la suppression du salon est annulé
const isClosed = {};

// Exportation du code
module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, bot, db)
    {
        // Si l'interaction n'est pas un bouton
        if (!interaction.isButton())
            return;

        // Variables
        const { authorUser } = require('./modalInteractions');
        const guildId = interaction.guild?.id;
        guild.id = guildId;
        let member, modal;

        // Création du "Modal"
        const sendModal = async (customId, title, fields) => {
            modal = new ModalBuilder()
                .setTitle(title)
                .setCustomId(customId)
                .addComponents(...fields);
            await interaction.showModal(modal);
        };

        // Fonction pour envoyer une réponse avec un embed et des composants
        const sendResponse = async (embed, components) => {
            await interaction.reply({
                embeds: [embed],
                components: components || [],
                flags: MessageFlags.Ephemeral
            });

            return await interaction.fetchReply();
        };

        // Récupère la configuration dans la bdd
        const getConfig = () => new Promise(resolve => {
            db.query(`SELECT * FROM ticket_config WHERE guildID = '${guildId}'`, (err, res) => resolve(res?.[0] || {}));
        });

        const getRating = () => new Promise(resolve => {
            db.query(`SELECT * FROM ticket_rating WHERE guildID = '${guildId}'`, (err, res) => resolve(res?.[0] || {}));
        });

        const getList = () => new Promise(resolve => {
            db.query(`SELECT * FROM ticket_list WHERE guildID = '${guildId}' AND channelID = '${interaction.channel.id}'`, (err, res) => resolve(res?.[0] || {}));
        });

        // Exécuter en fonction de l'id du Bouton
        switch (interaction.customId)
        {
            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////// Setup de l'Embed ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'setup_embed':
            {
                if(!interaction.member.permissions.has('ManageChannels'))
                {
                    return sendResponse({ content: '❌ You don\'t have the permission to do that!' });
                }

                const config = await getConfig();
                await sendModal('customEmbedModal', 'Embed Customization', [
                    createTextInput({ label: 'Embed title', placeholder: 'Any title you want to show in the embed here, required.', value: config.title || '', customId: 'titleTextEmbed', required: true, style: TextInputStyle.Short }),
                    createTextInput({ label: 'Embed description', placeholder: 'Any Description you want to show in the embed here, required.', value: config.description || '', customId: 'descriptionTextEmbed', required: true, style: TextInputStyle.Paragraph, maxLength: 300 }),
                    createTextInput({ label: 'Embed footer', placeholder: 'Any Footer you want to show in the embed here, optional.', value: ensureString(config.footer), customId: 'footerTextEmbed', style: TextInputStyle.Short }),
                    createTextInput({ label: 'Embed Color hexcode', placeholder: 'Any color hexcode (e.x "ffffff") or leave it empty, optional.', value: ensureString(config.color), customId: 'colorTextEmbed', style: TextInputStyle.Short }),
                    createTextInput({ label: 'Embed image url', placeholder: 'Any image url to show.', value: ensureString(config.imageURL) || 'https://i.imgur.com/AZlgvgi.png', customId: 'imageTextEmbed', style: TextInputStyle.Short })
                ]);
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////// Panels de l'Embed ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'setup_panels':
            {
                const [panels] = await db.promise().query(`SELECT * FROM ticket_panels WHERE guildID = ? ORDER BY ID ASC`, [guildId]);
                const panelCount = panels.length;

                const embedPanels = createEmbed({
                    title: "Panels Management",
                    description: "> Manage your ticket panels using the buttons below this embed, leave everything as default if you want to use a button to open the ticket instead (no panels), you can setup a maximum of **7** panels.",
                    fields: panels.map(p => ({ name: `ID #${p.ID} - ${p.title}`, value: ` \`\`\`${p.description}\`\`\` ` })),
                    footer: 'When you are done configuring the panels press the "Done" button to save changes.',
                    color: Colors.DarkGreen
                });

                const panelButtons = new ActionRowBuilder()
                .addComponents(
                    createButton({ label: 'Add new panel', customId: 'addPanel', style: ButtonStyle.Primary, disabled: panelCount >= 7 }),
                    createButton({ label: 'Edit panel', customId: 'editPanel', style: ButtonStyle.Secondary, disabled: panelCount === 0 }),
                    createButton({ label: 'Delete panel', customId: 'deletePanel', style: ButtonStyle.Danger, disabled: panelCount === 0 })
                );

                await sendResponse(embedPanels, [panelButtons]);
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////// Envoie de l'Embed ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'send':
            {
                const configSend = await getConfig();

                if (Object.keys(configSend).length === 0)
                    return sendResponse({ content: '❌ No embed to send!' });

                const [panelsSend] = await db.promise().query(`SELECT * FROM ticket_panels WHERE guildID = ?`, [guildId]);
                const panelCountSend = panelsSend.length;

                const embedSend = createEmbed({
                    title: configSend.title,
                    description: configSend.description,
                    color: configSend.color == null ? Colors.Blurple : configSend.color,
                    footer: configSend.footer,
                    image: configSend.imageURL
                });

                let componentsSend;
                if(panelCountSend > 0)
                {
                    const options = panelsSend.map(panel => ({ label: panel.title, description: panel.description, value: panel.ID.toString() }));
                    componentsSend = createMenuBuilder({ customId: 'panelActions', placeholder: 'Select a Ticket panel!', options });
                }
                else
                {
                    componentsSend = new ActionRowBuilder()
                    .addComponents(
                        createButton({ label: 'Open a Ticket', emoji: '🎟', customId: 'openTicket', style: ButtonStyle.Primary })
                    );
                }

                await interaction.update({ embeds: [embedSend], components: [componentsSend] });
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////// Création du ticket ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'openTicket':
            {
                const configOpen = await getConfig();

                if(configOpen.blacklistedRoleID && interaction.member.roles.cache.has(configOpen.blacklistedRoleID))
                {
                    const embedError = createEmbed({
                        color: Colors.DarkRed,
                        title: 'You can\'t create tickets!',
                        description: `Hey **${interaction.user.displayName}**! Unfortunately, one of your role ( <@&${configOpen.blacklistedRoleID}> ) has been restricted from creating new tickets. If you believe this is a mistake, contact a server manager to have the role removed from the ticket setup command.`
                    });
                    return sendResponse(embedError);
                }

                await sendModal('ticketSubjectModal', 'What do you need?', [
                    createTextInput({
                        label: 'Ticket subject',
                        placeholder: 'You can include a resume of why you are opening this ticket here! You can also leave it empty.',
                        customId: 'subject',
                        style: TextInputStyle.Paragraph,
                        maxLength: 200
                    })
                ]);
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////  Close the ticket  //////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'closeTicket':
            {
                await handleCloseTicket(interaction, authorUser , db, guildId, getConfig(), getList());
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            /////////////////////////  Close the ticket (now)  ////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'closeNow':
            {
                await handleCloseNow(interaction, authorUser , db, guildId, getConfig(), bot);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////  Cancel the closing  //////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'cancelClosing':
            {
                isClosed[interaction.channel.id] = true;

                const embedCancel = createEmbed({
                    color: Colors.DarkGreen,
                    description: '> ✅ Successfully cancelled this action! This Ticket **won\'t** get closed, if you want to close it you can use the **Close Ticket** button again.'
                });

                await interaction.update({ embeds: [embedCancel], components: [], flags: MessageFlags.Ephemeral });
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////// Staff Panel ///////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'backToThePanel':
            case 'staffPanel':
            {
                await handleStaffPanel(interaction, getList());
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////  Close and save  /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'closeAndSave':
            {
                await handleCloseAndSave(interaction, authorUser , db, guildId, bot);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////  Claim Ticket  /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'claimTicket':
            {
                await handleClaimTicket(interaction, authorUser , db, guildId, getConfig());
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////  Unclaim Ticket  ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'unclaimTicket':
            {
                await handleUnclaimTicket(interaction, authorUser , db, guildId, getConfig());
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////  Mark as Sticky  /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'markAsSticky':
            {
                await handleMarkAsSticky(interaction, authorUser , db, guildId, getConfig());
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////  Unmark as Sticky  ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'unmarkAsSticky':
            {
                await handleUnmarkAsSticky(interaction, authorUser , db, guildId, getConfig());
                break;
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////  User info  ///////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'authorInfo':
            case 'userInfo':
            {
                await handleUserInfo(interaction, authorUser , bot);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////// Open Ticket Again  /////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'openTicketAgain':
            {
                await handleOpenTicketAgain(interaction, authorUser , db, guildId);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////  Show user avatar  ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'userAvatar':
            {
                await handleUserAvatar(interaction, authorUser , bot);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////  Add Panels  /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'addPanel':
            {
                await sendModal('addPanel', 'Create new panel', [
                    createTextInput({ label: 'Panel Title', placeholder: 'Title here (ex. "General Support")', customId: 'panelTitle', required: true, style: TextInputStyle.Short }),
                    createTextInput({ label: 'Panel description', placeholder: 'Description here (ex. "Get general support")', customId: 'panelDescription', required: true, style: TextInputStyle.Short })
                ]);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////  Edit Panels  /////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'editPanel':
            {
                await handleEditPanel(interaction, guildId, db);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////  Delete Panels  ////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'deletePanel':
            {
                await handleDeletePanel(interaction, guildId, db);
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////  General Settings  ///////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'generalSettings':
            {
                await handleGeneralSettings(interaction, getConfig());
                break;   
            }

            ///////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////  Roles Settings  ////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////
            case 'roleSettings':
            {
                await handleRoleSettings(interaction, getConfig());
                break;   
            }

            default:
                break;
        }
    }
}

// Functions for handling specific cases

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  Close the ticket  //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleCloseTicket(interaction, authorUser , db, guildId, getConfig, getList)
{
    const config = await getConfig;
    const list = await getList;

    if(list.markedAsSticky == '1')
    {
        const embed = createEmbed({
            title: 'You can\'t close the ticket',
            description: 'The ticket has been marked as sticky, which means that nobody can close this ticket, until someone marks the ticket as non-sticky.',
            color: Colors.DarkRed
        });

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    isClosed[interaction.channel.id] = false;

    const endTime = Math.floor((Date.now() + config.closeTime * 1000) / 1000);
    const embed = createEmbed({
        color: Colors.Red,
        title: 'Closing Ticket!',
        description: `Hey ${interaction.user}, this ticket is closing <t:${endTime}:T>!`
    });

    const button = new ActionRowBuilder()
    .addComponents(
        createButton({ label: 'Close Now', emoji: '🔒', style: ButtonStyle.Danger, customId: 'closeNow' }),
        createButton({ label: 'Cancel', style: ButtonStyle.Primary, customId: 'cancelClosing' })
    );

    await interaction.reply({ embeds: [embed], components: [button], flags: MessageFlags.Ephemeral });

    setTimeout(async () => {
        try
        {
            if(!isClosed[interaction.channel.id])
            {
                await handleTicketClosure(interaction, authorUser, db, guildId, config);
            }
            delete isClosed[interaction.channel.id]; // Nettoyage
        } catch (err) {}
    }, config.closeTime * 1000);
}


///////////////////////////////////////////////////////////////////////////////////
/////////////////////////  Close the ticket (now)  ////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleCloseNow(interaction, authorUser, db, guildId, getConfig, bot)
{
    const config = await getConfig;
    if(config.markedAsSticky == '1')
    {
        const embed = createEmbed({
            title: 'You can\'t close the ticket',
            description: 'The ticket has been marked as sticky, which means that nobody can close this ticket, until someone marks the ticket as non-sticky.',
            color: Colors.DarkRed
        });
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    await handleTicketClosure(interaction, authorUser , db, guildId, config, bot);
    return;
}

// Instant close the ticket 
async function handleTicketClosure(interaction, authorUser , db, guildId, config, bot)
{
    if(config.channelLogsID)
    {
        const now = Math.floor(Date.now() / 1000);
        const embedLogs = createEmbed({
            color: Colors.DarkRed,
            fields: [
                { name: 'Logs - Ticket Closed!', value: `> Ticket \`#${interaction.channel.name}\` has been closed <t:${now}:R>! (<t:${now}:F>)` },
                { name: 'Ticket\'s Author', value: ` \`\`\`${authorUser .displayName} (${authorUser .id})\`\`\` ` },
                { name: 'Closed By', value: ` \`\`\`${interaction.user.displayName} (${interaction.user.id})\`\`\` ` },
                { name: 'Ticket ID', value: ` \`\`\`${interaction.channel.id}\`\`\` ` }
            ],
            timestamp: true
        });

        const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);
        await channelLogs.send({ embeds: [embedLogs] });
    }

    if(config.rating == 'true')
    {
        const embed = createEmbed({
            bot: bot,
            color: Colors.DarkBlue,
            author: { name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() || null },
            title: 'Ticket Closed',
            description: `Hey **${interaction.user.displayName}**, your ticket \`#${interaction.channel.name}\` has been closed by ${authorUser } (**${authorUser .username}**)!\n\nTo help **${interaction.guild.name}** improve their support ticket experience we would like to receive your anonymous feedback.`,
            footer: `How would you rate the support received?`
        });

        const ratingButtons = new ActionRowBuilder()
        .addComponents(
            createButton({ label: 'Very Bad!', style: ButtonStyle.Danger, customId: 'rateVeryBad' }),
            createButton({ label: 'Bad!', style: ButtonStyle.Danger, customId: 'rateBad' }),
            createButton({ label: 'Regular', style: ButtonStyle.Primary, customId: 'rateRegular' }),
            createButton({ label: 'Good!', style: ButtonStyle.Success, customId: 'rateGood' }),
            createButton({ label: 'Very Good!', style: ButtonStyle.Success, customId: 'rateVeryGood' })
        );

        await authorUser.send({ embeds: [embed], components: [ratingButtons] });
    }

    db.query(`DELETE FROM ticket_list WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);
    interaction.channel.delete();
}


///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// Staff Panel ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleStaffPanel(interaction, getList)
{
    if(!interaction.member.permissions.has('ManageChannels'))
    {
        return interaction.reply({ content: '❌ You don\'t have the permission to do that!', flags: MessageFlags.Ephemeral });
    }

    const config = await getList;
    const embed = createEmbed({
        title: 'Staff Panel',
        description: `Hey **${interaction.user.displayName}**, this is your staff panel! You can manage this ticket using the buttons below this message.`,
        color: Colors.DarkBlue
    });

    const buttons = getStaffPanelButtons(config, interaction.user.id);
    await interaction.reply({ embeds: [embed], components: [buttons], flags: MessageFlags.Ephemeral });
}

// Function that return buttons based on staff role
function getStaffPanelButtons(config, userId)
{
    const buttons = new ActionRowBuilder();

    if(config.markedAsSticky == '1')
    {
        if(config.ClaimedBy == userId)
        {
            buttons.addComponents(
                createButton({ label: 'Mark as non-Sticky', style: ButtonStyle.Success, emoji: '🗃️', customId: 'unmarkAsSticky' }),
                createButton({ label: 'Unclaim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'unclaimTicket' }),
                createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
            );
        }
        else if(config.ClaimedBy != 0)
        {
            buttons.addComponents(
                createButton({ label: 'Mark as non-Sticky', style: ButtonStyle.Success, emoji: '🗃️', customId: 'unmarkAsSticky' }),
                createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket', disabled: true }),
                createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
            );
        }
        else
        {
            buttons.addComponents(
                createButton({ label: 'Mark as non-Sticky', style: ButtonStyle.Success, emoji: '🗃️', customId: 'unmarkAsSticky' }),
                createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket' }),
                createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
            );
        }
    }
    else
    {   //  && config.ClaimedBy == userId
        if(config.Closed_Saved == '1')
        {
            if(config.ClaimedBy == userId)
            {
                buttons.addComponents(
                    createButton({ label: 'Open Ticket', style: ButtonStyle.Success, emoji: '🔓', customId: 'openTicketAgain' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Unclaim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'unclaimTicket' }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
            else if(config.ClaimedBy != 0)
            {
                buttons.addComponents(
                    createButton({ label: 'Open Ticket', style: ButtonStyle.Success, emoji: '🔓', customId: 'openTicketAgain' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket', disabled: true }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
            else
            {
                buttons.addComponents(
                    createButton({ label: 'Open Ticket', style: ButtonStyle.Success, emoji: '🔓', customId: 'openTicketAgain' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket' }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
        }
        else
        {
            if(config.ClaimedBy == userId)
            {
                buttons.addComponents(
                    createButton({ label: 'Close & Save', style: ButtonStyle.Primary, emoji: '💾', customId: 'closeAndSave' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Unclaim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'unclaimTicket' }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
            else if(config.ClaimedBy != 0)
            {
                buttons.addComponents(
                    createButton({ label: 'Close & Save', style: ButtonStyle.Primary, emoji: '💾', customId: 'closeAndSave' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket', disabled: true }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
            else
            {
                buttons.addComponents(
                    createButton({ label: 'Close & Save', style: ButtonStyle.Primary, emoji: '💾', customId: 'closeAndSave' }),
                    createButton({ label: 'Close Ticket', style: ButtonStyle.Danger, emoji: '🔒', customId: 'closeTicket' }),
                    createButton({ label: 'Claim Ticket', style: ButtonStyle.Secondary, emoji: '🙋', customId: 'claimTicket' }),
                    createButton({ label: 'Mark as Sticky', style: ButtonStyle.Secondary, emoji: '🗃️', customId: 'markAsSticky' }),
                    createButton({ label: 'User  Info', style: ButtonStyle.Secondary, emoji: '🪪', customId: 'userInfo' })
                );
            }
        }
    }
    return buttons;
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Unmark as Sticky  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleUnmarkAsSticky(interaction, authorUser , db, guildId, getConfig)
{
    const config = await getConfig;

    if (config.channelLogsID)
    {
        const embedLogs = createEmbed({
            title: 'Ticket Unmarked as Sticky',
            description: `Ticket \`#${interaction.channel.name}\` (${interaction.channel}) has been **unmarked as sticky** by ${interaction.user} (**${interaction.user.username}**)!`,
            color: Colors.DarkGold
        });

        const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);
        await channelLogs.send({ embeds: [embedLogs] });
    }

    const embed = createEmbed({
        title: 'Successfully Unmarked',
        description: 'Ticket successfully **unmarked** as sticky! Ticket\'s author and Staff is now able to close this ticket.',
        color: Colors.DarkGreen
    });

    db.query(`UPDATE ticket_list SET markedAsSticky = 0 WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);
    await interaction.update({ embeds: [embed], components: [], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Unclaim Ticket  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleUnclaimTicket(interaction, authorUser , db, guildId, getConfig)
{
    const config = await getConfig;

    if(config.channelLogsID)
    {
        const embedLogs = createEmbed({
            title: 'Ticket Unclaimed',
            description: `Ticket \`#${interaction.channel.name}\` (${interaction.channel}) by ${authorUser } (**${authorUser .username}**) has been __unclaimed__ by the staff member ${interaction.user} (**${interaction.user.username}**)!`,
            color: Colors.DarkGold
        });

        const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);
        await channelLogs.send({ embeds: [embedLogs] });
    }

    const embed = createEmbed({
        title: 'Ticket Unclaimed',
        description: `Hey **${interaction.user.displayName}**, this ticket has been __unclaimed__ by ${interaction.user} (**${interaction.user.username}**)!`,
        color: Colors.DarkBlue
    });

    await interaction.channel.send({ embeds: [embed] });
    db.query(`UPDATE ticket_list SET ClaimedBy = '0' WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);

    const embedUpdate = createEmbed({
        title: 'Successfully unclaimed!',
        description: `> ✅ **${interaction.user.displayName}** You successfully marked this ticket as **unclaimed**!`,
        color: Colors.DarkGreen
    });

    await interaction.update({ embeds: [embedUpdate], components: [], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Close and save  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleCloseAndSave(interaction, authorUser , db, guildId, bot)
{
    const embed = createEmbed({
        author: interaction.guild.name,
        bot: bot,
        title: 'Closed & Saved',
        description: `This ticket has been Closed & Saved by ${interaction.user.username}!\n \`\`\`This Ticket won't be seen by the person that opened it anymore, only staffs, if you wish to open this ticket back just use the panel!\`\`\` `,
        color: Colors.DarkBlue
    });

    const cpn = new ActionRowBuilder()
    .addComponents(
        createButton({ label: 'Close Ticket', customId: 'closeTicket', emoji: '🔒', style: ButtonStyle.Danger }),
        createButton({ label: 'Staff Panel', style: ButtonStyle.Primary, emoji: '🛠️', customId: 'staffPanel' })
    );

    await interaction.channel.permissionOverwrites.edit(authorUser .id, { ViewChannel: false });
    db.query(`UPDATE ticket_list SET Closed_Saved = 1 WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);

    await interaction.channel.send({ embeds: [embed], components: [cpn] });
}


///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Claim Ticket  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleClaimTicket(interaction, authorUser  , db, guildId, getConfig)
{
    const config = await getConfig;

    if(config.channelLogsID)
    {
        const embedLogs = createEmbed({
            title: 'Ticket Claimed',
            description: `Ticket \`#${interaction.channel.name}\` (${interaction.channel}) by ${authorUser } (**${authorUser .username}**) has been __claimed__ by the staff member ${interaction.user} (**${interaction.user.username}**)!`,
            color: Colors.DarkGreen
        });

        const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);
        await channelLogs.send({ embeds: [embedLogs] });
    }

    const embed = createEmbed({
        title: 'Ticket Claimed',
        description: `Hey **${interaction.user.displayName}**, this ticket has been claimed by ${interaction.user} (**${interaction.user.username}**)!`,
        color: Colors.DarkBlue
    });

    await interaction.channel.send({ embeds: [embed] });
    db.query(`UPDATE ticket_list SET ClaimedBy = ${interaction.user.id} WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);

    const embedUpdate = createEmbed({
        title: 'Successfully claimed!',
        description: `> ✅ **${interaction.user.displayName}** You successfully claimed this ticket!`,
        color: Colors.DarkGreen
    });

    await interaction.update({ embeds: [embedUpdate], components: [], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Mark as Sticky  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleMarkAsSticky(interaction, authorUser , db, guildId, getConfig)
{
    const config = await getConfig;

    if(config.channelLogsID)
    {
        const embedLogs = createEmbed({
            title: 'Ticket Marked as Sticky',
            description: `Ticket \`#${interaction.channel.name}\` (${interaction.channel}) has been **marked as sticky** by ${interaction.user} (**${interaction.user.username}**)!`,
            color: Colors.DarkGreen
        });

        const channelLogs = interaction.guild.channels.cache.get(config.channelLogsID);

        await channelLogs.send({ embeds: [embedLogs] });
    }

    const embed = createEmbed({
        title: 'Successfully Marked',
        description: 'Ticket successfully **marked** as sticky! Ticket\'s author and Staff is not able to close this ticket anymore till it gets unmarked as sticky.',
        color: Colors.DarkGreen
    });

    db.query(`UPDATE ticket_list SET markedAsSticky = 1 WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);
    await interaction.update({ embeds: [embed], components: [], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Show user avatar  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleUserInfo(interaction, authorUser , bot)
{
    const member = interaction.guild.members.cache.get(authorUser .id);

    const embed = createEmbed({
        bot: bot,
        author: { name: `${interaction.user.displayName}'s user info`, iconURL: interaction.user.displayAvatarURL() },
        title: 'Ticket Button - User Info',
        description: '> 🪪 Informations about the Ticket\'s author.',
        fields: [
            { name: 'Identificators', value: `\`${authorUser .id}\` ${authorUser }` },
            { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
            { name: 'Registered', value: `<t:${Math.floor(authorUser .createdTimestamp / 1000)}:F>`, inline: true },
            { name: 'Key Permissions', value: `\`\`\`${member.permissions.toArray().join(', ') || 'None'}\`\`\`` },
            { name: 'Acknowledgements', value: `\`\`\`${member.id === interaction.guild.ownerId ? 'Server Owner' : 'Member'}\`\`\`` },
        ],
        color: Colors.DarkBlue,
        thumbnail: bot.user.displayAvatarURL()
    });

    const buttons = [
        createButton({ label: 'User  Avatar', style: ButtonStyle.Secondary, customId: 'userAvatar' }),
        interaction.customId === 'userInfo' ? createButton({ label: 'Back to the Panel', emoji: '◀️', style: ButtonStyle.Primary, customId: 'backToThePanel' }) : null
    ].filter(Boolean);

    const button = new ActionRowBuilder().addComponents(...buttons);

    await interaction.reply({ embeds: [embed], components: [button], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Open Ticket Again  /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleOpenTicketAgain(interaction, authorUser , db, guildId)
{
    db.query(`UPDATE ticket_list SET Closed_Saved = 0 WHERE guildID = ? AND channelID = ?`, [guildId, interaction.channel.id]);
    await interaction.channel.permissionOverwrites.edit(authorUser .id, { ViewChannel: true });
    await interaction.reply('Good');
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  Show user avatar  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleUserAvatar(interaction, authorUser , bot)
{
    const member = interaction.guild.members.cache.get(authorUser.id);

    const embed = createEmbed({
        bot: bot,
        author: { name: `${interaction.user.displayName}'s avatar`, iconURL: interaction.user.displayAvatarURL() },
        title: 'Ticket Button - User Info - Avatar',
        image: member.displayAvatarURL({ size: 1024, dynamic: true }),
        color: Colors.DarkBlue
    });

    const formats = ['png', 'jpg', 'webp'];
    const button = new ActionRowBuilder()
    .addComponents(
        formats.map(format => createButton({
            label: format.toUpperCase(),
            style: ButtonStyle.Link,
            url: authorUser .displayAvatarURL({ extension: format, size: 1024, forceStatic: true })
        }))
    );
    
    await interaction.reply({ embeds: [embed], components: [button], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  Edit Panels  /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleEditPanel(interaction, guildId, db)
{
    const [rows] = await db.promise().query(`SELECT * FROM ticket_panels WHERE guildID = ?`, [guildId]);
    const options = rows.map(panel => ({ label: panel.title, value: panel.ID.toString() }));

    const menu = createMenuBuilder({
        customId: 'selectPanelToEdit',
        placeholder: 'Choose a panel.',
        options
    });

    const embed = createEmbed({
        color: Colors.DarkOrange,
        title: 'Editing a panel',
        description: 'Select the panel to be modified'
    });

    await interaction.reply({ embeds: [embed], components: [menu], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Delete Panels  ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleDeletePanel(interaction, guildId, db)
{
    const [rows] = await db.promise().query(`SELECT * FROM ticket_panels WHERE guildID = ?`, [guildId]);
    const options = rows.map(panel => ({ label: panel.title, value: panel.ID.toString() }));

    const menu = createMenuBuilder({
        customId: 'selectPanelToDelete',
        placeholder: 'Choose a panel.',
        options
    });

    const embed = createEmbed({
        color: Colors.DarkRed,
        title: 'Deleting a panel',
        description: 'You are about to delete an option from the drop-down menu. Choose the option you wish to delete, or dismiss this interaction to cancel.'
    });

    await interaction.reply({ embeds: [embed], components: [menu], flags: MessageFlags.Ephemeral });
}


///////////////////////////////////////////////////////////////////////////////////
////////////////////////////  General Settings  ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleGeneralSettings(interaction, getConfig)
{
    const sendModal = async (customId, title, fields) => {
        modal = new ModalBuilder()
            .setTitle(title)
            .setCustomId(customId)
            .addComponents(...fields);
        await interaction.showModal(modal);
    };

    if(!interaction.member.permissions.has('ManageChannels'))
    {
        return interaction.reply({ content: '❌ You don\'t have the permission to do that!', flags: MessageFlags.Ephemeral });
    }

    const config = await getConfig;

    if(Object.keys(config).length === 0)
    {
        return interaction.reply({ content: '❌ There\'s no Embed to configure, just `/ticket menu`!', flags: MessageFlags.Ephemeral });
    }

    await sendModal('generalSettings', 'General Settings', [
        createTextInput({ label: 'New tickets category', placeholder: 'Category ID or name, where tickets will be created.', value: config.categoryID || '', customId: 'categoryTicket', style: TextInputStyle.Short }),
        createTextInput({ label: 'Ticket logs channel', placeholder: 'Channel ID or name, where I will log closed/opened ticket.', value: config.channelLogsID || '', customId: 'logsTicket', style: TextInputStyle.Short }),
        createTextInput({ label: 'Close button time (in seconds)', placeholder: 'Time in seconds before ticket closes.', value: config.closeTime || '', customId: 'closeTimeTicket', style: TextInputStyle.Short }),
        createTextInput({ label: 'Enable rating? (true/false)', placeholder: 'Enables or disables (true/false) the possibility of noting the ticket system.', value: config.rating || '', customId: 'ratingEmbed', style: TextInputStyle.Short })
    ]);
}


///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  Roles Settings  ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
async function handleRoleSettings(interaction, getConfig)
{
    const sendModal = async (customId, title, fields) => {
        modal = new ModalBuilder()
            .setTitle(title)
            .setCustomId(customId)
            .addComponents(...fields);
        await interaction.showModal(modal);
    };

    if(!interaction.member.permissions.has('ManageChannels'))
    {
        return interaction.reply({ content: '❌ You don\'t have the permission to do that!', flags: MessageFlags.Ephemeral });
    }

    const config = await getConfig;

    if(Object.keys(config).length === 0)
    {
        return interaction.reply({ content: '❌ There\'s no Embed to configure, just `/ticket menu`!', flags: MessageFlags.Ephemeral });
    }

    await sendModal('roleSettings', 'Role Settings', [
        createTextInput({ label: 'Staff role', placeholder: 'Role name or ID', value: config.roleStaffID || '', customId: 'roleStaff', style: TextInputStyle.Short }),
        createTextInput({ label: 'Blacklisted role', placeholder: 'Role name or ID', value: config.blacklistedRoleID || '', customId: 'blacklistedRole', style: TextInputStyle.Short })
    ]);
}
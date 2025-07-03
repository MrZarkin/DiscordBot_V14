// Importation des éléments nécessaire de Discord.js
const { Events, Colors, MessageFlags, TextInputStyle, ModalBuilder } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const createTextInput = require('../functions/createTextInput');
const store = require('../functions/sharedStore');

// Exportation du code
module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, bot, db) 
    {
        if (!interaction.isStringSelectMenu())
            return;

        // Création du "Modal"
        const sendModal = async (customId, title, fields) => {
            modal = new ModalBuilder()
                .setTitle(title)
                .setCustomId(customId);
            modal.addComponents(...fields);
            await interaction.showModal(modal);
        };

        switch(interaction.customId)
        {
            case 'selectPanelToDelete':
            {
                const selectedId = parseInt(interaction.values[0]);
                const guildId = interaction.guild.id;

                await db.promise().query(
                    'DELETE FROM ticket_panels WHERE guildID = ? AND ID = ?',
                    [guildId, selectedId]
                );

                const embed = createEmbed({
                    description: '✅ Success! The panel has been deleted!',
                    color: Colors.DarkGreen
                })

                const message = await interaction.update({
                    embeds: [embed],
                    components: [],
                    flags: MessageFlags.Ephemeral
                });

                setTimeout(() => {
                    message.delete().catch(console.error);
                }, 5000);
                break;
            }

            case 'selectPanelToEdit':
            {
                const selectedId = parseInt(interaction.values[0]);
                store.id = selectedId;
                
                const guildId = interaction.guild.id;

                const [rows] = await db.promise().query(
                    `SELECT title, description FROM ticket_panels WHERE guildID = ? AND ID = ?`,
                    [guildId, selectedId]
                );

                const panel = rows[0];

                await sendModal('editPanel', 'Edit a panel', [
                    createTextInput({ label: 'Panel Title', placeholder: 'Title here (ex. "General Support")', customId: 'panelTitle', value: panel.title, required: true, style: TextInputStyle.Short }),
                    createTextInput({ label: 'Panel description', placeholder: 'Description here (ex. "Get general support")', customId: 'panelDescription', value: panel.description, required: true, style: TextInputStyle.Short })
                ]);
                break;
            }

            case 'panelActions':
            {
                const selectedId = parseInt(interaction.values[0]);
                
                const guildId = interaction.guild.id;

                const [rows] = await db.promise().query(
                    `SELECT title, description FROM ticket_panels WHERE guildID = ? AND ID = ?`,
                    [guildId, selectedId]
                );

                store.panelTitle = rows[0].title;

                await sendModal('ticketSubjectModal_panel', 'What do you need?', [
                    createTextInput({ label: 'Ticket subject', placeholder: 'You can include a resume of why you are opening this ticket here! You can also leave it empty.', customId: 'subject', style: TextInputStyle.Paragraph, maxLength: 200 })
                ]);

                break;
            }

            default:
                return;
        }
    }
}
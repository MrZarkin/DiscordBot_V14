const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');


/**
 * Crée un menu déroulant personnalisé
 * @param {string} customId - Identifiant unique du menu (à récupérer dans l'interaction)
 * @param {string} placeholder - Texte affiché quand rien n'est sélectionné
 * @param {Array<{ label: string, value: string, description?: string, emoji?: string }>} options - Les options du menu
 * @param {boolean} [disabled=false] - Si le menu doit être désactivé
 * @returns {ActionRowBuilder} - ActionRow contenant le menu
 */

function createMenuBuilder({
    customId,
    placeholder,
    disabled = false,
    options
} = {}) {
    const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setDisabled(disabled)
    .setOptions(options);

    return new ActionRowBuilder().addComponents(menu);
}

module.exports = createMenuBuilder;
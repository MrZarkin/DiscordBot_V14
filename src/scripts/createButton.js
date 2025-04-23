// Importation d'ButtonBuilder / ButtonStyle
const { ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Crée un bouton Discord facilement.
 * @param {Object} options - Options pour créer le bouton.
 * @param {string} options.label - Le texte affiché sur le bouton.
 * @param {string} options.customId - L'identifiant unique du bouton (pour les interactions).
 * @param {string} [options.style] - Le style du bouton (PRIMARY, SECONDARY, SUCCESS, DANGER).
 * @param {string} [options.emoji] - Un emoji à afficher dans le bouton.
 * @param {boolean} [options.disabled] - Si le bouton est désactivé.
 * @param {string} [options.url] - Lien vers un site externe (pour LINK buttons uniquement).
 * @returns {ButtonBuilder}
 */

function createButton({
    label,
    customId,
    style = ButtonStyle.Secondary,
    emoji,
    disabled = false,
    url
} = {}) {

    const button = new ButtonBuilder()
        .setLabel(label)
        .setStyle(ButtonStyle[style])
        .setDisabled(disabled);

    if(style === ButtonStyle.Link && url)
        button.setURL(url);
    else
        button.setCustomId(customId);

    if(emoji) button.setEmoji(emoji);

    return button;
}
  
module.exports = createButton;
const { TextInputBuilder, ActionRowBuilder } = require('discord.js');

function createTextInput({
    label,
    placeholder = '',
    value = '',
    maxLength,
    style,
    required = false,
    customId
} = {}) {
    const input = new TextInputBuilder()
    .setLabel(label)
    .setPlaceholder(placeholder)
    .setValue(value)
    .setStyle(style)
    .setRequired(required)
    .setCustomId(customId);

    if (maxLength) input.setMaxLength(maxLength);

    return new ActionRowBuilder().addComponents(input);
}

module.exports = createTextInput;
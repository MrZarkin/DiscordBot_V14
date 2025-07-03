// Importation d'EmbedBuilder
const { EmbedBuilder } = require('discord.js');

/**
 * Crée un embed personnalisé.
 * @param {Object} options - Les options pour construire l'embed.
 * @param {string} options.title - Le titre de l'embed.
 * @param {string} options.description - La description de l'embed.
 * @param {string} [options.color] - La couleur de l'embed (hex ou nom de couleur).
 * @param {Object} [options.footer] - Footer text & icon.
 * @param {Object} [options.author] - Author name & icon.
 * @param {Array} [options.fields] - Champs supplémentaires pour l'embed.
 * @param {string} [options.thumbnail] - URL de la miniature.
 * @param {string} [options.image] - URL d'image principale.
 * @returns {EmbedBuilder}
 */

function createEmbed({

  title,
  url,
  description,
  color = 0x2b2d31,
  footer,
  author,
  thumbnail,
  image,
  timestamp = false,
  fields,
  bot
} = {}) {
  const embed = new EmbedBuilder();

  if (title) embed.setTitle(title);
  if (url) embed.setURL(url);
  if (description) embed.setDescription(description);
  if (color) embed.setColor(color);
  if (footer) embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
  if (author) embed.setAuthor(typeof author === 'string' ? { name: author, iconURL: bot?.user?.displayAvatarURL() } : author);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);
  if (timestamp) embed.setTimestamp();
  if (Array.isArray(fields)) embed.addFields(fields);

  return embed;
}
  
module.exports = createEmbed;
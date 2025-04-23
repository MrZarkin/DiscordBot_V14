// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../scripts/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('warn')
            .setDescription('Warns a member.')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('The user to warn.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason of the warn.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, bot, db)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString('reason') || 'No reason given';

        if((interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
        || (member && !member.moderatable) // Si le membre n'est pas modérable 
        || (await interaction.guild.fetchOwner().id === user.id)) // Si proprio du serveur = utilisateur ciblé
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be warned! I have not permission to warn this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        let ID = await bot.function.createID("WARN");

        db.query(`
            INSERT INTO warns (guildID, userID, authorID, warnID, reason, date)
            VALUES
            (
                '${interaction.guild.id}',
                '${user.id}',
                '${interaction.user.id}',
                '${ID}',
                '${reason.replace(/'/g, "\\'")}',
                '${Date.now()}'
            )
        `);

        const endTimestamp = new Date(Date.now()) // utiliser ms() pour parser
        const endDate = Math.floor(endTimestamp.getTime() / 1000);

        // Création d'un embed de réponse
        let Embed = createEmbed({
            title: '⚠️ Warning',
            color: Colors.DarkRed,
            description: `**${user.displayName}** has been warned!`,
            fields: [
                { name: '', value: `> Author: ${interaction.user}\n> Date: <t:${endDate}:f>\n> Reason: **${reason}**`},
            ],
            timestamp: true
        });

        // Création d'un embed de réponse
        let EmbedDM = createEmbed({
            title: '⚠️ Warning',
            color: Colors.DarkRed,
            description: `You have just been warned on server ${interaction.guild.name}`,
            fields: [
                { name: '', value: `> Author: ${interaction.user}\n> Date: <t:${endDate}:f>\n> Reason: **${reason}**`},
            ],
            timestamp: true
        });

        // Si le membre est humain -> Envoyer en message privé
        if(!member.user.bot)
            await user.send({ embeds: [EmbedDM] });

        interaction.reply({ embeds: [Embed] });
    }
}
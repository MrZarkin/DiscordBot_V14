// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('nick')
            .setDescription('Changes the nickname of a member.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to set nick for.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('new_nick')
                    .setDescription('The new nickname.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const name = interaction.options.getString("new_nick");

        if (!name)
        {
            await interaction.reply({
                content: `The nickname of ${user} on this server has been reset !`,
                flags: MessageFlags.Ephemeral
            });
            return member.setNickname(null); // null pour reset le surnom
        }

        if ((interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (!member.moderatable)) // Si le membre n'est pas modérable 
        {
            return interaction.reply({
                content: "You can't change his nickname!",
                flags: MessageFlags.Ephemeral
            })
        }

        // Changer le surnom
        await member.setNickname(name);

        await interaction.reply({
            content: `The nickname of ${user} on this server has been changed to **${name}**!`,
            flags: MessageFlags.Ephemeral
        });
    }
}
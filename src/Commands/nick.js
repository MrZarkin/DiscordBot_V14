// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Changes the nickname of a member.')
        .addUserOption(option =>
            option
            .setName('member')
            .setDescription('Member to set nick for.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('nickname')
            .setDescription('The new nickname.')
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("member");
        const member = interaction.guild.members.cache.get(user.id);
        const name = interaction.options.getString("nickname");

        try
        {
            if ((interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (!member.moderatable)) // Si le membre n'est pas modérable
            {
                return interaction.reply({
                    content: `❌ **${user.displayName}** cannot be nicknamed! I have not permission to manage nickname of this user!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if(!name)
            {
                await member.setNickname(null); // null pour reset le surnom
                
                return interaction.reply({
                    content: `🆕 The nickname of **${user.displayName}** on this server has been reset!`,
                    flags: MessageFlags.Ephemeral
                });
            };

            // Changer le surnom
            await member.setNickname(name);

            await interaction.reply({
                content: `🆕 Sucess! The nickname of **${user.displayName}** on this server has been updated to ${name}!`,
                flags: MessageFlags.Ephemeral
            });
        }
        catch(err)
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be muted! I have not permission to ban this user!`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
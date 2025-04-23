// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('unban')
            .setDescription('Unbans a member.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to remove the ban of.')
                    .setRequired(true)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser("user");

        // Est-ce que le membre est banni ...
        if (!(await interaction.guild.bans.fetch()).get(user.id)) // Si le membre n'est pas ban
        return interaction.reply({
            content: `❌ **${user.displayName}** cannot be unbanned! The member isn't unban from the server!`,
            flags: MessageFlags.Ephemeral
        });

        await interaction.reply(`✅ Sucess! **${user.displayName}** has been unbanned from the server!`);

        // D�bannir le membre
        return interaction.guild.members.unban(user);
    }
}
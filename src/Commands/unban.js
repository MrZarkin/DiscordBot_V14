// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
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
        // R�cup�rer la valeur des param�tres
        const user = interaction.options.getUser("user");

        // Est-ce que le membre est banni ...
        if (!(await interaction.guild.bans.fetch()).get(user.id)) // Si le membre n'est pas ban
            return interaction.reply({
                content: "This member isn't ban!",
                flags: MessageFlags.Ephemeral
            });

        await interaction.reply({
            content: `${user.tag} has been unbanned from the server !`,
            flags: MessageFlags.Ephemeral
        });

        // D�bannir le membre
        await interaction.guild.members.unban(user);
    }
}
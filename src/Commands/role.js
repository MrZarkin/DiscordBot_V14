// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('role')
            .setDescription('Gives/Removes a role to a user.')
            .addStringOption(option => 
                option
                    .setName('type')
                    .setDescription('Type of action.')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Give', value: 'give' },
                        { name: 'Remove', value: 'remove' },
                    )
                )
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to give role for.')
                    .setRequired(true)
                )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('The role to give.')
                    .setRequired(true)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const type = interaction.options.getString('type');
        const role = interaction.options.getRole('role');
        const author = interaction.guild.members.cache.get(interaction.user.id);

        // Si le rôle est supérieur à celui de l'auteur
        if(role.position > author.roles.highest.position)
            return interaction.reply({
                content: "I can't manage this role!",
                flags: MessageFlags.Ephemeral
            })

        // En fonction de donner/supprimer le role
        if(type === 'give')
        {
            // Si le membre à déjà ce role
            if(member.roles.cache.some(r => r === role.name))
                return interaction.reply({
                    content: `${user.username} already has the ${role.name} role!`,
                    flags: MessageFlags.Ephemeral
                })
            
            // Ajout du role
            member.roles.add(role);

            await interaction.reply({
                content: `Changed roles for ${user.username}, **+${role.name}**`,
                flags: MessageFlags.Ephemeral
            })
        }
        else if(type === 'remove')
        {
            // Si le membre n'a déjà pas ce role
            if(!member.roles.cache.some(r => r === role.name))
                return interaction.reply({
                    content: `${user.username} doesn't already have this role!`,
                    flags: MessageFlags.Ephemeral
                })

            // Suppression du role
            member.roles.remove(role);

            await interaction.reply({
                content: `Changed roles for ${user.username}, **-${role.name}**`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
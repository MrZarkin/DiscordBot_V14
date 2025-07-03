// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('role')
        .setDescription('Gives/Removes a role to a user.')
        .addSubcommand(command => 
            command
            .setName('give')
            .setDescription('Add a role to a member.')
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
        )
        .addSubcommand(command => 
            command
            .setName('remove')
            .setDescription('Remove a role from a member.')
            .addUserOption(option =>
                option
                .setName('user')
                .setDescription('User to remove role for.')
                .setRequired(true)
            )
            .addRoleOption(option =>
                option
                .setName('role')
                .setDescription('The role to remove.')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const { options } = interaction;
        const sub = options.getSubcommand();
        const user = options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const type = options.getString('type');
        const role = options.getRole('role');
        const author = interaction.guild.members.cache.get(interaction.user.id);

        if((interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
        || (member && !member.moderatable) // Si le membre n'est pas modérable 
        || (await interaction.guild.fetchOwner().id === user.id)) // Si proprio du serveur = utilisateur ciblé
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be managed! I have not permission to manage this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Si le rôle est supérieur à celui de l'auteur
        if(role.position > author.roles.highest.position)
            return interaction.reply({
                content: `❌ I can't manage this role!`,
                flags: MessageFlags.Ephemeral
            });

        switch(sub)
        {
            case 'give':
                // Si le membre à déjà ce role
                if(member.roles.cache.some(r => r === role.name))
                    return interaction.reply({
                        content: `❌ **${user.username}** already has the ${role} role!`,
                        flags: MessageFlags.Ephemeral
                    });
                
                // Ajout du role
                member.roles.add(role);

                await interaction.reply(`✅ Sucess! Changed roles for **${user.username}**, **+${role}**`);
                break;

            case 'remove':
                // Si le membre n'a déjà pas ce role
                if(!member.roles.cache.some(r => r === role.name))
                    return interaction.reply({
                        content: `❌ **${user.username}** doesn't already have this role!`,
                        flags: MessageFlags.Ephemeral
                    });

                // Suppression du role
                member.roles.remove(role);

                await interaction.reply(`✅ Sucess! Changed roles for **${user.username}**, **-${role}**`);
                break;

            default:
                break;
        }
    }
}
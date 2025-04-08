// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Bans a member.')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to ban.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('Time duration for the ban.')
                    .setRequired(false)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('The reason of the ban.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction)
    {
        // Récupéré la valeurs des options
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString('reason') ?? 'No reason given';
        let time = interaction.options.getString('time') ?? null;

        if(time != null && isNaN(ms(time)))
            // Si on convertie time en milliseconde et que c'est pas un nombre ...
            return interaction.reply({
                content: "This type of duration is not recognized! Try the command `/ban [user] {time m/h/d ?} <reason ?>`",
                flags: MessageFlags.Ephemeral
            });

        if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
            || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = utilisateur ciblé
            || (member && !member.bannable) // Si ce membre est bien sur le serveur et peut être bannissable
            || (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (await interaction.guild.bans.fetch()).get(user.id)) // Si le membre est déjà banni
        { 
            return interaction.reply({
                content: `You can't ban **@${user.username}**`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Si le membre est humain -> Envoyer en message privé
        if(!member.user.bot)
            await user.send(`You've been banned from the server ${interaction.guild.name} by ${interaction.user.tag}. Reason: \`${reason}\`. Duration: \`${time == null ? "No limits" : time}\``);
        
        await interaction.reply({
            content: `${user} has been banned for the reason: \`${reason}\`.  Duration: \`${time == null ? "No limits" : time}\``,
            flags: MessageFlags.Ephemeral
        });
        
        // Bannir le membre avec la raison
        await interaction.guild.bans.create(user.id, {reason: reason});
        
        // Enlever le ban à la fin du temps
        if(time != null)
        {
            setTimeout(async () => {
                interaction.guild.members.unban(user);
            }, ms(time));
        }
    }
}
// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../scripts/createEmbed');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Bans a member from the server.')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to ban.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('duration')
                    .setDescription('Time duration for the ban. (Default: Permanent).')
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
        const user = interaction.options.getUser('member');
        const member = interaction.guild.members.cache.get(user.id);
        let reason = interaction.options.getString('reason') || 'No reason provided';
        let timer = interaction.options.getString('duration');
        
        // Si on convertie time en milliseconde et que c'est pas un nombre ...
        if(timer && isNaN(ms(timer)))
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be banned! The duration The time given is not correct!`,
                flags: MessageFlags.Ephemeral
            });

        if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
        || (interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = utilisateur ciblé
        || (member && !member.bannable) // Si ce membre est bien sur le serveur et peut être bannissable
        || (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)) // Si ce membre est bien sur le serveur et si il a un rang supérieur
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be banned! I have not permission to ban this user!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Si le membre est déjà banni
        if((await interaction.guild.bans.fetch()).get(user.id))
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be banned! This user is already banned!`,
                flags: MessageFlags.Ephemeral
            });
        
        // Création d'un embed de réponse
        let Embed, EmbedDM;
        
        if(timer)
        {
            // Enregistre le temps et le bon format
            const endTimestamp = new Date(Date.now() + ms(timer)) // 👈 utiliser ms() pour parser
            const endDate = Math.floor(endTimestamp.getTime() / 1000);

            Embed = createEmbed({
                title: '🕒 Temporary ban',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been temporarily banned of the server.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Until: <t:${endDate}:f>\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });

            EmbedDM = createEmbed({
                title: '🕒 Temporary ban',
                color: Colors.DarkRed,
                description: `You have been temporarily banned of the server.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Until: <t:${endDate}:f>\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });
        }
        else
        {
            Embed = createEmbed({
                title: '🔨 Ban',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been banned from the server.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });

            EmbedDM = createEmbed({
                title: '🔨 Ban',
                color: Colors.DarkRed,
                description: `You have been banned from the server.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });
        }

        // Si le membre n'est pas un bot
        if(!member.user.bot)
            await user.send({ embeds: [EmbedDM] });

        await interaction.reply({ embeds: [Embed] });

        // Bannir le membre avec la raison
        interaction.guild.bans.create(user.id, {reason: reason});

        // Enlever le ban à la fin du temps
        if(timer)
        {
            setTimeout(async () => {
                interaction.guild.members.unban(user);
            }, ms(timer));
        }
    }
}
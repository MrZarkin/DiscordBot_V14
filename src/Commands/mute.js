// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, ChannelType, Colors } = require('discord.js');
const createEmbed = require('../functions/createEmbed');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member (text or voice).')
        .addSubcommand(command =>
            command
            .setName('text')
            .setDescription('Mute a member from text.')
            .addUserOption(options =>
                options
                .setName('member')
                .setDescription('Member to mute.')
                .setRequired(true)
            )
            .addStringOption(options =>
                options
                .setName('time')
                .setDescription('Time duration for the mute.')
            )
            .addStringOption(options =>
                options
                .setName('reason')
                .setDescription('Reason for the mute.')
            )
        )
        .addSubcommand(command =>
            command
            .setName('voice')
            .setDescription('Mute a member from voice.')
            .addUserOption(options =>
                options
                .setName('member')
                .setDescription('Member to mute.')
                .setRequired(true)
            )
            .addStringOption(options =>
                options
                .setName('time')
                .setDescription('Time duration for the mute.')
            )
            .addStringOption(options =>
                options
                .setName('reason')
                .setDescription('Reason for the mute.')
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const { options } = interaction;
        const sub = options.getSubcommand();
        const user = options.getUser("member");
        const member = interaction.guild.members.cache.get(user.id);
        const role = interaction.guild.roles.cache.find(role => role.name === "Muted");
        const type = options.getString('type');
        let time = options.getString("time");
        let reason = options.getString("reason") || 'No reason provided';

        if(time != null && isNaN(ms(time)))
            // Si on convertie time en milliseconde et que c'est pas un nombre ...
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be muted! The duration The time given is not correct!`,
                flags: MessageFlags.Ephemeral
            });

        // Si le membre possède un rôle 'Muted'
        if(member.roles.cache.some(role => role.name === 'Muted') || member.voice.mute == true)
            return interaction.reply({
                content: `❌ ${user.displayName} is already muted!`,
                flags: MessageFlags.Ephemeral
            });

        if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
        || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
        || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
        || (member && !member.moderatable)) // Si le membre n'est pas modérable
        {
            return interaction.reply({
                content: `❌ **${user.displayName}** cannot be muted! I have not permission to mute this user!`,
                flags: MessageFlags.Ephemeral
            });
        }
        
        switch(sub)
        {
            case 'text':
                if(!role)
                {
                    try
                    {
                        // On créer un rôle 'Muted', aucune permissions activées
                        let muterole = await interaction.guild.roles.create({
                            name: 'Muted',
                            permissions: []
                        });
                        
                        // Pour chaque salon textuelles : Interdire l'envoie de message et d'ajouter des reactions pour le rôle 'Muted'
                        interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).forEach( async channel => {
                            await channel.permissionOverwrites.create(interaction.guild.roles.cache.find(role => role.name === "Muted"), {
                                SendMessages: false,
                                AddReactions: false
                            });
                        });
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                }
    
                // Ajouter du rôle au membre
                await member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Muted"), reason);
                break;

            case 'voice':
                if (member.voice.channelId === null) // Si le membre n'est pas dans un vocal
                {
                    return interaction.reply({
                        content: `❌ **${user.displayName}** cannot be muted! He isn't in a voice channel!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
        
                // Supprimer le mute en vocal de l'utilisateur 
                await member.voice.setMute(true, reason);
                break;

            default:
                break;
        }

        let Embed;
        if(time)
        {
            // Enregistre le temps et le bon format
            const endTimestamp = new Date(Date.now() + ms(time)) // Utiliser ms() pour parser
            const endDate = Math.floor(endTimestamp.getTime() / 1000);

            // Création d'un embed de réponse
            Embed = createEmbed({
                title: '🔇 Mute',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been muted.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Until: <t:${endDate}:f>\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });
        }
        else
        {
            // Création d'un embed de réponse
            Embed = createEmbed({
                title: '🔇 Mute',
                color: Colors.DarkRed,
                description: `**${user.displayName}** has been muted.`,
                fields: [
                    { name: '', value: `> Author: ${interaction.user}\n> Reason: **${reason}**`},
                ],
                timestamp: true
            });
        }

        await interaction.reply({ embeds: [Embed] });

        // Enlever le mute à la fin du temps
        if(time != null)
        {
            setTimeout(async () => {
                if(type === 'text')
                    member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Muted"));
                else
                    await member.voice.setMute(false);
            }, ms(time));
        }
    }
}
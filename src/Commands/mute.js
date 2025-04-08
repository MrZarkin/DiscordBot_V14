// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, ChannelType } = require('discord.js');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mute a member from text channels so they cannot type.')
            .addStringOption(option => 
                option
                    .setName('type')
                    .setDescription('Type of mute.')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Text', value: 'text' },
                        { name: 'Voice', value: 'voice' },
                    )
                )
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to mute.')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('Time duration for the mute.')
                    .setRequired(false)
                )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason of the mute.')
                    .setRequired(false)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);
        const role = interaction.guild.roles.cache.find(role => role.name === "Muted");
        const type = interaction.options.getString('type');
        let time = interaction.options.getString("time") ?? null;
        let reason = interaction.options.getString("reason") ?? null;

        if(time != null && isNaN(ms(time)))
            // Si on convertie time en milliseconde et que c'est pas un nombre ...
            return interaction.reply({
                content: "This type of duration is not recognized! Try the command `/mute <type Text/Voice> [user] {time m/h/d ?} <reason ?>`",
                flags: MessageFlags.Ephemeral
            });

        // En fonction du type de mute
        if(type === 'text')
        {
            // Si le membre possède un rôle 'Muted'
            if(member.roles.cache.some(role => role.name === 'Muted'))
                return interaction.reply({
                    content: "This member is already muted from text!`",
                    flags: MessageFlags.Ephemeral
                });

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

            if((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
            || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
            || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
            || (!member.moderatable)) // Si le membre n'est pas modérable
            {
                return interaction.reply({
                    content: "I can't mute this member!",
                    flags: MessageFlags.Ephemeral
                });
            }

            // Ajouter du rôle au membre
            await member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Muted"), reason);

            // Envoyer en message priv�
            await interaction.reply({
                content: `${user} muted from the text!`,
                flags: MessageFlags.Ephemeral
            });
        }
        else if(type === 'voice')
        {
            // Si le membre est déjà mute
            if(member.voice.mute == true)
                return interaction.reply({
                    content: "This member is already muted from voice!`",
                    flags: MessageFlags.Ephemeral
                });

            // Si la personne cibl� c'est nous / Si il a un rang sup�rieur / Si peut pas �tre mod�r� / Si pas d�j� mute vocal / Si c'est membre
            if ((interaction.user.id === user.id) // Si l'auteur du message = l'utilisateur ciblé
                || (await interaction.guild.fetchOwner().id === user.id) // Si proprio du serveur = l'utilisateur ciblé
                || (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) // Si ce membre est bien sur le serveur et si il a un rang supérieur
                || (!member.moderatable) // Si le membre n'est pas modérable
                || (member.voice.channelId === null)) // Si le membre n'est pas dans un vocal
            {
                return interaction.reply({
                    content: "I can't mute this member!",
                    flags: MessageFlags.Ephemeral
                });
            }
    
            // Supprimer le mute en vocal de l'utilisateur 
            await member.voice.setMute(true, reason);
    
            // ephemeral = true -> r�pondre un message visible seulement par l'auteur de la commande
            await interaction.reply({
                content: `${user} muted from the voice!`,
                flags: MessageFlags.Ephemeral
            });
        }

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
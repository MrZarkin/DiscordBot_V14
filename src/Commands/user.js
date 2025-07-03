// Importation des éléments nécessaire
const { MessageFlags, SlashCommandBuilder, Colors } = require('discord.js');
const createEmbed = require('../functions/createEmbed');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows information about a user.')
        .addSubcommand(command => 
            command
            .setName('icon')
            .setDescription('Send user\'s icon')
            .addUserOption(option =>
                option
                .setName('member')
                .setDescription('The user to get informations for.')
            )
        )
        .addSubcommand(command => 
            command
            .setName('banner')
            .setDescription('Send user\'s banner')
            .addUserOption(option =>
                option
                .setName('member')
                .setDescription('The user to get informations for.')
            )
        )
        .addSubcommand(command => 
            command
            .setName('info')
            .setDescription('Send user\'s informations')
            .addUserOption(option =>
                option
                .setName('member')
                .setDescription('The user to get informations for.')
            )
        ),

    async execute(interaction, bot)
    {
        // Récupéré la valeurs des options
        const { options } = interaction;
        const sub = options.getSubcommand();
        const user = options.getUser('member') ?? interaction.user;
        const fullUser = await interaction.client.users.fetch(user.id, { force: true });
        const member = interaction.guild.members.cache.get(user.id);
        const type = options.getString('type');

        switch(sub)
        {
            case 'icon':
                // Envoyer l'avatar du membre
                interaction.reply(member.displayAvatarURL());
                break;

            case 'banner':
                const banner = fullUser.bannerURL({ size: 2048, dynamic: true })

                // Si le membre n'a pas de bannière
                if(!banner)
                    return interaction.reply({
                        content: `❌ **${user.displayName}** doesn't have a banner!`,
                        flags: MessageFlags.Ephemeral
                    });

                interaction.reply(banner);
                break;

            case 'info':
                // Récupération des badge du membre
                const badges = fullUser.flags?.toArray() || [];

                // Récupération des emoji pour chaques badges
                const badgeEmojis = {
                    ActiveDeveloper: '<:activedev:1362381978166628362>',
                    HypeSquadOnlineHouse1: '<:bravery:1362381858880356534>',
                    HypeSquadOnlineHouse2: '<:brilliance:1362381958428233839>',
                    HypeSquadOnlineHouse3: '<:balance:1362381935170556004>',
                    BugHunterLevel1: '<:bughunter1:1362381837665570896>',
                    BugHunterLevel2: '<:bughunter2:1362381817457545377>',
                    CertifiedModerator: '<:mod:1362381752349229056>',
                    HypeSquadEvents: '<:hypesquad:1362381734284365935>',
                    Partner: '<:partner:1362381710242742283>',
                    PremiumEarlySupporter: '<:earlysupporter:1362381693796876460>',
                    Staff: '<:staff:1362381424669229088>',
                    VerifiedBotDeveloper: '<:botdev:1362381674670981173>',
                    VerifiedBot: '<:verifiedapp1:1362387172170403950><:verifiedapp2:1362387183822176316><:verifiedapp3:1362387199949275287>'
                };

                // Séléction des badges
                const badgeList = badges.map(badge => badgeEmojis[badge] || badge).join(' ') || 'None';
                const badgeLength = badges.length || '0';

                // Récupère tous les rôles sauf @everyone
                const roles = member.roles.cache
                    .filter(role => role.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position) // Du plus élevé au plus bas
                    .map(role => `<@&${role.id}>`) // Format pour mentionner les rôles
                    .join(', ');
                const rolesLength = member.roles.cache.filter(role => role.id !== interaction.guild.id).size || '0';


                // Création d'un embed de réponse
                let Embed = createEmbed({
                    title: user.displayName,
                    color: Colors.DarkRed, // Problème avec la date
                    description: `> **User:** \`${user.username}\`\n> **ID:** \`${user.id}\`\n> **Nickname:** \`${member.nickname ?? 'No nickname'}\`\n> **Joined Discord:**: <t:${Math.floor(fullUser.createdTimestamp / 1000)}:F>\n> **Joined server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    fields: [
                        { name: `Badges (${badgeLength})`, value: badgeList},
                        { name: `Roles (${rolesLength})`, value: roles.length > 0 ? roles : 'None'}
                    ],
                    thumbnail: bot.user.displayAvatarURL(),
                });

                interaction.reply({ embeds: [Embed] })
                break;

            default:
                break;
        }
    }
}
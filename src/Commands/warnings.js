// Importation des éléments nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Manage members warnings.')
        .addStringOption(option =>
            option
            .setName('type')
            .setDescription('Type of actions.')
            .setRequired(true)
            .addChoices(
                { name: 'Clear', value: 'clear' },
                { name: 'List', value: 'list' },
                { name: 'Remove', value: 'remove' },
            )
        )
        .addUserOption(option =>
            option
            .setName('member')
            .setDescription('The user to get warings for.')
            .setRequired(false)
        )
        .addStringOption(option => 
            option
            .setName('warn_id')
            .setDescription('The warns ID.')
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction, bot, db)
    {
        // Récupéré la valeurs des options
        let user = interaction.options.getUser('member') || interaction.user;
        let member = interaction.guild.members.cache.get(user.id);
        const type = interaction.options.getString('type');
        const warnID = interaction.options.getString('warn_id');

        db.query(`SELECT * FROM warns WHERE guildID = '${interaction.guild.id}' AND userID = '${member.id}'`, async (err, req) => {
            
            if(err)
                return console.log(err);

            if(req.length < 1)
                return interaction.reply({
                    content: "❌ The member has no warnings!",
                    flags: MessageFlags.Ephemeral
                });

            if(type === 'clear')
            {
                db.query(`DELETE FROM warns WHERE guildID = '${interaction.guild.id}' AND userID = '${member.id}'`);

                return interaction.reply(`✅ Sucess! All warnings from **${user.displayName}** were deleted!`);
                
            }
            else if(type === 'list')
            {
                let Embed = new EmbedBuilder()
                .setTitle(`${user.displayName}'s warnings`)
                .setDescription(`**${user.displayName}** has received \`${req.length}\` warnings.`)
                .setColor(Colors.DarkRed)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .setTimestamp()

                for(let i = 0; i < req.length; i++)
                {
                    const FindMember = await interaction.guild.members.fetch(req[i].authorID);
                    const endTimestamp = new Date(parseInt(req[i].date)) // utiliser ms() pour parser
                    const endDate = Math.floor(endTimestamp.getTime() / 1000);

                    Embed.addFields([
                        {
                            name: ``, 
                            value: `**ID : ${req[i].warnID}**\n> **Author: ** : ${FindMember.user}\n> **Reason** : ${req[i].reason}\n> **Date** : <t:${endDate}:f>`
                        }
                    ]);
                }

                return interaction.reply({ embeds: [Embed] });
            }
            else if(type === 'remove')
            {
                if(!warnID)
                    return interaction.reply({
                        content: "❌ You must provide a warn ID when using type 'remove'.",
                        flags: MessageFlags.Ephemeral
                    });

                db.query(`SELECT * FROM warns WHERE guildID = '${interaction.guild.id}' AND userID = '${member.id}' AND warnID = '${warnID}'`, async (err, req) => {
                    if(req.length === 0)
                    {
                        return interaction.reply({
                            content: `❌ No warning found with ID \`${warnID}\` for this user.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    db.query(`DELETE FROM warns WHERE guildID = '${interaction.guild.id}' AND userID = '${member.id}' AND warnID = '${warnID}'`);
                    return interaction.reply(`✅ Sucess! The warning ID \`${warnID}\` from **${user.displayName}** has been removed!`);
                })
            }
        })
    }
}
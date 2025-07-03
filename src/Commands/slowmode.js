// Importation des éléments nécessaire
const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

// Exportation du code
module.exports = {

    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Enable/Disable slow mode.')
        .addStringOption(option =>
            option
            .setName('type')
            .setDescription('Type of actions.')
            .setRequired(true)
            .addChoices(
                { name: 'Enable', value: 'enable' },
                { name: 'Disable', value: 'disable' }
            )
        )
        .addStringOption(option =>
            option
            .setName('duration')
            .setDescription('The time to set for slowmode channel.')
        )
        .addChannelOption(option =>
            option
            .setName('channel')
            .setDescription('The channel to enable/disable slowmode option.')
        )
        .addStringOption(option => 
            option
            .setName('reason')
            .setDescription('The reason of the slowmode.')
        ),

    async execute(interaction, bot, db)
    {
        // Récupéré la valeurs des options
        const type = interaction.options.getString('type');
        const duration = interaction.options.getString('duration') || '15s';
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if(type === 'enable')
        {
            if(duration && isNaN(ms(duration)))
                // Si on convertie time en milliseconde et que c'est pas un nombre ...
                return interaction.reply({
                    content: `❌ Slowmode cannot be Enabled/Disabled! The duration The time given is not correct!`,
                    flags: MessageFlags.Ephemeral
                });

            // Si la duration saisi est déjà la même
            if(channel.rateLimitPerUser === ms(duration) / 1000)
                return interaction.reply({
                    content: `❌ Slowmode is already disabled to \`${duration}\`.`,
                    flags: MessageFlags.Ephemeral
                });

            // Si la duration est supérieur à 6h
            if(ms(duration) / 1000 >= 21600)
                return interaction.reply({
                    content: `❌ Slowmode cannot exceed 6 hours!`,
                    flags: MessageFlags.Ephemeral
                });

            // Activation du slowmode avec le temps
            channel.setRateLimitPerUser(ms(duration) / 1000, reason).catch(err => {
                return;
            })

            return interaction.reply(`🕒 The slowmode of the channel ${channel} has been set to \`${duration}\`.`)
        }
        else if(type === 'disable')
        {
            // Si le slowmode est déjà activé
            if(channel.rateLimitPerUser != null)
                return interaction.reply({
                    content: `❌ Slowmode is already disabled.`,
                    flags: MessageFlags.Ephemeral
                });
            
            // Désactivation du slowmode
            channel.setRateLimitPerUser(null).catch(err => {
                return;
            })

            return interaction.reply(`🕒 The slowmode of the channel ${channel} is now disabled.`)
        }
    }
}
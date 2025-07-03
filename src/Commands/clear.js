// Importation des librairies nécessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {
        
    // Information nécessaire à la commande
    data: 
        new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Cleans up channel messages.')
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('Number of messages to delete.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const channel = interaction.channel;
        const number = interaction.options.getNumber('amount');

        // Le bot "répond", il "réfléchit" pendant qu'il fait l'action.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        try
        {
            // Supprimer le nombre de message choisi, et ignorer si ça date de +14jours
            const messages = await channel.bulkDelete(parseInt(number), true);

            // Modifier le message en attente.
            await interaction.followUp({
                content: `🧹 Sucess! \`${messages.size}\` messages were deleted in ${channel.name}!`,
                flags: MessageFlags.Ephemeral
            });
        }
        catch(err)
        {
            // Filtrer tout les messages choisi. Vérifier un par un si ils datent de moins de 14 jours
            const messages = [...(await channel.messages.fetch()).filter(msg => !msg.interaction && (Date.now() - msg.createdAt) <= 1209600000).values()];

            // Si auncun messages sont -14 jours et modifier le message en attente.
            if (messages.length <= 0)
                return message.followUp({
                    content: "❌ No messages can be deleted because they are more than 14 days old!",
                    flags: MessageFlags.Ephemeral
                });

            // Supprimer le nombre de message choisi et modifier le message en attente.
            await channel.bulkDelete(messages, true);
            return interaction.followUp({
                content: `🧹 Sucess! \`${messages.size}\` messages were deleted in ${channel.name}!`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
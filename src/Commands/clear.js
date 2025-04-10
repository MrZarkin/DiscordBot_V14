// Importation des �l�ments n�cessaire
const { PermissionFlagsBits, MessageFlags, SlashCommandBuilder } = require('discord.js');

// Exportation du code
module.exports = {
        
    // Information n�cessaire � la commande
    data: 
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Cleans up channel messages.')
            .addNumberOption(option =>
                option
                    .setName('number_of_messages')
                    .setDescription('Number of messages to delete.')
                    .setRequired(true)
                )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction)
    {
        // Récupérer la valeur des paramètres
        const channel = interaction.channel;
        const number = interaction.options.getNumber('number_of_messages');

        // Si le nombre de message choisi est supérieur à 100 et inférieur à 0
        if(parseInt(number) <= 0 || parseInt(number) > 100)
            return interaction.reply({
                content: "The number of messages must be in between `0` and `100`!",
                flags: MessageFlags.Ephemeral
            });

        // Le bot "répond", il "réfléchit" pendant qu'il fait l'action.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        try
        {
            // Supprimer le nombre de message choisi, et ignorer si ça date de +14jours
            const messages = await channel.bulkDelete(parseInt(number), true);

            // Modifier le message en attente.
            return interaction.followUp({
                content: `\`${messages.size}\` messages has beed deleted in ${channel}!`,
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
                    content: "No messages can be deleted because they are more than 14 days old!",
                    flags: MessageFlags.Ephemeral
                });

            // Supprimer le nombre de message choisi et modifier le message en attente.
            await channel.bulkDelete(messages, true);
            return interaction.followUp({
                content: `\`${messages.size}\` messages has beed deleted in ${channel}!`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
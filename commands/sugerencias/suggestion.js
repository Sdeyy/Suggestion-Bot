const {MessageEmbed,CommandInteraction, Discord, MessageActionRow, MessageButton} = require('discord.js')
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2))
const sugSchema = require('../../Models/votos-sugs')
const db = require('../../Models/statisticsModel');

module.exports = {
    name: 'suggestion',
    description: 'Suggestion System!',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'suggest',
            type: 'SUB_COMMAND',
            description: 'Send a suggestion',
            options: [{
                name: 'query',
                description: 'Your Suggestion',
                type: 'STRING',
                required: true,
            }, ],
        },
        {
            name: 'accept',
            type: 'SUB_COMMAND',
            description: 'Accept a suggestion',
            options: [{
                name: 'id',
                description: 'Suggestion ID',
                type: 'STRING',
                required: true,
            }, {
                name: 'reason',
                description: 'Reason',
                type: 'STRING',
                required: true,
            }, ],
        },
        {
            name: 'decline',
            type: 'SUB_COMMAND',
            description: 'Decline a suggestion',
            options: [{
                name: 'id',
                description: 'Suggestion ID',
                type: 'STRING',
                required: true,
            }, {
                name: 'reason',
                description: 'Reason',
                type: 'STRING',
                required: true,
            }, ],
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        const [SubCommand] = args;

        const emojiYes = config.SUGERENCIAS.EMOJIS.UPVOTE;
        const emojiNo = config.SUGERENCIAS.EMOJIS.DOWNVOTE;
        const emojiVotes = config.SUGERENCIAS.EMOJIS.VOTES;
        let channelData = config.SUGERENCIAS.CHANNEL_ID;

        let botones = new MessageActionRow().addComponents([
            new MessageButton().setStyle("SUCCESS").setLabel("0").setEmoji(emojiYes).setCustomId("votar_si"),
            new MessageButton().setStyle("DANGER").setLabel("0").setEmoji(emojiNo).setCustomId("votar_no"),
            new MessageButton().setStyle("PRIMARY").setLabel("Votes").setEmoji(emojiVotes).setCustomId("ver_votos"),
        ])

        let secondButtons = new MessageActionRow().addComponents([
            new MessageButton().setStyle("SUCCESS").setLabel("Accept").setCustomId("acceptS"),
            new MessageButton().setStyle("DANGER").setLabel("Reject").setCustomId("rejectS")
        ])


        if (SubCommand === 'suggest') {
            const suggestion = interaction.options.getString('query');
            const suggestionSchema = require('../../Models/suggestSchema');

            if (!channelData) {
                return interaction.reply({embeds: [new MessageEmbed().setDescription('This server no have a channel set up!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
            } else {
                const pass = generateToken();
                const suggestionChannel = interaction.guild.channels.cache.get(channelData);
                
                await db.findOneAndUpdate({guildID: interaction.guild.id}, {
                    $inc: {
                        totalSuggestions: 1
                    },
                })
                const suggestEmbed = new MessageEmbed()
                    .setTitle(`${config.BOTNAME} | Suggestions`)
                    .setDescription(`A new suggestion has been created.`)
                    .addField(`Member:`, `${interaction.user.tag}`)
                    .addField(`Status:`, `Pending`)
                    .addField(`Suggestion`, `${suggestion}`)
                    .setColor(`${config.EMBEDCOLOR}`)
                    .setFooter(`${interaction.user.tag} suggestion | ID: ${pass}`, interaction.member.user.displayAvatarURL());

                suggestionChannel.send({embeds: [suggestEmbed], components: client.config.SUGERENCIAS.ACCEPT_REJECT_BUTTONS ? [botones, secondButtons] : [botones] }).then((m) => {
                    let data_msg = new sugSchema({
                        messageID: m.id,
                        autor: interaction.user.id
                    });
                    data_msg.save();
                    const replyEmbed = new MessageEmbed()
                        .setTitle(`${config.BOTNAME} | Suggestions`)
                        .setDescription(`Your suggestion has been sent! [Here](https://discord.com/channels/${interaction.guild.id}/${channelData}/${m.id})`)
                        .setColor(`${config.EMBEDCOLOR}`);
                    interaction.reply({embeds: [replyEmbed], ephemeral: true});
                    new suggestionSchema({
                        guild: interaction.guild.id,
                        message: m.id,
                        token: pass,
                        suggestion: suggestion,
                        user: interaction.user.id,
                        guild: interaction.guild.id,
                    }).save();
                })
            }
        } else if (SubCommand === 'decline') {
            if(!interaction.member.permissions.has("MANAGE_MESSAGES")) {
                return interaction.reply({embeds: [new MessageEmbed().setDescription('You need the **MANAGE_MESSAGES** permission to use this command!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
            }
            const stoken = interaction.options.getString('id');
            const reply = interaction.options.getString('reason')
            const Schema = require('../../Models/suggestSchema');
            Schema.findOne({
                token: stoken,
            }, async (err, data) => {
                if(!data) return interaction.reply({embeds: [new MessageEmbed().setDescription('This id is not valid!').setColor('RED')], ephemeral: true});
                const message = data.message
                const user = client.users.cache.get(data.user)
                const guild = data.guild
                const suggestion = data.suggestion

                if(interaction.guild.id != guild) return interaction.reply({embeds: [new MessageEmbed().setDescription('This id is not valid!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
                const channel = channelData;
                const gchannel = interaction.guild.channels.cache.get(channel);
                if(!gchannel) return interaction.reply({embeds: [new MessageEmbed().setDescription('This server no have a channel set up!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
                if(channel) {
                    var options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const embed = new MessageEmbed()
                        .setTitle(`${config.BOTNAME} | Suggestions`)
                        .setColor('RED')
                        .setDescription(`This suggestion has already been answered.`)
                        .addField(`Member:`, `${user.tag}`)
                        .addField(`Status:`, `Rejected by ${interaction.user.username}`)
                        .addField(`Reason:`, `${reply}`)
                        .addField(`Suggestion`, `${suggestion}`)
                        .setFooter(`${user.tag} suggestion | ID: ${stoken}`, user.displayAvatarURL({dynamic: true}));
                    let msg_data = await sugSchema.findOne({ messageID: message});
                    
                    let row = new MessageActionRow().addComponents([
                        new MessageButton().setStyle("SUCCESS").setLabel(msg_data.si.length.toString()).setEmoji(emojiYes).setDisabled(true).setCustomId("votar_si"),
                        new MessageButton().setStyle("DANGER").setLabel(msg_data.no.length.toString()).setEmoji(emojiNo).setDisabled(true).setCustomId("votar_no"),
                        new MessageButton().setStyle("PRIMARY").setLabel("Votes").setEmoji(emojiVotes).setCustomId("ver_votos"),
                    ])
        
                    const db = require('../../Models/statisticsModel');
                    await db.findOneAndUpdate({guildID: interaction.guild.id}, {
                        $inc: {
                            totalDenied: 1
                        },
                    })

                gchannel.messages.fetch(message).then(m =>  m.edit({embeds: [embed], components: [row]}) );
                    interaction.reply({embeds: [new MessageEmbed().setDescription('Suggestion has been declined!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
                }
            });
        } else if (SubCommand === 'accept') {
            if(!interaction.member.permissions.has("MANAGE_MESSAGES")) {
                return interaction.reply({embeds: [new MessageEmbed().setDescription('You need permissions to use this command!').setColor("RED")], ephemeral: true});
            }
            const stoken = interaction.options.getString('id');
            const reply = interaction.options.getString('reason')
            const Schema = require('../../Models/suggestSchema');
            Schema.findOne({
                token: stoken,
            }, async (err, data) => {
                if(!data) return interaction.reply({embeds: [new MessageEmbed().setDescription('This id is not valid!').setColor("RED")], ephemeral: true});
                const message = data.message
                const user = client.users.cache.get(data.user)
                const guild = data.guild
                const suggestion = data.suggestion

                if(interaction.guild.id != guild) return interaction.reply({embeds: [new MessageEmbed().setDescription('This id is not valid!').setColor("RED")], ephemeral: true});
                const channel = channelData;
                const gchannel = interaction.guild.channels.cache.get(channel);
                if(!gchannel) return interaction.reply({embeds: [new MessageEmbed().setDescription('This server no have a channel set up!').setColor("RED")], ephemeral: true});
                if(channel) {
                    var options = { year: 'numeric', month: 'long', day: 'numeric' };

                    
                    const embed = new MessageEmbed()
                        .setTitle(`${config.BOTNAME} | Suggestions`)
                        .setColor('GREEN')
                        .setDescription(`This suggestion has already been answered.`)
                        .addField(`Member:`, `${user.tag}`)
                        .addField(`Status:`, `Accepted by ${interaction.user.username}`)
                        .addField(`Reason:`, `${reply}`)
                        .addField(`Suggestion`, `${suggestion}`)
                        .setFooter(`${user.tag} suggestion | ID: ${stoken}`, user.displayAvatarURL({dynamic: true}));
                        let msg_data = await sugSchema.findOne({ messageID: message});
                    
                        let row = new MessageActionRow().addComponents([
                            new MessageButton().setStyle("SUCCESS").setLabel(msg_data.si.length.toString()).setEmoji(emojiYes).setDisabled(true).setCustomId("votar_si"),
                            new MessageButton().setStyle("DANGER").setLabel(msg_data.no.length.toString()).setEmoji(emojiNo).setDisabled(true).setCustomId("votar_no"),
                            new MessageButton().setStyle("PRIMARY").setLabel("Votes").setEmoji(emojiVotes).setCustomId("ver_votos"),
                        ])
                        const db = require('../../Models/statisticsModel');
                        await db.findOneAndUpdate({guildID: interaction.guild.id}, {
                            $inc: {
                                totalAccepted: 1
                            },
                        })
                    gchannel.messages.fetch(message).then(m =>  m.edit({embeds: [embed], components: [row]}) );
                    interaction.reply({embeds: [new MessageEmbed().setDescription('Suggestion has been accepted!').setColor(`${config.EMBEDCOLOR}`)], ephemeral: true});
                }
            });
        }
    }
};

function generateToken() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

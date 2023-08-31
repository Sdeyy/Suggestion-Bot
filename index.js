const { MessageEmbed, WebhookClient, Client, Collection, Discord } = require('discord.js');
const client = new Client({
    intents: 32767,
});

module.exports = (client)

let { readdirSync } = require('fs');
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2));

client.slashCommands = new Collection();
client.config = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2));

require("./handler")(client);
require('events').EventEmitter.defaultMaxListeners = 0;

process.on('unhandledRejection', error => {
  console.error(error);
});
client.on('shardError', error => {
  console.error(error);
});

client.login(config.TOKEN);

const Discord = require("discord.js")
const client = require("../../index")
const chalk = require("chalk")
const yaml = require('js-yaml');
const fs = require('fs');
const mongoose = require("mongoose")

client.on("ready", () => {
    
    const { mongodb } = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2))
    if (!mongodb) return;

    mongoose.set('strictQuery', false);

    mongoose.connect(client.config.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log(chalk.green.bold` ╔━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╗
 ┃Mongoose connected successfully!┃
 ╚━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╝`)
    }).catch((err) => {
        console.log(chalk.red`☁ ERROR WHEN CONNECTING TO THE MONGODB DATABASE`);
        console.log(err)
    })

})
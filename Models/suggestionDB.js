const mongoose = require('mongoose')

const suggestionDB = new mongoose.Schema ({
    guildID: String,
    suggestionID: String,
    Content: Array,
})

module.exports = mongoose.model('suggestionDB', suggestionDB)
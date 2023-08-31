
const mongoose = require('mongoose')

const statistics = new mongoose.Schema ({
    guildID: String,
    totalSuggestions: {type: Number, default: 0},
    totalAccepted: {type: Number, default: 0},
    totalDenied: {type: Number, default: 0},
    totalPending: {type: Number, default: 0},

})

module.exports = mongoose.model('statss', statistics)
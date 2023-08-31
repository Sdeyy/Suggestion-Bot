const mongoose = require('mongoose')

const suggestSchema = new mongoose.Schema ({
    guild: String,
    message: String,
    token: String,
    suggestion: String,
    user: String,
})

module.exports = mongoose.model('suggestSchema', suggestSchema)
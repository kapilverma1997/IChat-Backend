const mongoose = require("mongoose")

const testSchema = new mongoose.Schema({
    chatID: String,
    senderID: String,
    text: String
})

const messageModel = mongoose.model('test', testSchema)

module.exports = messageModel
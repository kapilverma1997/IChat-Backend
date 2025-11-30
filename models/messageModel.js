const mongoose = require("mongoose")

const messagesSchema = new mongoose.Schema({
    chatID: String,
    senderID: String,
    text: String
})

const messageModel = mongoose.model('Messages', messagesSchema)

module.exports = messageModel
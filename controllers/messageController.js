const messageModel = require("../models/messageModel");
const { catchAsync } = require("./errorController");
const { sendResponse } = require("./responseController");

module.exports.createMessage = catchAsync(async (req, res) => {
    console.log('req.body createmessages', req.body);
    const { chatID, senderID, text } = req.body
    const newMessage = new messageModel({
        chatID,
        senderID,
        text
    })
    const response = await newMessage.save()
    sendResponse(res, 200, response)
})

module.exports.getMessages = catchAsync(async (req, res) => {
    const { chatID } = req.params
    const messages = await messageModel.find({
        chatID
    })
    sendResponse(res, 200, messages)
})
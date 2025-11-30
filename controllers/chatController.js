const { use } = require("../routers/userRouter")
const AppError = require("../utils/appError")
const chatModel = require("./../models/chatModel")
const messageModel = require("./../models/messageModel")
const { catchAsync } = require("./errorController")
const { sendResponse } = require("./responseController")

module.exports.createChat = catchAsync(async (req, res) => {

    const { firstID, secondID } = req.body

    const chat = await chatModel.findOne({
        members: { $all: [firstID, secondID] }
    })

    if (chat) return sendResponse(res, 200, chat)

    const newChat = new chatModel({
        members: [firstID, secondID]
    })

    const response = await newChat.save()
    sendResponse(res, 200, response)

})

module.exports.findUserChats = catchAsync(async (req, res) => {

    const userID = req.params.userID

    const chats = await chatModel.find({
        members: { $in: [userID] }
    })

    sendResponse(res, 200, chats)

})

module.exports.findChat = catchAsync(async (req, res) => {

    const { firstID, secondID } = req.params

    const chat = await chatModel.find({
        members: { $all: [firstID, secondID] }
    })

    sendResponse(res, 200, chat)

})

module.exports.deleteChat = catchAsync(async (req, res) => {
    const { chatID } = req.params

    // Check if chat exists
    const chat = await chatModel.findById(chatID)
    if (!chat) {
        return sendResponse(res, 404, { message: "Chat not found" })
    }

    // Delete all messages associated with this chat
    await messageModel.deleteMany({ chatID: chatID })

    // Delete the chat
    await chatModel.findByIdAndDelete(chatID)

    sendResponse(res, 200, { message: "Chat and messages deleted successfully" })
})
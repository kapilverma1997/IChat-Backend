const express = require("express")
const router = express.Router()
const { createChat, findUserChats, findChat, deleteChat } = require("./../controllers/chatController")

router.post("/", createChat)
router.get("/:userID", findUserChats)
router.get("/:firstID/:secondID", findChat)
router.delete("/:chatID", deleteChat)

module.exports = router

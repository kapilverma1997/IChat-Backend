const express = require("express")
const { createMessage, getMessages } = require("../controllers/messageController")
const router = express.Router()

router.post("/", createMessage)
router.get("/:chatID", getMessages)

module.exports = router
const express = require("express")
const router = express.Router()
const { signup, updateColumnName, login, getUser, getAllUser, getUserByEmail } = require("./../controllers/userController")

router.post("/register", signup)
router.post("/login", login)
router.post("/find-by-email", getUserByEmail)
router.get("/", getAllUser)
router.get("/:userID", getUser)
router.get("/updateColumnName", updateColumnName)

module.exports = router
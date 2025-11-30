const User = require("./../models/user")
const { catchAsync } = require("./errorController")
const { sendResponse } = require("./responseController")
const AppError = require("./../utils/appError")
const jwt = require("jsonwebtoken")
const { promisify } = require("util")
const crypto = require('crypto')

module.exports.getAllUser = catchAsync(
    async (req, res) => {
        const allUsers = await User.find()
        if (allUsers) sendResponse(res, 200, allUsers)
    }
)

module.exports.getUser = catchAsync(
    async (req, res) => {
        const { userID } = req.params
        const user = await User.findOne({
            _id: userID
        })
        if (user) sendResponse(res, 200, user)
    }
)

exports.updateColumnName = async (req, res) => {
    try {
        await User.updateMany({}, { $rename: { 'MobileNumber': 'EmailAddress' } })
        sendResponse(res, 200, {}, "Column name updated successfully.")
    } catch (error) {
        console.log('Error while updating column name', error)
    }
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
        httpOnly: true
    }
    res.cookie('jwt', token, cookieOptions)
    user.Password = undefined
    sendResponse(res, statusCode, { token, user })
}

exports.login = catchAsync(async (req, res, next) => {
    console.log('req.body in login', req.body);
    const { EmailAddress, Password } = req.body
    if (!EmailAddress || !Password) {
        return next(new AppError('Please provide email and password!', 400))
    }
    const user = await User.findOne({ EmailAddress }).select('+Password')
    if (!user || !await user.correctPassword(Password, user.Password)) {
        return next(new AppError('Incorrect email or password', 401))
    }
    createSendToken(user, 200, res)
})

exports.signup = catchAsync(async (req, res) => {
    console.log('req.body in signup', req.body);
    const { FirstName, LastName, EmailAddress, Gender, Password } = req.body

    const UserExists = await User.findOne({ EmailAddress })
    if (UserExists) return sendResponse(res, 400, {}, 'User already exists')

    const newUser = await User.create({
        FirstName,
        LastName,
        EmailAddress,
        Gender,
        Password,
    })

    return sendResponse(res, 201, {}, "User registered successfully")

})
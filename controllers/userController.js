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

module.exports.getUserByEmail = catchAsync(
    async (req, res, next) => {
        const { EmailAddress } = req.body

        if (!EmailAddress) {
            return next(new AppError('EmailAddress is required', 400))
        }

        const user = await User.findOne({ EmailAddress })
        if (!user) {
            return sendResponse(res, 404, {}, 'User not found')
        }

        return sendResponse(res, 200, user)
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

exports.signup = catchAsync(async (req, res, next) => {
    console.log('req.body in signup', req.body);
    const {
        FirstName,
        LastName,
        EmailAddress,
        Gender,
        PhoneNumber,
        Country,
        Password,
        ConfirmPassword
    } = req.body

    // Basic required field validation
    if (!FirstName || !LastName || !EmailAddress || !Gender || !PhoneNumber || !Country || !Password || !ConfirmPassword) {
        return next(new AppError('Please fill in all required fields.', 400))
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(EmailAddress)) {
        return next(new AppError('Please provide a valid email address.', 400))
    }

    // Password strength validation
    if (Password.length < 8) {
        return next(new AppError('Password must be at least 8 characters long.', 400))
    }
    if (!/[A-Z]/.test(Password) || !/[0-9]/.test(Password)) {
        return next(new AppError('Password must contain at least one uppercase letter and one number.', 400))
    }

    // Confirm password match
    if (Password !== ConfirmPassword) {
        return next(new AppError('Password and confirm password do not match.', 400))
    }

    const UserExists = await User.findOne({ EmailAddress })
    if (UserExists) return sendResponse(res, 400, {}, 'User already exists')

    await User.create({
        FirstName,
        LastName,
        EmailAddress,
        Gender,
        PhoneNumber,
        Country,
        Password,
    })

    return sendResponse(res, 201, {}, "User registered successfully")

})
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const saltRounds = 10;
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    FirstName: { type: String, required: true, trim: true },
    LastName: { type: String, required: true, trim: true },
    EmailAddress: { type: String, required: true, trim: true, lowercase: true },
    Gender: { type: String, required: true, trim: true },
    PhoneNumber: { type: String, required: true, trim: true },
    Country: { type: String, required: true, trim: true },
    Password: { type: String, required: true }
})

userSchema.pre("save", async function () {
    try {
        const hash = await bcrypt.hash(this.Password, saltRounds);
        this.Password = hash;
    } catch (e) {
        console.log("Error Hasing the password", e);
    }
});

userSchema.pre('save', function (next) {
    if (!this.isModified || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimeStamp < changedTimeStamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken
}

const User = mongoose.model("User", userSchema)
module.exports = User

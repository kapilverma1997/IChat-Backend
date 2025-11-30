const AppError = require("../utils/appError");

module.exports.catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401)
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401)

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const message = `${Object.keys(err.keyValue)[0]} '${Object.values(err.keyValue)[0]}' already exists.`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {

    //OPERATIONAL , TRUSTED ERROR: SEND MESSAGE TO CLIENT
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        })

    } else {
        //LOG ERROR(FOR DEVELOPER)
        console.error('ERROR ', err)

        //PROGRAMMING OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR DETAILS    
        res.status(err.statusCode).json({
            success: false,
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}

module.exports.globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    if (err.name === 'JsonWebTokenError') err = handleJWTError()
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)

        sendErrorProd(error, res)
    }

};

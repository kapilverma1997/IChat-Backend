module.exports.sendResponse = (res, statusCode, data, message = "OK") => {
    return res.status(statusCode).json({
        recordCount: Array.isArray(data) ? data.length : 0,
        data,
        success: true,
        message: message,
    });
};

const mongoose = require("mongoose")
const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log("Database connected..", process.env.MONGO_URI)
        }
        await mongoose.connect(process.env.MONGOURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            family: 4,
        })
        if (mongoose.connections[0].readyState) {
            console.log("Database connected..", process.env.MONGO_URI)
        }
    } catch (error) {
        console.log("Error connecting mongoDB server..", error)
    }
}

module.exports = connectDB
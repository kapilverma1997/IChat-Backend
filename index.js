const express = require("express");
const { Server } = require("socket.io");
const app = express();
const httpServer = require("http").createServer(app); // Create HTTP server
const cors = require("cors")
const Messages = require("./models/messageModel")
const connectDB = require("./mongoConnect")
require("dotenv").config()
const userRouter = require("./routers/userRouter")
const chatRouter = require("./routers/chatRouter")
const messageRouter = require("./routers/messageRouter")
const { globalErrorHandler } = require("./controllers/errorController")

app.use(cors("*"))
app.use(express.json())

const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" }, connectionStateRecovery: {} }); // Fix the CORS configuration
const port = process.env.PORT || 3003;

app.use("/api/users", userRouter)
app.use("/api/chats", chatRouter)
app.use("/api/messages", messageRouter)

app.get("/", (req, res) => {
    res.send('Hello from server side.'); // Send response to client
});

app.get("/messages", async (req, res) => {
    try {
        const messages = await Messages.find()
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

io.on('connection', (socket) => {

    console.log('a user connected', socket.id);

    socket.on('chat message', (msg) => {
        console.log(`Send message event hits ${msg}`);
        Messages.create({ message: msg })
        io.emit('chat message', msg)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

connectDB()
    .then(() => {
        httpServer.listen(port, () => { // Listen on the HTTP server instead of app
            console.log(`app is listening on ${port}`);
        });
    })
    .catch((error) => {
        console.log(`APP IS NOT RUNNING`, error);
    })

app.use(globalErrorHandler)

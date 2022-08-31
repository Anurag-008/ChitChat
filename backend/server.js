const express = require("express")
const connectDB = require("./config/db")
const dotenv = require("dotenv")
const userroutes = require("./routes/userroutes");
const chatroutes = require("./routes/chatroutes");
const messageroutes = require("./routes/messageroutes");
const { notFound, errorHandeller } = require("./middleware/errorhandeller");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());
app.use("/api/user",userroutes);
app.use("/api/chats",chatroutes);
app.use("/api/message",messageroutes);

app.use(notFound);
app.use(errorHandeller);

const server = app.listen(5000, console.log("App started"));

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors:{
        origin: "http://localhost:3000",
    },
});

io.on("connection" , (socket) => {
    console.log("socket.io connected");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        // console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("joined room :" + room);
    });

    socket.on("new message", (messageRecieved) => {
        var chat = messageRecieved.chat;

        if(!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == messageRecieved.sender._id) return;
      
            socket.to(user._id).emit("message recieved", messageRecieved);
        });
    });
});
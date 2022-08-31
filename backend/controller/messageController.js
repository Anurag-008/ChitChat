const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatmodels");
const Message = require("../models/messagemodel");
const User = require("../models/usermodel");

const sendMessage = asyncHandler( async( req,res ) => {
    const { content,chatID } = req.body;

    if(!content || !chatID){
        console.log("Invalid data passed");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatID,
    } ;

    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message,{
            path: "chat.users",
            select: "name email pic",
        })

        await Chat.findByIdAndUpdate(req.body.chatID, {
            latestMessage:message,
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }


} );

const fetchMessage = asyncHandler ( async(req,res) => {
    try {
        const messages = await Message.find({chat: req.params.chatID})
        .populate("sender", "name email pic")
        .populate("chat")

        res.status(200).json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
} );

module.exports = {sendMessage, fetchMessage};
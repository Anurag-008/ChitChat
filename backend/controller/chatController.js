const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatmodels");
const User = require("../models/usermodel");

const accessChats = asyncHandler( async (req,res) => {
    const { userId } = req.body;

    if(!userId){
        console.log("userid not sent with request");
        res.sendStatus(400);
    }
    
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ]
    }) 
    .populate("users","-password")
    .populate("latestMessage")

    isChat = await User.populate(isChat,{
        path: "latestMessage.sender",
        select: "name email pic",
    });

    if(isChat.length>0){
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id , userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password",
            );
            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler ( async(req,res) => {
    try {
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("latestMessage")
        .populate("groupAdmin","-password")
        .sort( {updatedAt:-1} )
        .then( async(results) =>{
            results =await User.populate(results,{
                path: "latestMessage.sender",
                select: "name email pic",
            });
            res.status(200).send(results);
        } );
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
} );

const groupCreate = asyncHandler ( async(req,res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "please enter all the required fields"});
    }
    
    var users = JSON.parse(req.body.users);
    if(users.length < 2){
        return res.status(400).send("more than 2 users are required for a group chat");
    }
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user,
        });
        const fullgroupChat = await Chat.findOne({ _id: groupChat._id }).populate(
            "users",
            "-password",
        )
        .populate(
            "groupAdmin",
            "-password",
        );
        res.status(200).json(fullgroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
} );

const groupRename = asyncHandler( async(req,res) => {
    const { chatID , newChatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatID, 
        {chatName: newChatName},
        {new: true},
    )
    .populate("users","-pasword")
    .populate("groupAdmin","-password");

    if(!updatedChat){
        res.status(400);
        throw new Error("Chat not found");
    }
    else{
        res.json(updatedChat);
    }
} );

const groupAdd = asyncHandler( async(req,res) => {
    const { groupID, userID } = req.body;

    const addUser = await Chat.findByIdAndUpdate(
        groupID,
        { $push: { users: userID } },
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!addUser){
        res.status(400);
        throw new Error("chat no found");
    }
    else{
        res.json(addUser);
    }
} );

const groupRemove = asyncHandler( async(req,res) => {
    const { groupID, userID } = req.body;

    const removeUser = await Chat.findByIdAndUpdate(
        groupID,
        { $pull: {users: userID} },
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!removeUser){
        res.status(400);
        throw new Error("chat not found");
    }
    else{
        res.json(removeUser);
    }
} );

module.exports = { accessChats, fetchChats, groupCreate, groupRename, groupAdd, groupRemove };

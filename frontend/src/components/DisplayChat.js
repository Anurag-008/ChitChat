import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { getSender, getSenderFull } from '../config/Chatlogics';
import ChatModal from './ChatSpace/ChatModal';
import UpdateGroupChat from './UpdateGroupChat';
import { FormControl, Input, Spinner, useToast } from '@chakra-ui/react';
import axios from 'axios';
import './message.css'
import RenderChat from './RenderChat';
import io from 'socket.io-client'

const ENDPOINT='http://localhost:5000';
var socket, selectedChatCompare;


const DisplayChat = ({ fetchAgain, setFetchAgain }) => {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ newMessage, setNewMessage ] = useState("");
    const [ messages, setMessages ] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const toast = useToast();    useEffect(() => {
        socket=io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
    }, [])

    const fetchMessages = async() => {
        if(!selectedChat){
            return;
        }
        try {
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              
            };
            setIsLoading(true);
            const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);
            // console.log(data);
            setMessages(data);
            setIsLoading(false);

            socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            setIsLoading(false);
        }
    }

    const sendMessage = async(event) => {
        if(event.key === "Enter" && newMessage){
            try {
                const config = {
                    headers: {
                      Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const {data} = await axios.post(`/api/message` , {
                    content: newMessage,
                    chatID: selectedChat._id
                }, config)
                // console.log(data);

                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title:"Error Occured",
                    description:"Failed to send Message",
                    status:"error",
                    duration:3000,
                    isClosable:true,
                    position:"bottom"
                });
            }
        }
    }

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    },[selectedChat]);

    useEffect(() => {
      socket.on("message recieved", (messageRecieved) => {
       if(!selectedChatCompare || selectedChatCompare._id !== messageRecieved.chat._id){
           if(!notification.includes(messageRecieved)){
               setNotification([messageRecieved,...notification]);
               setFetchAgain(!fetchAgain);
           }
       }
       else{
           setMessages([...messages,messageRecieved]);
       }   
      });
    });
    console.log(notification);
    const inputHandler = (e) => {
        setNewMessage(e.target.value);
    }

  return (
    <>
        { selectedChat ? (
            <>
                <Text 
                fontSize={{ base: "28px", md: "30px" }}
                pb={3}
                px={2}
                w="100%"
                fontFamily="Work sans"
                fontWeight="extrabold"
                display="flex"
                justifyContent={{ base: "space-between" }}
                alignItems="center">
                    {!selectedChat.isGroupChat ? (
                        <>
                            {getSender(user,selectedChat.users)}
                            <ChatModal user = {getSenderFull(user, selectedChat.users)} />
                        </>
                    ) : (
                        <>
                            {selectedChat.chatName}
                            <UpdateGroupChat
                                fetchMessages={fetchMessages}
                                fetchAgain={fetchAgain}
                                setFetchAgain={setFetchAgain}
                            />
                        </>
                    )}
                </Text>
                <Box 
                    display="flex"
                    flexDir="column"
                    justifyContent="flex-end"
                    p={3}
                    bgColor="#E8E8E8"
                    w="100%"
                    h="92%"
                    overflowY="hidden"
                    borderRadius="lg"
                >
                    {isLoading ? (
                        <Spinner
                            size="xl"
                            width={20}
                            height={20}
                            margin="auto"
                            alignSelf="center"
                        />
                    )
                    : (
                        <div className="messages">
                            <Box>
                                <RenderChat messages={messages}/>
                            </Box>
                        </div>
                    )}

                    <FormControl onKeyDown={sendMessage} mt={3} isRequired>
                        <Input
                            variant="filled"
                            bgColor="#bde7df"
                            placeholder="Enter a Message"
                            onChange={inputHandler}
                            value={newMessage}
                        />
                </FormControl>
                </Box> 
            </>
        ) : (
            <Box  display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on user to start Chatting!!
                </Text>
            </Box>
        )
    }
    </>
  )
}

export default DisplayChat
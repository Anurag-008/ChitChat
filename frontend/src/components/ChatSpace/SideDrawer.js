import { Box, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {Menu, MenuButton, MenuDivider, MenuItem, MenuList} from "@chakra-ui/react";
import {BellIcon, HamburgerIcon} from "@chakra-ui/icons";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useDisclosure } from "@chakra-ui/react";

import React, {useState} from "react"
import { Avatar} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import { useHistory } from "react-router-dom";
import ChatModal from "./ChatModal";
import axios from "axios";
import UserListItem from "../UserListItem";
import ChatLoading from "../ChatLoading";
import { getSender } from "../../config/Chatlogics";
import { MDBBadge, MDBIcon } from 'mdb-react-ui-kit';

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [loadingchat, setLoadingchat] = useState(false);

  const {user , setSelectedChat, chats, setChats, notification, setNotification} = ChatState();

  const history = useHistory();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async() => {
    if(!search){
      toast({
        title: "Please Enter something",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setIsloading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setIsloading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    // console.log(userId);
    try {
      setLoadingchat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chats`, { userId }, config);
      // console.log(data);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingchat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Fetching Chats",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };


  return (
    <>
    <Box 
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      w="100%"
      p="5px 10px 5px 10px"
      borderWidth="5px">
        {/* <Tooltip label="Search Users to chat" hasArrow placement="bottom-end"> */}
            <Button variant="ghost" onClick={onOpen}>
              <i className="fas fa-search"></i>
              <Text display={{ base: "none", md: "flex" }} px={4}>
                Search User
              </Text>
            </Button>
          {/* </Tooltip> */}
          <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold">
            CHIT-CHAT
          </Text>
          <div>
            <Menu>
              <MenuButton p={1}>
              <MDBBadge color='danger' notification pill>
                {notification.length}
              </MDBBadge>
              <BellIcon fontSize="2xl" m={1} />
              </MenuButton>
              <MenuList pl={2} bgColor='#93deff'>
                {!notification.length && "No New Message!!"}
                {notification.map((notify) => (
                  <MenuItem key={notify._id} onClick={() => {
                    setSelectedChat(notify.chat);
                    setNotification(notification.filter((n) => n !== notify));
                  }}>
                    {notify.chat.isGroupChat ? `New Message from ${notify.chat.chatName}` : 
                    `New Message from ${getSender(user,notify.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton as={Button} rightIcon={<HamburgerIcon/>}>
                <Avatar size='sm' cursor="pointer" name={user.name} src={user.pic} />
              </MenuButton>
              <MenuList>
                <ChatModal user={user}>
                  <MenuItem>
                    Profile
                  </MenuItem>
                </ChatModal>
                <MenuDivider/>
                <MenuItem onClick={logoutHandler}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen }>
        <DrawerOverlay/>
          <DrawerContent>
            <DrawerCloseButton/>
            <DrawerHeader> Search User </DrawerHeader>
            <DrawerBody>
              <Box display="flex" pb={2}>
                <Input 
                placeholder="search by name or email" 
                mr='2' 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} />
                <Button onClick={handleSearch}>
                  Go
                </Button>
              </Box>
              {isloading ? (
              <ChatLoading />
            ) : (
              searchResult ?.slice(0, 3)
              .map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingchat}
            </DrawerBody>
          </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
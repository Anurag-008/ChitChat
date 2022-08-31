import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Box,
  FormControl,
  Input,
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { useToast } from '@chakra-ui/react'
import UserBadge from './UserBadge'
import axios from 'axios'
import UserListItem from './UserListItem'

const UpdateGroupChat = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleRemove = async(user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only Admin can Remove Someone !!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.put(`/api/chats/removeuser`, {
        groupID: selectedChat._id,
        userID: user1._id
      },config)

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);

    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  }

  const handleRename = async() => {
    if(!groupChatName){
      return;
    }
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.put(`/api/chats/renamegroup`, {
        chatID: selectedChat._id,
        newChatName: groupChatName
      }, config);

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);

    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  }

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load Search Results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleAddUser = async(user1) => {
    if(selectedChat.users.find((u) => u._id === user1._id)){
      toast({
        title: "User Already in the Group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if(selectedChat.groupAdmin._id !== user._id){
      toast({
        title: "Only Admin can Add Someone !!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.put(`/api/chats/adduser` , {
        groupID: selectedChat._id,
        userID: user1._id
      }, config)

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);

    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }

  };

  return (
    <>
      <EditIcon onClick={onOpen} display={"flex"} cursor="pointer" />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
        <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" w="100%" flexWrap="wrap" pb={3} >
              {selectedChat.users.map((u) => (
                <UserBadge
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input placeholder="Rename Group"
               mb={3} 
               value={groupChatName} 
               onChange = {(e) => setGroupChatName(e.target.value)} />
               <Button variant="solid" ml={1} isLoading={renameloading} onClick={handleRename} bgColor="#00aaa0" >
                 Update
               </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult
              ?.slice(0,2)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
            )}
            
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChat
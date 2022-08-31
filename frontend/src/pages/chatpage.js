import { Box } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider"
import SideDrawer from "../components/ChatSpace/SideDrawer";
import MyChats from "../components/ChatSpace/MyChats";
import ChatBox from "../components/ChatSpace/ChatBox";
import { useState } from "react";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{width: "100%"}}>
      {user && <SideDrawer/>}

      <Box  display="flex" justifyContent="space-between" h='91.5vh' w="100%" p="10px">
        {user && <MyChats fetchAgain={fetchAgain}/>}
        {user && (<ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />)}
      </Box>

    </div>
  )
}

export default Chatpage
import React from 'react'
import { ChatState } from '../context/ChatProvider'
import { Tooltip } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { isSameSender, isLastMessage, isSameSenderMargin, isSameUser} from '../config/Chatlogics';


const RenderChat = ({messages}) => {
    const { user } =ChatState();
  return (
    <>
        {messages && messages.map( (m,i) => (
            <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="grab"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}    
    </>
  )
}

export default RenderChat
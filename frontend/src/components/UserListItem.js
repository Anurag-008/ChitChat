import { Avatar } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import { ChatState } from '../context/ChatProvider'

const UserListItem = ({ user, handleFunction }) => {
//   const { user } = ChatState();

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#41d8bf"
      _hover={{
        background: "#2e94b9",
        color: "#0e2431",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
} from '@chakra-ui/react';
import { useDisconnect } from "wagmi";
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';


const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { disconnect } = useDisconnect();

  return (
    <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
      <IconButton
        size={'md'}
        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
        aria-label={'Open Menu'}
        display={{ md: 'none' }}
        onClick={isOpen ? onClose : onOpen}
      />
      <HStack spacing={8} alignItems={'center'}>
        <Box>Lenstags</Box>
      </HStack>
      <Flex alignItems={'center'}>
        <Button
          variant={'solid'}
          colorScheme={'teal'}
          size={'sm'}
          mr={4}
          leftIcon={<AddIcon />}>
          Post
        </Button>
        <Menu>
          <MenuButton
            as={Button}
            rounded={'full'}
            variant={'link'}
            cursor={'pointer'}
            minW={0}>
            <Avatar
              size={'sm'}
              src={
                'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
              }
            />
          </MenuButton>
          <MenuList>
            <MenuItem>Edit Profile</MenuItem>
            <MenuDivider />
            <MenuItem onClick={() => disconnect()}>Disconect</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}

export default NavBar;
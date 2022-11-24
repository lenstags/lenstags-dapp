import { Card as ChakraCard, CardHeader, CardBody, CardFooter, Flex, Heading, Text, Avatar, Box, IconButton, Image, Button } from '@chakra-ui/react'

export const Card = () => (
  <ChakraCard maxW="md">
    <CardHeader>
      <Flex spacing="4">
        <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
          <Avatar name="Segun Adebayo" src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9" />
          <Box>
            <Heading size="sm">Segun Adebayo</Heading>
            <Text>Creator, Lenstags</Text>
          </Box>
        </Flex>
      </Flex>
    </CardHeader>
    <CardBody>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </Text>
    </CardBody>
    <Image
      objectFit="cover"
      src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
      alt="Profile"
    />

    <CardFooter
      justify="space-between"
      flexWrap="wrap"
      sx={{
        '& > button': {
          minW: '136px',
        },
      }}
    >
      <Button flex="1" variant="ghost">
        Like
      </Button>
      <Button flex="1" variant="ghost">
        Comment
      </Button>
      <Button flex="1" variant="ghost">
        Share
      </Button>
    </CardFooter>
  </ChakraCard>
);
import React from 'react';
import { Box, Container, Flex, Heading, Button, useColorMode } from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { account, connect } = useWallet();

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <Box bg={colorMode === 'dark' ? 'gray.700' : 'white'} py={4} shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="md">JoyNet</Heading>
            <Flex align="center" gap={4}>
              <Button
                size="sm"
                onClick={toggleColorMode}
              >
                {colorMode === 'dark' ? '🌞' : '🌙'}
              </Button>
              <Button
                colorScheme="blue"
                onClick={connect}
                size="sm"
              >
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : 'Connect Wallet'}
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box py={8}>
        {children}
      </Box>
      <Box
        as="footer"
        py={4}
        textAlign="center"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      >
        <Container maxW="container.xl">
          Built with ❤️ by the JoyNet Community
        </Container>
      </Box>
    </Box>
  );
};
import React from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaWallet, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '../../hooks/useWallet';

export const Navbar = () => {
  const { account, connect, disconnect } = useWallet();
  const router = useRouter();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex={1000}
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        py={4}
        align="center"
        justify="space-between"
      >
        <Link href="/" passHref>
          <Text
            fontSize="xl"
            fontWeight="bold"
            cursor="pointer"
            _hover={{ color: 'blue.500' }}
          >
            AI Models Marketplace
          </Text>
        </Link>

        <HStack spacing={8}>
          <Link href="/ai-models" passHref>
            <Text cursor="pointer" _hover={{ color: 'blue.500' }}>
              Browse Models
            </Text>
          </Link>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
            >
              Create
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => router.push('/ai-models/create')}>
                List New Model
              </MenuItem>
              <MenuItem onClick={() => router.push('/ai-models/import')}>
                Import Model
              </MenuItem>
            </MenuList>
          </Menu>

          <Link href="/staking" passHref>
            <Text cursor="pointer" _hover={{ color: 'blue.500' }}>
              Staking
            </Text>
          </Link>

          {account ? (
            <HStack>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  leftIcon={<Icon as={FaUser} />}
                >
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/ai-models/my-models')}>
                    My Models
                  </MenuItem>
                  <MenuItem onClick={disconnect}>Disconnect</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <Button
              leftIcon={<Icon as={FaWallet} />}
              colorScheme="blue"
              onClick={connect}
            >
              Connect Wallet
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
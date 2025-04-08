import { Box, Flex, HStack, Link, Button, useDisclosure } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import NextLink from 'next/link';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'AI Models', href: '/ai-models' },
  { label: 'Domains', href: '/domains' },
  { label: 'Community', href: '/community' },
  { label: 'Stake', href: '/stake' },
];

export default function MainNav() {
  const { account, activate, deactivate } = useWeb3React();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <NextLink href="/" passHref>
            <Link fontSize="xl" fontWeight="bold">PermaNet</Link>
          </NextLink>
          <HStack spacing={4}>
            {NAV_ITEMS.map((item) => (
              <NextLink key={item.label} href={item.href} passHref>
                <Link>{item.label}</Link>
              </NextLink>
            ))}
          </HStack>
        </HStack>
        <HStack>
          {!account ? (
            <Button colorScheme="blue" onClick={() => activate()}>
              Connect Wallet
            </Button>
          ) : (
            <Button onClick={() => deactivate()}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
    >
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align="flex-start">
            <Text fontWeight="bold" mb={2}>Community</Text>
            <Link href="/forums">Forums</Link>
            <Link href="/events">Events</Link>
            <Link href="/blog">Blog</Link>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="bold" mb={2}>Resources</Text>
            <Link href="/documentation">Documentation</Link>
            <Link href="/tutorials">Tutorials</Link>
            <Link href="/api-reference">API Reference</Link>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="bold" mb={2}>Platform</Text>
            <Link href="/ai-models">Browse Models</Link>
            <Link href="/staking">Staking</Link>
            <Link href="/help-center">Help Center</Link>
          </Stack>

          <Stack align="flex-start">
            <Text fontWeight="bold" mb={2}>Legal</Text>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/contact">Contact Us</Link>
          </Stack>
        </SimpleGrid>

        <Box pt={10}>
          <Text pt={6} fontSize="sm" textAlign="center">
            © {new Date().getFullYear()} AI Models Marketplace. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
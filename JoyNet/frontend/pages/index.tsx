import { Box, Container, Grid, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import FeaturedModels from '../components/FeaturedModels';
import Hero from '../components/Hero';
import TopModels from '../components/TopModels';
import RecentModels from '../components/RecentModels';
import JoyTokenStaking from '../components/JoyTokenStaking';

export default function HomePage() {
  const { account, library } = useWeb3React();

  return (
    <Box>
      <Hero />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={12}>
          <Box w="full">
            <Stack spacing={8}>
              <Heading>Featured AI Models</Heading>
              <FeaturedModels />
            </Stack>
          </Box>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
            <Box>
              <Stack spacing={8}>
                <Heading size="lg">Top Models</Heading>
                <TopModels />
              </Stack>
            </Box>
            <Box>
              <Stack spacing={8}>
                <Heading size="lg">Recent Updates</Heading>
                <RecentModels />
              </Stack>
            </Box>
          </Grid>

          <Box w="full" bg="gray.50" p={8} borderRadius="lg">
            <Stack spacing={8}>
              <Heading size="lg">Stake JOY Tokens</Heading>
              <Text>Earn rewards by staking your JOY tokens</Text>
              <JoyTokenStaking account={account} provider={library} />
            </Stack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
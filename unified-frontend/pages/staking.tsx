import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box
} from '@chakra-ui/react';
import JoyTokenStaking from '../components/JoyTokenStaking';

export default function StakingPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>JOY Token Staking</Heading>
          <Text color="gray.600">
            Stake your JOY tokens to earn rewards and participate in governance
          </Text>
        </Box>
        
        <JoyTokenStaking />
      </VStack>
    </Container>
  );
}
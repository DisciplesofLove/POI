import React from 'react';
import { Box, Heading, Text, Button, Badge, Stack } from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useModelMarketplace } from '../hooks/useModelMarketplace';

interface ModelCardProps {
  modelId: string;
  name: string;
  description: string;
  price: number;
  owner: string;
  stats: {
    totalUses: number;
    reputation: number;
  };
}

export const ModelCard: React.FC<ModelCardProps> = ({
  modelId,
  name,
  description,
  price,
  owner,
  stats,
}) => {
  const { account } = useWallet();
  const { executeModel } = useModelMarketplace();

  const handleExecute = async () => {
    try {
      await executeModel(modelId);
    } catch (error) {
      console.error('Failed to execute model:', error);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      boxShadow="sm"
    >
      <Stack spacing={2}>
        <Heading size="md">{name}</Heading>
        <Text fontSize="sm" color="gray.600">
          {description}
        </Text>
        <Stack direction="row" spacing={2}>
          <Badge colorScheme="green">Price: {price} JOY</Badge>
          <Badge colorScheme="blue">Uses: {stats.totalUses}</Badge>
          <Badge colorScheme="purple">Rep: {stats.reputation}</Badge>
        </Stack>
        <Button
          colorScheme="blue"
          onClick={handleExecute}
          isDisabled={!account}
        >
          Execute Model
        </Button>
      </Stack>
    </Box>
  );
};
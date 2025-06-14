import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Flex,
  Tooltip
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useModelMarketplace } from '../hooks/useModelMarketplace';

interface ModelStats {
  totalUses: number;
  reputation: number;
  successRate?: number;
  lastUsed?: string;
}

interface ModelCardProps {
  modelId: string;
  name: string;
  description: string;
  price: number;
  owner: string;
  image?: string;
  category?: string;
  stats: ModelStats;
  onViewDetails?: (modelId: string) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  modelId,
  name,
  description,
  price,
  owner,
  image,
  category,
  stats,
  onViewDetails
}) => {
  const { account } = useWallet();
  const { executeModel, buyModel } = useModelMarketplace();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    try {
      setIsLoading(true);
      await executeModel(modelId);
    } catch (error) {
      console.error('Failed to execute model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      setIsLoading(true);
      await buyModel(modelId, price);
    } catch (error) {
      console.error('Failed to buy model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <Stack spacing={4}>
        {image && (
          <Image
            src={image}
            alt={name}
            borderRadius="md"
            objectFit="cover"
            height="200px"
            width="100%"
          />
        )}
        
        <Heading size="md" cursor="pointer" onClick={() => onViewDetails?.(modelId)}>
          {name}
        </Heading>
        
        <Text fontSize="sm" color="gray.600" noOfLines={2}>
          {description}
        </Text>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Badge colorScheme="green">Price: {price} JOY</Badge>
          <Badge colorScheme="blue">Uses: {stats.totalUses}</Badge>
          <Badge colorScheme="purple">Rep: {stats.reputation}</Badge>
          {category && <Badge colorScheme="orange">{category}</Badge>}
          {stats.successRate && (
            <Badge colorScheme="teal">Success: {stats.successRate}%</Badge>
          )}
        </Stack>

        <Flex gap={2}>
          <Button
            colorScheme="blue"
            onClick={handleExecute}
            isDisabled={!account}
            isLoading={isLoading}
            flex="1"
          >
            Execute
          </Button>
          <Button
            colorScheme="green"
            onClick={handleBuy}
            isDisabled={!account}
            isLoading={isLoading}
            flex="1"
          >
            Buy
          </Button>
          <Tooltip label="View Details">
            <Button
              colorScheme="gray"
              onClick={() => onViewDetails?.(modelId)}
            >
              Details
            </Button>
          </Tooltip>
        </Flex>
      </Stack>
    </Box>
  );
};

export default ModelCard;
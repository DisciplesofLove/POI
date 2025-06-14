import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Image,
  Badge,
  Flex,
  Box,
  Divider,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useModelMarketplace, Model } from '../hooks/useModelMarketplace';

interface ModelDetailModalProps {
  model: Model;
  isOpen: boolean;
  onClose: () => void;
}

const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  isOpen,
  onClose
}) => {
  const toast = useToast();
  const { account } = useWallet();
  const { executeModel, buyModel, loading } = useModelMarketplace();

  const handleExecute = async () => {
    try {
      await executeModel(model.id);
      toast({
        title: 'Success',
        description: 'Model executed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBuy = async () => {
    try {
      await buyModel(model.id, model.price);
      toast({
        title: 'Success',
        description: 'Model purchased successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{model.name}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {model.image && (
              <Image
                src={model.image}
                alt={model.name}
                borderRadius="md"
                objectFit="cover"
                maxH="300px"
                w="100%"
              />
            )}

            <Text>{model.description}</Text>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>Stats</Text>
              <Flex wrap="wrap" gap={2}>
                <Badge colorScheme="green">Price: {model.price} JOY</Badge>
                <Badge colorScheme="blue">Uses: {model.stats.totalUses}</Badge>
                <Badge colorScheme="purple">Rep: {model.stats.reputation}</Badge>
                {model.category && (
                  <Badge colorScheme="orange">{model.category}</Badge>
                )}
                {model.stats.successRate && (
                  <Badge colorScheme="teal">
                    Success: {model.stats.successRate}%
                  </Badge>
                )}
              </Flex>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Owner</Text>
              <Text fontSize="sm" color="gray.600">
                {model.owner}
              </Text>
            </Box>

            {model.stats.lastUsed && (
              <Box>
                <Text fontWeight="bold" mb={2}>Last Used</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(model.stats.lastUsed).toLocaleDateString()}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Flex gap={2} w="100%">
            <Button
              colorScheme="blue"
              onClick={handleExecute}
              isDisabled={!account}
              isLoading={loading}
              flex="1"
            >
              Execute Model
            </Button>
            <Button
              colorScheme="green"
              onClick={handleBuy}
              isDisabled={!account}
              isLoading={loading}
              flex="1"
            >
              Buy Model
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModelDetailModal;
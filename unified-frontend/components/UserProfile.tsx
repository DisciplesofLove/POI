import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { useModelMarketplace, Model } from '../hooks/useModelMarketplace';
import ModelCard from './ModelCard';
import JoyTokenStaking from './JoyTokenStaking';

interface UserStats {
  totalModels: number;
  totalEarnings: number;
  modelExecutions: number;
}

const UserProfile: React.FC = () => {
  const [userModels, setUserModels] = useState<Model[]>([]);
  const [purchasedModels, setPurchasedModels] = useState<Model[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalModels: 0,
    totalEarnings: 0,
    modelExecutions: 0
  });

  const { account } = useWallet();
  const { getModels, loading } = useModelMarketplace();
  const toast = useToast();

  useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const loadUserData = async () => {
    if (!account) return;
    try {
      const allModels = await getModels();
      const owned = allModels.filter(model => model.owner === account);
      const purchased = allModels.filter(model => 
        model.owner !== account && model.purchases?.includes(account)
      );

      setUserModels(owned);
      setPurchasedModels(purchased);
      setStats({
        totalModels: owned.length,
        totalEarnings: owned.reduce((sum, model) => sum + model.earnings || 0, 0),
        modelExecutions: owned.reduce((sum, model) => sum + model.stats.totalUses, 0)
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!account) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Please connect your wallet to view your profile</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={4}>
          <Avatar size="xl" mb={4} />
          <Heading size="lg">{account}</Heading>
          <Text color="gray.600">Model Creator & Developer</Text>
        </Box>

        <StatGroup>
          <Stat>
            <StatLabel>Total Models</StatLabel>
            <StatNumber>{stats.totalModels}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Earnings</StatLabel>
            <StatNumber>{stats.totalEarnings} JOY</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Model Executions</StatLabel>
            <StatNumber>{stats.modelExecutions}</StatNumber>
          </Stat>
        </StatGroup>

        <Box>
          <Heading size="md" mb={4}>JOY Token Staking</Heading>
          <JoyTokenStaking />
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>My Models</Tab>
            <Tab>Purchased Models</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {userModels.map(model => (
                  <ModelCard key={model.id} {...model} />
                ))}
                {userModels.length === 0 && (
                  <Text>You haven't created any models yet.</Text>
                )}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {purchasedModels.map(model => (
                  <ModelCard key={model.id} {...model} />
                ))}
                {purchasedModels.length === 0 && (
                  <Text>You haven't purchased any models yet.</Text>
                )}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default UserProfile;
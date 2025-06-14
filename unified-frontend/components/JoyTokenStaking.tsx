import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { useWallet } from '../hooks/useWallet';
import { stakeJoyTokens, getJoyTokenBalance, getStakedJoyTokens } from '../utils/web3';

const JoyTokenStaking: React.FC = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [joyBalance, setJoyBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();
  const toast = useToast();

  useEffect(() => {
    if (account) {
      loadBalances();
    }
  }, [account]);

  const loadBalances = async () => {
    if (!account) return;
    try {
      const [balance, staked] = await Promise.all([
        getJoyTokenBalance(account),
        getStakedJoyTokens(account)
      ]);
      setJoyBalance(balance);
      setStakedBalance(staked);
    } catch (error) {
      console.error('Error loading balances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load token balances',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStake = async () => {
    if (!account || !stakeAmount) return;
    setIsLoading(true);
    try {
      await stakeJoyTokens(stakeAmount);
      toast({
        title: 'Success',
        description: `Successfully staked ${stakeAmount} JOY tokens`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setStakeAmount('');
      loadBalances();
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to stake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      boxShadow="sm"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <StatGroup>
          <Stat>
            <StatLabel>Available JOY</StatLabel>
            <StatNumber>{parseFloat(joyBalance).toFixed(2)} JOY</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Staked JOY</StatLabel>
            <StatNumber>{parseFloat(stakedBalance).toFixed(2)} JOY</StatNumber>
          </Stat>
        </StatGroup>

        <Divider />

        <FormControl>
          <FormLabel>Stake Amount</FormLabel>
          <InputGroup>
            <Input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter amount to stake"
              disabled={!account}
            />
            <InputRightElement width="4.5rem">
              JOY
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          colorScheme="blue"
          isLoading={isLoading}
          onClick={handleStake}
          isDisabled={!account || !stakeAmount || isLoading}
          width="100%"
        >
          Stake JOY Tokens
        </Button>

        {!account && (
          <Text color="gray.500" fontSize="sm" textAlign="center">
            Please connect your wallet to stake JOY tokens
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default JoyTokenStaking;
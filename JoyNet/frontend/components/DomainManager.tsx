import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';

// Contract ABI will need to be imported
const DOMAIN_REGISTRY_ABI = []; // TODO: Add ABI after contract deployment

export default function DomainManager({ account, provider }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const domainRegistry = new ethers.Contract(
    process.env.NEXT_PUBLIC_DOMAIN_REGISTRY_ADDRESS || '',
    DOMAIN_REGISTRY_ABI,
    provider
  );

  const registerDomain = async () => {
    if (!domain) return;
    
    try {
      setLoading(true);
      const tx = await domainRegistry.register(domain);
      await tx.wait();
      
      toast({
        title: 'Success',
        description: `Domain ${domain} registered successfully`,
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={4}>
        <Text fontSize="xl">Domain Registration</Text>
        <Input
          placeholder="Enter domain name"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <Button
          colorScheme="blue"
          onClick={registerDomain}
          isLoading={loading}
          isDisabled={!account}
        >
          Register Domain
        </Button>
      </VStack>
    </Box>
  );
}
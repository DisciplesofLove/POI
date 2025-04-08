import { Box, Container } from '@chakra-ui/react';
import DomainManager from '../components/DomainManager';
import { useWeb3React } from '@web3-react/core';

export default function DomainsPage() {
  const { account, library } = useWeb3React();

  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <DomainManager account={account} provider={library} />
      </Box>
    </Container>
  );
}
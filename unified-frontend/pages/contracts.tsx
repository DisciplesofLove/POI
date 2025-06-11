import { Container, Typography, Box } from '@mui/material';
import { SmartContractManager } from '../components/SmartContractManager';

// This should be configured based on your deployment
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '';

export default function ContractsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Smart Contract Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create, deploy, and manage your smart contracts. Link them with your models and datasets to create powerful AI-driven decentralized applications.
        </Typography>
        <SmartContractManager marketplaceAddress={MARKETPLACE_ADDRESS} />
      </Box>
    </Container>
  );
}
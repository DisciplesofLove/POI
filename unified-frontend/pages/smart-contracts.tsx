import { Box, Container } from '@mui/material';
import { SmartContractManager } from '../components/SmartContractManager';

export default function SmartContracts() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <SmartContractManager />
      </Box>
    </Container>
  );
}
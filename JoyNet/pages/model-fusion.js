import { Box, Container, Typography } from '@mui/material';
import ModelFusionEngine from '../components/ModelFusionEngine';
import Navbar from '../components/Navbar';

export default function ModelFusionPage() {
    return (
        <Box>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <ModelFusionEngine />
            </Container>
        </Box>
    );
}
import { Box } from '@mui/material';
import AIMarketplaceLanding from '../components/AIMarketplaceLanding';
import Navbar from '../components/Navbar';

export default function HomePage() {
    return (
        <Box>
            <Navbar />
            <AIMarketplaceLanding />
        </Box>
    );
}
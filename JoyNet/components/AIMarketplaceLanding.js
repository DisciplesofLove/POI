import { useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardMedia,
    CardActions,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tabs,
    Tab
} from '@mui/material';
import { 
    Storage as StorageIcon,
    CloudUpload as CloudUploadIcon,
    Security as SecurityIcon,
    Code as CodeIcon,
    Gavel as GavelIcon,
    PlayArrow as PlayArrowIcon,
    ShoppingCart as ShoppingCartIcon,
    Dataset as DatasetIcon,
    VerifiedUser as VerifiedUserIcon,
    Favorite as FavoriteIcon,
    Merge as MergeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function AIMarketplaceLanding() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const navigateTo = (path) => {
        router.push(path);
    };

    return (
        <Box>
            {/* Hero Section */}
            <Box 
                sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    py: 8,
                    borderRadius: { xs: 0, sm: '0 0 2rem 2rem' }
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography variant="h2" component="h1" gutterBottom>
                                Build Your AI System on Joy
                            </Typography>
                            <Typography variant="h5" paragraph>
                                The complete platform for creating, deploying, and monetizing AI models with transparent ownership and ethical standards.
                            </Typography>
                            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large"
                                    onClick={() => navigateTo('/model-builder')}
                                >
                                    Start Building
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="inherit" 
                                    size="large"
                                    onClick={() => navigateTo('/models')}
                                >
                                    Browse Models
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box 
                                component="img"
                                src="/ai-hero-image.png"
                                alt="AI Platform"
                                sx={{ 
                                    width: '100%', 
                                    borderRadius: 2,
                                    boxShadow: 3
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Main Features Tabs */}
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Build Process" />
                        <Tab label="Marketplace" />
                        <Tab label="Model Fusion" />
                        <Tab label="Ethics & Licensing" />
                    </Tabs>
                </Box>

                {/* Build Process Tab */}
                {activeTab === 0 && (
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Build Your AI System in 6 Simple Steps
                        </Typography>
                        
                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                1
                                            </Box>
                                            <Typography variant="h6">Select Compute</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Choose from integrated DePIN options like Akash and Golem to power your AI infrastructure needs.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                2
                                            </Box>
                                            <Typography variant="h6">Pick Datasets</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Access curated or community-contributed data, or securely upload your own training materials.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                3
                                            </Box>
                                            <Typography variant="h6">Secure & Store</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Encrypt, chunk, and hash your data across decentralized storage networks like IPFS, Arweave, and Filecoin.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                4
                                            </Box>
                                            <Typography variant="h6">Select Base Model</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Upload your own or choose from open-source, licensed, or foundation models as your starting point.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                5
                                            </Box>
                                            <Typography variant="h6">Define License & Royalties</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Generate AI-optimized smart contract terms and configure transparent, programmable revenue shares.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white', 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                6
                                            </Box>
                                            <Typography variant="h6">Test & Launch</Typography>
                                        </Box>
                                        <Typography variant="body1">
                                            Validate your model in the JoyNet sandbox with community feedback, then deploy as an API or application.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button 
                                variant="contained" 
                                size="large"
                                onClick={() => navigateTo('/model-builder')}
                            >
                                Start Building Now
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Marketplace Tab */}
                {activeTab === 1 && (
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Everything You Need in One Place
                        </Typography>
                        
                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            AI Model Marketplace
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Browse, purchase, and deploy from a wide selection of AI models with transparent ownership and licensing.
                                        </Typography>
                                        <Button 
                                            variant="outlined" 
                                            onClick={() => navigateTo('/models')}
                                        >
                                            Browse Models
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <DatasetIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Dataset Exchange
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Access high-quality training data with clear usage rights and compensation structures for data providers.
                                        </Typography>
                                        <Button 
                                            variant="outlined"
                                            onClick={() => navigateTo('/datasets')}
                                        >
                                            Explore Datasets
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Smart Licensing Engine
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Create and manage complex AI licenses through an intuitive interface, with all terms encoded on-chain.
                                        </Typography>
                                        <Button 
                                            variant="outlined"
                                            onClick={() => navigateTo('/licensing')}
                                        >
                                            Create License
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Ethics Scoring (Love & Vice)
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Transparent rating system for AI models based on community-defined ethical standards and performance metrics.
                                        </Typography>
                                        <Button 
                                            variant="outlined"
                                            onClick={() => navigateTo('/ethics')}
                                        >
                                            View Ratings
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Model Fusion Tab */}
                {activeTab === 2 && (
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            The Model Fusion Engine
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Joy's Model Fusion Engine enables developers to combine complementary AI systems—pairing capabilities like vision with language, reasoning with retrieval, or specialized domain expertise—to create powerful composite models that exceed the capabilities of individual components.
                        </Typography>
                        
                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6} lg={3}>
                                <Card sx={{ height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image="/fusion-discover.png"
                                        alt="Discover Compatible Models"
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Discover Compatible Models
                                        </Typography>
                                        <Typography variant="body2">
                                            AI-powered recommendation system identifies complementary models that can be combined for enhanced capabilities.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6} lg={3}>
                                <Card sx={{ height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image="/fusion-configure.png"
                                        alt="Configure Connection Points"
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Configure Connection Points
                                        </Typography>
                                        <Typography variant="body2">
                                            Define how models will interact, with automated compatibility checking and optimization suggestions.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6} lg={3}>
                                <Card sx={{ height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image="/fusion-test.png"
                                        alt="Test Combined Performance"
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Test Combined Performance
                                        </Typography>
                                        <Typography variant="body2">
                                            Evaluate the fused model against benchmarks to ensure performance improvement over individual components.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6} lg={3}>
                                <Card sx={{ height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image="/fusion-deploy.png"
                                        alt="Deploy as New Entity"
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Deploy as New Entity
                                        </Typography>
                                        <Typography variant="body2">
                                            Launch your composite model with proper attribution and royalty distribution to all component creators.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button 
                                variant="contained" 
                                color="secondary"
                                size="large"
                                startIcon={<MergeIcon />}
                                onClick={() => navigateTo('/model-fusion')}
                            >
                                Try Model Fusion
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Ethics & Licensing Tab */}
                {activeTab === 3 && (
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Ethics & Licensing
                        </Typography>
                        
                        <Grid container spacing={4} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Ethics Scoring System
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Our Love & Vice scoring system provides transparent ethical ratings for all AI models on the platform:
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <FavoriteIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Love Score" 
                                                    secondary="Measures positive ethical attributes like fairness, transparency, and beneficial impact" 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <SecurityIcon color="warning" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Vice Score" 
                                                    secondary="Identifies potential ethical concerns like bias, privacy risks, or harmful applications" 
                                                />
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Smart Licensing
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Our AI-optimized licensing system enables:
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CodeIcon />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="On-chain License Terms" 
                                                    secondary="All licensing terms are encoded in smart contracts for transparency and enforcement" 
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <StorageIcon />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Programmable Royalties" 
                                                    secondary="Automatic distribution of royalties to all contributors in the AI creation chain" 
                                                />
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Container>

            {/* Call to Action */}
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6, mt: 6 }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Ready to Build Your AI System?
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Join the Joy platform and start creating, deploying, and monetizing AI models today.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={() => navigateTo('/register')}
                        sx={{ mt: 2 }}
                    >
                        Get Started
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
                            
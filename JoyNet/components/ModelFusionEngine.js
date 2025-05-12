import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { 
    Box, 
    Typography, 
    TextField, 
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stepper,
    Step,
    StepLabel,
    Divider,
    Chip,
    Alert
} from '@mui/material';
import { ethers } from 'ethers';
import { useModelMarketplace } from '../hooks/useModelMarketplace';
import { usePurchaseModel } from '../hooks/usePurchaseModel';
import { MODEL_TYPES } from '../utils/constants';
import { deployModel } from '../utils/deployment';
import { generateApiKey } from '../utils/api';

const steps = [
    'Discover Compatible Models',
    'Configure Connection Points',
    'Test Combined Performance',
    'Deploy as New Entity'
];

export default function ModelFusionEngine() {
    const { account, library } = useWeb3React();
    const { getAvailableModels } = useModelMarketplace();
    const { purchaseModel } = usePurchaseModel();
    
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modelType, setModelType] = useState('');
    
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState([]);
    const [compatibilityResults, setCompatibilityResults] = useState(null);
    const [connectionConfig, setConnectionConfig] = useState({});
    const [benchmarkResults, setBenchmarkResults] = useState(null);
    const [fusedModelDetails, setFusedModelDetails] = useState({
        name: '',
        description: '',
        price: ''
    });
    
    // Load available models
    useEffect(() => {
        const loadModels = async () => {
            setLoadingModels(true);
            try {
                const models = await getAvailableModels();
                setAvailableModels(models);
            } catch (error) {
                console.error('Error loading models:', error);
            } finally {
                setLoadingModels(false);
            }
        };
        
        loadModels();
    }, [getAvailableModels]);
    
    // Filter models based on search and type
    const filteredModels = availableModels.filter(model => {
        const matchesSearch = !searchQuery || 
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.description.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesType = !modelType || model.modelType === modelType;
        
        return matchesSearch && matchesType;
    });
    
    // Check if models are compatible
    const checkCompatibility = async () => {
        if (selectedModels.length < 2) {
            alert('Please select at least two models to check compatibility');
            return;
        }
        
        setLoading(true);
        try {
            // This would be an API call to an AI service that analyzes model compatibility
            // For now, we'll simulate the response
            const compatibilityScore = Math.random() * 100;
            const isCompatible = compatibilityScore > 60;
            
            const connectionPoints = [];
            
            // Generate potential connection points based on model types
            if (selectedModels.some(m => m.modelType === MODEL_TYPES.TRANSFORMER) && 
                selectedModels.some(m => m.modelType === MODEL_TYPES.CNN)) {
                connectionPoints.push({
                    id: 'text-to-image',
                    name: 'Text to Image Bridge',
                    description: 'Connect text output from transformer to image input for CNN',
                    compatibility: 85
                });
            }
            
            if (selectedModels.some(m => m.modelType === MODEL_TYPES.GPT) && 
                selectedModels.some(m => m.modelType === MODEL_TYPES.ALGORITHM)) {
                connectionPoints.push({
                    id: 'reasoning-engine',
                    name: 'Reasoning Engine',
                    description: 'Use GPT output as input for algorithmic reasoning',
                    compatibility: 92
                });
            }
            
            // Add more connection points based on other combinations
            connectionPoints.push({
                id: 'data-pipeline',
                name: 'Data Pipeline',
                description: 'Standard data transformation pipeline between models',
                compatibility: 75
            });
            
            setCompatibilityResults({
                score: compatibilityScore,
                isCompatible,
                connectionPoints,
                recommendations: isCompatible ? 
                    'These models can work well together with proper configuration.' : 
                    'These models may not be fully compatible. Consider selecting different models.'
            });
            
            if (isCompatible) {
                setActiveStep(1);
            }
        } catch (error) {
            console.error('Error checking compatibility:', error);
            alert('Error checking model compatibility');
        } finally {
            setLoading(false);
        }
    };
    
    // Configure connection points between models
    const configureConnections = (connectionId, config) => {
        setConnectionConfig(prev => ({
            ...prev,
            [connectionId]: config
        }));
    };
    
    // Test combined model performance
    const testCombinedPerformance = async () => {
        setLoading(true);
        try {
            // This would be an API call to test the combined model
            // For now, we'll simulate the response
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const benchmarks = {
                accuracy: (Math.random() * 20 + 80).toFixed(2), // 80-100%
                latency: (Math.random() * 50 + 10).toFixed(2), // 10-60ms
                throughput: (Math.random() * 1000 + 500).toFixed(0), // 500-1500 req/s
                improvement: (Math.random() * 30 + 10).toFixed(2) // 10-40% improvement
            };
            
            setBenchmarkResults(benchmarks);
            setActiveStep(2);
        } catch (error) {
            console.error('Error testing combined performance:', error);
            alert('Error testing combined model performance');
        } finally {
            setLoading(false);
        }
    };
    
    // Deploy fused model
    const deployFusedModel = async () => {
        if (!fusedModelDetails.name || !fusedModelDetails.description || !fusedModelDetails.price) {
            alert('Please fill in all required fields');
            return;
        }
        
        setLoading(true);
        try {
            // Purchase all component models if not already owned
            for (const model of selectedModels) {
                if (!model.owned) {
                    await purchaseModel(model.id);
                }
            }
            
            // Create the fused model metadata
            const fusedModelMetadata = {
                name: fusedModelDetails.name,
                description: fusedModelDetails.description,
                componentModels: selectedModels.map(m => ({
                    id: m.id,
                    name: m.name,
                    owner: m.owner
                })),
                connectionConfig,
                benchmarks: benchmarkResults,
                createdAt: new Date().toISOString(),
                creator: account
            };
            
            // Deploy the fused model
            const deploymentResult = await deployModel({
                ...fusedModelMetadata,
                price: ethers.utils.parseEther(fusedModelDetails.price),
                owner: account
            });
            
            const apiKey = await generateApiKey(deploymentResult.modelId);
            alert('Fused model deployed successfully! API Key: ' + apiKey);
            setActiveStep(3);
        } catch (error) {
            console.error('Error deploying fused model:', error);
            alert('Error deploying fused model');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle model selection
    const toggleModelSelection = (model) => {
        if (selectedModels.some(m => m.id === model.id)) {
            setSelectedModels(selectedModels.filter(m => m.id !== model.id));
        } else {
            setSelectedModels([...selectedModels, model]);
        }
    };
    
    // Render step content based on active step
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Discover Compatible Models
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Select two or more AI models to combine into a more powerful composite system.
                            Our AI-powered recommendation system will identify compatibility and suggest optimal connection points.
                        </Typography>
                        
                        {/* Search and filter */}
                        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                            <TextField
                                label="Search Models"
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Model Type</InputLabel>
                                <Select
                                    value={modelType}
                                    onChange={(e) => setModelType(e.target.value)}
                                    label="Model Type"
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {Object.entries(MODEL_TYPES).map(([key, value]) => (
                                        <MenuItem key={key} value={value}>{value}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        
                        {/* Selected models */}
                        {selectedModels.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Selected Models ({selectedModels.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedModels.map(model => (
                                        <Chip 
                                            key={model.id}
                                            label={model.name}
                                            onDelete={() => toggleModelSelection(model)}
                                            color="primary"
                                        />
                                    ))}
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={checkCompatibility}
                                    disabled={selectedModels.length < 2 || loading}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Check Compatibility'}
                                </Button>
                            </Box>
                        )}
                        
                        {/* Available models */}
                        <Typography variant="subtitle1" gutterBottom>
                            Available Models
                        </Typography>
                        {loadingModels ? (
                            <CircularProgress />
                        ) : (
                            <Grid container spacing={2}>
                                {filteredModels.map(model => (
                                    <Grid item xs={12} sm={6} md={4} key={model.id}>
                                        <Card 
                                            sx={{ 
                                                cursor: 'pointer',
                                                border: selectedModels.some(m => m.id === model.id) ? 
                                                    '2px solid #1976d2' : 'none'
                                            }}
                                            onClick={() => toggleModelSelection(model)}
                                        >
                                            <CardContent>
                                                <Typography variant="h6">{model.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {model.modelType}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {model.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                {filteredModels.length === 0 && (
                                    <Box sx={{ p: 2, width: '100%' }}>
                                        <Typography>No models found matching your criteria</Typography>
                                    </Box>
                                )}
                            </Grid>
                        )}
                    </Box>
                );
                
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Configure Connection Points
                        </Typography>
                        
                        {compatibilityResults && (
                            <>
                                <Alert 
                                    severity={compatibilityResults.isCompatible ? "success" : "warning"}
                                    sx={{ mb: 3 }}
                                >
                                    <Typography variant="subtitle1">
                                        Compatibility Score: {compatibilityResults.score.toFixed(2)}%
                                    </Typography>
                                    <Typography variant="body2">
                                        {compatibilityResults.recommendations}
                                    </Typography>
                                </Alert>
                                
                                <Typography variant="subtitle1" gutterBottom>
                                    Selected Models
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {selectedModels.map(model => (
                                        <Grid item xs={12} sm={6} key={model.id}>
                                            <Card>
                                                <CardContent>
                                                    <Typography variant="h6">{model.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {model.modelType}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                                
                                <Divider sx={{ my: 3 }} />
                                
                                <Typography variant="subtitle1" gutterBottom>
                                    Connection Points
                                </Typography>
                                {compatibilityResults.connectionPoints.map(connection => (
                                    <Card key={connection.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6">
                                                {connection.name}
                                                <Chip 
                                                    label={`${connection.compatibility}% Compatible`}
                                                    color={connection.compatibility > 80 ? "success" : "warning"}
                                                    size="small"
                                                    sx={{ ml: 2 }}
                                                />
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                {connection.description}
                                            </Typography>
                                            
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <InputLabel>Connection Type</InputLabel>
                                                <Select
                                                    value={connectionConfig[connection.id]?.type || ''}
                                                    onChange={(e) => configureConnections(connection.id, {
                                                        ...connectionConfig[connection.id],
                                                        type: e.target.value
                                                    })}
                                                >
                                                    <MenuItem value="direct">Direct Connection</MenuItem>
                                                    <MenuItem value="adapter">With Adapter Layer</MenuItem>
                                                    <MenuItem value="transformer">With Transformer</MenuItem>
                                                </Select>
                                            </FormControl>
                                            
                                            <TextField
                                                label="Custom Parameters (JSON)"
                                                multiline
                                                rows={2}
                                                fullWidth
                                                value={connectionConfig[connection.id]?.params || ''}
                                                onChange={(e) => configureConnections(connection.id, {
                                                    ...connectionConfig[connection.id],
                                                    params: e.target.value
                                                })}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                <Button
                                    variant="contained"
                                    onClick={testCombinedPerformance}
                                    disabled={loading || Object.keys(connectionConfig).length === 0}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Test Combined Performance'}
                                </Button>
                            </>
                        )}
                    </Box>
                );
                
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Test Combined Performance
                        </Typography>
                        
                        {benchmarkResults && (
                            <>
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1">
                                        Performance Improvement: +{benchmarkResults.improvement}%
                                    </Typography>
                                    <Typography variant="body2">
                                        The combined model performs better than individual components!
                                    </Typography>
                                </Alert>
                                
                                <Card sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Benchmark Results</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="subtitle1">Accuracy</Typography>
                                                <Typography variant="h5">{benchmarkResults.accuracy}%</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="subtitle1">Latency</Typography>
                                                <Typography variant="h5">{benchmarkResults.latency}ms</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="subtitle1">Throughput</Typography>
                                                <Typography variant="h5">{benchmarkResults.throughput}/s</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Typography variant="subtitle1">Improvement</Typography>
                                                <Typography variant="h5">+{benchmarkResults.improvement}%</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                                
                                <Typography variant="subtitle1" gutterBottom>
                                    Deploy as New Entity
                                </Typography>
                                <TextField
                                    label="Fused Model Name"
                                    fullWidth
                                    value={fusedModelDetails.name}
                                    onChange={(e) => setFusedModelDetails({
                                        ...fusedModelDetails,
                                        name: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={fusedModelDetails.description}
                                    onChange={(e) => setFusedModelDetails({
                                        ...fusedModelDetails,
                                        description: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Price (JOY tokens)"
                                    fullWidth
                                    type="number"
                                    value={fusedModelDetails.price}
                                    onChange={(e) => setFusedModelDetails({
                                        ...fusedModelDetails,
                                        price: e.target.value
                                    })}
                                    sx={{ mb: 2 }}
                                />
                                
                                <Button
                                    variant="contained"
                                    onClick={deployFusedModel}
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Deploy Fused Model'}
                                </Button>
                            </>
                        )}
                    </Box>
                );
                
            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Fused Model Successfully Deployed!
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Your composite AI model has been deployed and is now available in the marketplace.
                            Proper attribution and royalty distribution has been set up for all component creators.
                        </Typography>
                        <Typography variant="subtitle1" paragraph>
                            Model Name: {fusedModelDetails.name}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => window.location.href = '/models'}
                        >
                            View in Marketplace
                        </Button>
                    </Box>
                );
                
            default:
                return <Typography>Unknown step</Typography>;
        }
    };
    
    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h4" gutterBottom>
                Model Fusion Engine
            </Typography>
            <Typography variant="body1" paragraph>
                Combine complementary AI models to create powerful composite systems with enhanced capabilities.
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            
            <Box sx={{ mt: 4 }}>
                {renderStepContent()}
            </Box>
        </Box>
    );
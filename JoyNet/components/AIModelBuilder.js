import { useState, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { 
    Box, 
    Stepper, 
    Step, 
    StepLabel, 
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
    LinearProgress
} from '@mui/material';
import { ethers } from 'ethers';
import { useModelMarketplace } from '../hooks/useModelMarketplace';
import { usePurchaseModel } from '../hooks/usePurchaseModel';
import { MODEL_TYPES, STORAGE_TYPES, LICENSE_TYPES } from '../utils/constants';
import { deployModel } from '../utils/deployment';
import { generateApiKey } from '../utils/api';
import { getAIRecommendation } from '../utils/ai';

const steps = [
    'Project Requirements',
    'Model Selection',
    'Dataset Configuration',
    'Algorithm Selection',
    'Compute Settings',
    'Storage Configuration',
    'License Selection',
    'Deployment',
    'UI Integration'
];

export default function AIModelBuilder() {
    const { account, library } = useWeb3React();
    const { getAvailableModels } = useModelMarketplace();
    const { purchaseModel } = usePurchaseModel();
    
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    
    const [projectData, setProjectData] = useState({
        requirements: '',
        selectedModel: null,
        selectedDataset: null,
        selectedAlgorithm: null,
        computeConfig: {
            cpu: 1,
            memory: 2,
            gpu: false
        },
        storageType: STORAGE_TYPES.IPFS,
        licenseType: LICENSE_TYPES.SINGLE_USE,
        uiTemplate: null
    });

    const [recommendations, setRecommendations] = useState({
        models: [],
        datasets: [],
        algorithms: [],
        uiTemplates: []
    });

    const getRecommendations = async (requirements) => {
        setLoading(true);
        try {
            const aiRecs = await getAIRecommendation(requirements);
            setRecommendations(aiRecs);
            setAiResponse(aiRecs.explanation);
        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            alert('Error getting recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleRequirementsSubmit = async () => {
        if (projectData.requirements) {
            await getRecommendations(projectData.requirements);
            setActiveStep(1);
        }
    };

    const handleModelSelect = async (model) => {
        setProjectData(prev => ({
            ...prev,
            selectedModel: model
        }));
        setActiveStep(2);
    };

    const handleDatasetSelect = (dataset) => {
        setProjectData(prev => ({
            ...prev,
            selectedDataset: dataset
        }));
        setActiveStep(3);
    };

    const handleAlgorithmSelect = (algorithm) => {
        setProjectData(prev => ({
            ...prev,
            selectedAlgorithm: algorithm
        }));
        setActiveStep(4);
    };

    const handleComputeConfig = (config) => {
        setProjectData(prev => ({
            ...prev,
            computeConfig: config
        }));
        setActiveStep(5);
    };

    const handleStorageSelect = (storageType) => {
        setProjectData(prev => ({
            ...prev,
            storageType
        }));
        setActiveStep(6);
    };

    const handleLicenseSelect = (licenseType) => {
        setProjectData(prev => ({
            ...prev,
            licenseType
        }));
        setActiveStep(7);
    };

    const handleDeploy = async () => {
        setLoading(true);
        try {
            if (projectData.selectedModel) {
                await purchaseModel(projectData.selectedModel.id);
            }

            const deploymentResult = await deployModel({
                ...projectData,
                owner: account
            });

            const apiKey = await generateApiKey(deploymentResult.modelId);
            alert('Model deployed successfully! API Key: ' + apiKey);
            setActiveStep(8);
        } catch (error) {
            console.error('Error deploying model:', error);
            alert('Error deploying model');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Tell me about your AI project
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="What would you like to build?"
                            value={projectData.requirements}
                            onChange={(e) => setProjectData(prev => ({
                                ...prev,
                                requirements: e.target.value
                            }))}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleRequirementsSubmit}
                            disabled={!projectData.requirements || loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Get AI Recommendations'}
                        </Button>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Recommended Models
                        </Typography>
                        {aiResponse && (
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {aiResponse}
                            </Typography>
                        )}
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {recommendations.models.map((model) => (
                                <Card key={model.id}>
                                    <CardContent>
                                        <Typography variant="h6">{model.name}</Typography>
                                        <Typography variant="body2">{model.description}</Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleModelSelect(model)}
                                            sx={{ mt: 2 }}
                                        >
                                            Select Model
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Configure Dataset
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {recommendations.datasets.map((dataset) => (
                                <Card key={dataset.id}>
                                    <CardContent>
                                        <Typography variant="h6">{dataset.name}</Typography>
                                        <Typography variant="body2">{dataset.description}</Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleDatasetSelect(dataset)}
                                            sx={{ mt: 2 }}
                                        >
                                            Select Dataset
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select Algorithm
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {recommendations.algorithms.map((algorithm) => (
                                <Card key={algorithm.id}>
                                    <CardContent>
                                        <Typography variant="h6">{algorithm.name}</Typography>
                                        <Typography variant="body2">{algorithm.description}</Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleAlgorithmSelect(algorithm)}
                                            sx={{ mt: 2 }}
                                        >
                                            Select Algorithm
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Configure Compute Resources
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <TextField
                                type="number"
                                label="CPU Cores"
                                value={projectData.computeConfig.cpu}
                                onChange={(e) => handleComputeConfig({
                                    ...projectData.computeConfig,
                                    cpu: parseInt(e.target.value)
                                })}
                            />
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <TextField
                                type="number"
                                label="Memory (GB)"
                                value={projectData.computeConfig.memory}
                                onChange={(e) => handleComputeConfig({
                                    ...projectData.computeConfig,
                                    memory: parseInt(e.target.value)
                                })}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>GPU Support</InputLabel>
                            <Select
                                value={projectData.computeConfig.gpu}
                                onChange={(e) => handleComputeConfig({
                                    ...projectData.computeConfig,
                                    gpu: e.target.value
                                })}
                            >
                                <MenuItem value={false}>No GPU</MenuItem>
                                <MenuItem value={true}>With GPU</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                );

            case 5:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select Storage Type
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Storage Type</InputLabel>
                            <Select
                                value={projectData.storageType}
                                onChange={(e) => handleStorageSelect(e.target.value)}
                            >
                                {Object.entries(STORAGE_TYPES).map(([key, value]) => (
                                    <MenuItem key={key} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );

            case 6:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select License Type
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>License Type</InputLabel>
                            <Select
                                value={projectData.licenseType}
                                onChange={(e) => handleLicenseSelect(e.target.value)}
                            >
                                {Object.entries(LICENSE_TYPES).map(([key, value]) => (
                                    <MenuItem key={key} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );

            case 7:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Deploy Your Model
                        </Typography>
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Configuration Summary</Typography>
                                <Typography>Model: {projectData.selectedModel?.name}</Typography>
                                <Typography>Dataset: {projectData.selectedDataset?.name}</Typography>
                                <Typography>Algorithm: {projectData.selectedAlgorithm?.name}</Typography>
                                <Typography>Storage: {projectData.storageType}</Typography>
                                <Typography>License: {projectData.licenseType}</Typography>
                            </CardContent>
                        </Card>
                        <Button
                            variant="contained"
                            onClick={handleDeploy}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Deploy Model'}
                        </Button>
                    </Box>
                );

            case 8:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select UI Template
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {recommendations.uiTemplates.map((template) => (
                                <Card key={template.id}>
                                    <CardContent>
                                        <Typography variant="h6">{template.name}</Typography>
                                        <Typography variant="body2">{template.description}</Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => window.location.href = template.url}
                                            sx={{ mt: 2 }}
                                        >
                                            Use Template
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                );

            default:
                return <Typography>Step content not implemented</Typography>;
        }
    };

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 4 }}>
                {renderStepContent(activeStep)}
            </Box>
        </Box>
    );
}
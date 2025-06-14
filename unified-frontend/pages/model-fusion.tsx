import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper
} from '@mui/material';
import { useWallet } from '../hooks/useWallet';
import { useAIAssistant } from '../hooks/useAIAssistant';
import Layout from '../components/layout/Layout';
import ModelListFilters from '../components/ModelListFilters';
import ModelCard from '../components/ModelCard';
import AIAssistantPanel from '../components/AIAssistantPanel';
import { ModelFusionEngine } from '../components/ModelFusionEngine';

const steps = [
  'Discover Compatible Models',
  'Configure Connection Points',
  'Test Combined Performance',
  'Deploy as New Entity'
];

export default function ModelFusionPage() {
  const { account } = useWallet();
  const { 
    getModelRecommendations, 
    getFusionSuggestions,
    getConnectionConfig,
    generateFusionName,
    logUserInteraction
  } = useAIAssistant();
  
  const [activeStep, setActiveStep] = useState(0);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({});
  const [fusedModelDetails, setFusedModelDetails] = useState({
    name: '',
    description: '',
    price: ''
  });

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        // This would be an API call to fetch models
        const response = await fetch('/api/models');
        const data = await response.json();
        setAvailableModels(data.models || []);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadModels();
  }, []);

  // Handle model selection
  const toggleModelSelection = (model) => {
    if (selectedModels.some(m => m.id === model.id)) {
      setSelectedModels(selectedModels.filter(m => m.id !== model.id));
      logUserInteraction('remove_model', { model_id: model.id });
    } else {
      setSelectedModels([...selectedModels, model]);
      logUserInteraction('add_model', { model_id: model.id });
    }
  };

  // Handle suggested models from AI Assistant
  const handleSuggestedModels = (suggestedModels) => {
    const newModels = suggestedModels.filter(
      model => !selectedModels.some(m => m.id === model.id)
    );
    
    if (newModels.length > 0) {
      setSelectedModels([...selectedModels, ...newModels]);
      logUserInteraction('add_suggested_models', { 
        model_ids: newModels.map(m => m.id) 
      });
    }
  };

  // Handle suggested connection configuration
  const handleSuggestedConfig = (config) => {
    setConnectionConfig(config);
    logUserInteraction('apply_connection_config', { config_applied: true });
  };

  // Handle generated model name
  const handleGeneratedName = (name) => {
    setFusedModelDetails({
      ...fusedModelDetails,
      name
    });
    logUserInteraction('apply_generated_name', { name });
  };

  // Check compatibility and proceed to next step
  const checkCompatibilityAndProceed = async () => {
    if (selectedModels.length < 2) {
      alert('Please select at least two models');
      return;
    }
    
    setLoading(true);
    try {
      // Get fusion suggestions to check compatibility
      const suggestions = await getFusionSuggestions({
        selectedModelIds: selectedModels.map(m => m.id)
      });
      
      if (suggestions && suggestions.length > 0) {
        // If compatible, proceed to next step
        setActiveStep(1);
        logUserInteraction('proceed_to_configuration', { 
          model_ids: selectedModels.map(m => m.id) 
        });
      } else {
        alert('Selected models may not be compatible. Please try different combinations.');
      }
    } catch (error) {
      console.error('Error checking compatibility:', error);
      alert('Error checking model compatibility');
    } finally {
      setLoading(false);
    }
  };

  // Test combined performance
  const testCombinedPerformance = async () => {
    if (Object.keys(connectionConfig).length === 0) {
      alert('Please configure connection points first');
      return;
    }
    
    setLoading(true);
    try {
      // This would be an API call to test the combined model
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveStep(2);
      logUserInteraction('test_performance', { 
        model_ids: selectedModels.map(m => m.id),
        connection_config: connectionConfig
      });
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
      // This would be an API call to deploy the fused model
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveStep(3);
      logUserInteraction('deploy_fused_model', { 
        model_ids: selectedModels.map(m => m.id),
        model_details: fusedModelDetails
      });
      
      alert('Fused model deployed successfully!');
    } catch (error) {
      console.error('Error deploying fused model:', error);
      alert('Error deploying fused model');
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <AIAssistantPanel
                selectedModels={selectedModels}
                onSuggestModels={handleSuggestedModels}
                onSuggestConfig={handleSuggestedConfig}
                onGenerateName={handleGeneratedName}
              />
              <ModelListFilters />
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Discover Compatible Models
                </Typography>
                <Typography variant="body1" paragraph>
                  Select two or more AI models to combine into a more powerful composite system.
                </Typography>
                
                {/* Selected models */}
                {selectedModels.length > 0 && (
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Models ({selectedModels.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedModels.map(model => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                          <ModelCard 
                            model={model} 
                            selected={true}
                            onSelect={() => toggleModelSelection(model)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Button
                      variant="contained"
                      onClick={checkCompatibilityAndProceed}
                      disabled={selectedModels.length < 2 || loading}
                      sx={{ mt: 2 }}
                    >
                      Check Compatibility & Continue
                    </Button>
                  </Paper>
                )}
                
                {/* Available models */}
                <Typography variant="subtitle1" gutterBottom>
                  Available Models
                </Typography>
                <Grid container spacing={2}>
                  {availableModels.map(model => (
                    <Grid item xs={12} sm={6} md={4} key={model.id}>
                      <ModelCard 
                        model={model} 
                        selected={selectedModels.some(m => m.id === model.id)}
                        onSelect={() => toggleModelSelection(model)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        );
        
      case 1:
      case 2:
      case 3:
        return (
          <ModelFusionEngine 
            activeStep={activeStep}
            selectedModels={selectedModels}
            connectionConfig={connectionConfig}
            setConnectionConfig={setConnectionConfig}
            fusedModelDetails={fusedModelDetails}
            setFusedModelDetails={setFusedModelDetails}
            onTestPerformance={testCombinedPerformance}
            onDeployModel={deployFusedModel}
          />
        );
        
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
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
      </Container>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TuneIcon from '@mui/icons-material/Tune';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useWallet } from '../hooks/useWallet';

interface AIAssistantPanelProps {
  selectedModels: any[];
  onSuggestModels: (suggestions: any[]) => void;
  onSuggestConfig: (config: any) => void;
  onGenerateName: (name: string) => void;
}

export default function AIAssistantPanel({
  selectedModels,
  onSuggestModels,
  onSuggestConfig,
  onGenerateName
}: AIAssistantPanelProps) {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [performancePriority, setPerformancePriority] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [fusionSuggestions, setFusionSuggestions] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Get model recommendations based on task description
  const getModelRecommendations = async () => {
    if (!taskDescription) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant/recommend-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: account,
          task_description: taskDescription,
          performance_priority: performancePriority || undefined
        }),
      });

      const data = await response.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error getting model recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get fusion suggestions based on selected models
  const getFusionSuggestions = async () => {
    if (selectedModels.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant/suggest-fusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_model_ids: selectedModels.map(model => model.id),
          task_description: taskDescription || undefined
        }),
      });

      const data = await response.json();
      if (data.success && data.suggestions) {
        setFusionSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error getting fusion suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get connection configuration suggestions
  const getConnectionSuggestions = async () => {
    if (selectedModels.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant/suggest-connection-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: selectedModels.map(model => model.id)
        }),
      });

      const data = await response.json();
      if (data.success && data.connection_config) {
        onSuggestConfig(data.connection_config);
      }
    } catch (error) {
      console.error('Error getting connection suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get fusion benefits explanation
  const getFusionBenefits = async () => {
    if (selectedModels.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant/explain-benefits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: selectedModels.map(model => model.id)
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBenefits(data);
      }
    } catch (error) {
      console.error('Error getting fusion benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate fusion model name
  const generateModelName = async () => {
    if (selectedModels.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-assistant/generate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: selectedModels.map(model => model.id)
        }),
      });

      const data = await response.json();
      if (data.success && data.name) {
        onGenerateName(data.name);
      }
    } catch (error) {
      console.error('Error generating model name:', error);
    } finally {
      setLoading(false);
    }
  };

  // Log user interaction
  const logInteraction = async (action: string, data: any) => {
    if (!account) return;
    
    try {
      await fetch('/api/ai-assistant/log-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: account,
          action,
          data
        }),
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  // Add a model from recommendations
  const addRecommendedModel = (model: any) => {
    onSuggestModels([model]);
    logInteraction('add_recommended_model', { model_id: model.id });
  };

  // Add suggested fusion models
  const addSuggestedFusion = (suggestion: any) => {
    const modelsToAdd = suggestion.models.filter(
      (model: any) => !selectedModels.some(m => m.id === model.id)
    );
    onSuggestModels(modelsToAdd);
    logInteraction('add_suggested_fusion', { 
      models: modelsToAdd.map((m: any) => m.id) 
    });
  };

  // Apply suggested configuration
  const applySuggestedConfig = () => {
    getConnectionSuggestions();
    logInteraction('apply_suggested_config', { 
      model_ids: selectedModels.map(model => model.id) 
    });
  };

  // Effect to update benefits when selected models change
  useEffect(() => {
    if (selectedModels.length >= 2) {
      getFusionBenefits();
    } else {
      setBenefits(null);
    }
  }, [selectedModels]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AutoAwesomeIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6">AI Assistant</Typography>
      </Box>

      <Accordion 
        expanded={expanded === 'panel1'} 
        onChange={handleChange('panel1')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography><LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Find Models</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Describe your task or requirements"
            fullWidth
            multiline
            rows={2}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Performance Priority</InputLabel>
            <Select
              value={performancePriority}
              onChange={(e) => setPerformancePriority(e.target.value)}
              label="Performance Priority"
            >
              <MenuItem value="">No specific priority</MenuItem>
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="speed">Speed</MenuItem>
              <MenuItem value="efficiency">Efficiency</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            onClick={getModelRecommendations}
            disabled={!taskDescription || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
          </Button>
          
          {recommendations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recommended Models
              </Typography>
              <List dense>
                {recommendations.slice(0, 5).map((model) => (
                  <ListItem 
                    key={model.id}
                    secondaryAction={
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => addRecommendedModel(model)}
                      >
                        Add
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <Chip 
                        label={`${model.relevance_score.toFixed(0)}%`} 
                        size="small" 
                        color={model.relevance_score > 80 ? "success" : "primary"}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={model.name} 
                      secondary={model.description?.substring(0, 60) + '...'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded === 'panel2'} 
        onChange={handleChange('panel2')}
        disabled={selectedModels.length === 0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography><TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Fusion Suggestions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Find complementary models to enhance your current selection.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={getFusionSuggestions}
            disabled={selectedModels.length === 0 || loading}
            fullWidth
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Get Fusion Suggestions'}
          </Button>
          
          {fusionSuggestions.length > 0 ? (
            <List dense>
              {fusionSuggestions.slice(0, 3).map((suggestion, index) => (
                <ListItem 
                  key={index}
                  alignItems="flex-start"
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => addSuggestedFusion(suggestion)}
                    >
                      Add
                    </Button>
                  }
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {suggestion.models[1].name}
                        </Typography>
                        <Chip 
                          label={`${suggestion.compatibility.score.toFixed(0)}%`} 
                          size="small" 
                          color={suggestion.compatibility.score > 80 ? "success" : "primary"}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={suggestion.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            selectedModels.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Click the button above to get fusion suggestions
              </Typography>
            )
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded === 'panel3'} 
        onChange={handleChange('panel3')}
        disabled={selectedModels.length < 2}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography><SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Fusion Benefits</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {benefits ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Estimated performance improvement: <strong>+{benefits.estimated_improvement.toFixed(1)}%</strong>
                </Typography>
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom>
                Key Benefits
              </Typography>
              <List dense>
                {benefits.benefits.map((benefit: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AutoAwesomeIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={benefit.name} 
                      secondary={benefit.description}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Combined Capabilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {benefits.capabilities.map((capability: string, index: number) => (
                  <Chip key={index} label={capability} size="small" />
                ))}
              </Box>
              
              <Button 
                variant="contained" 
                onClick={applySuggestedConfig}
                disabled={loading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Suggest Optimal Configuration'}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={generateModelName}
                disabled={loading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate Fusion Name'}
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select at least two models to see fusion benefits
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
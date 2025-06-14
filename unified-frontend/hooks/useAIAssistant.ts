import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';

interface ModelRecommendationParams {
  taskDescription?: string;
  modelType?: string;
  budgetLimit?: number;
  performancePriority?: string;
}

interface FusionSuggestionParams {
  selectedModelIds?: string[];
  taskDescription?: string;
}

export function useAIAssistant() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get model recommendations
  const getModelRecommendations = useCallback(async ({
    taskDescription,
    modelType,
    budgetLimit,
    performancePriority
  }: ModelRecommendationParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/recommend-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: account,
          task_description: taskDescription,
          model_type: modelType,
          budget_limit: budgetLimit,
          performance_priority: performancePriority
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.recommendations;
      } else {
        setError(data.message || 'Failed to get recommendations');
        return [];
      }
    } catch (error) {
      console.error('Error getting model recommendations:', error);
      setError('Error connecting to the server');
      return [];
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Get fusion suggestions
  const getFusionSuggestions = useCallback(async ({
    selectedModelIds,
    taskDescription
  }: FusionSuggestionParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/suggest-fusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_model_ids: selectedModelIds,
          task_description: taskDescription
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.suggestions;
      } else {
        setError(data.message || 'Failed to get fusion suggestions');
        return [];
      }
    } catch (error) {
      console.error('Error getting fusion suggestions:', error);
      setError('Error connecting to the server');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get connection configuration
  const getConnectionConfig = useCallback(async (modelIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/suggest-connection-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: modelIds
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.connection_config;
      } else {
        setError(data.message || 'Failed to get connection configuration');
        return null;
      }
    } catch (error) {
      console.error('Error getting connection configuration:', error);
      setError('Error connecting to the server');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get fusion benefits
  const getFusionBenefits = useCallback(async (modelIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/explain-benefits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: modelIds
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data;
      } else {
        setError(data.message || 'Failed to get fusion benefits');
        return null;
      }
    } catch (error) {
      console.error('Error getting fusion benefits:', error);
      setError('Error connecting to the server');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate fusion name
  const generateFusionName = useCallback(async (modelIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/generate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_ids: modelIds
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.name;
      } else {
        setError(data.message || 'Failed to generate fusion name');
        return null;
      }
    } catch (error) {
      console.error('Error generating fusion name:', error);
      setError('Error connecting to the server');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Store user preferences
  const storeUserPreferences = useCallback(async (preferences: any) => {
    if (!account) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: account,
          preferences
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error storing user preferences:', error);
      setError('Error connecting to the server');
      return false;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Log user interaction
  const logUserInteraction = useCallback(async (action: string, data: any) => {
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
  }, [account]);

  // Get admin insights
  const getAdminInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-assistant/admin/insights');
      const data = await response.json();
      
      if (data.success) {
        return data.insights;
      } else {
        setError(data.message || 'Failed to load insights');
        return null;
      }
    } catch (error) {
      console.error('Error fetching admin insights:', error);
      setError('Error connecting to the server');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getModelRecommendations,
    getFusionSuggestions,
    getConnectionConfig,
    getFusionBenefits,
    generateFusionName,
    storeUserPreferences,
    logUserInteraction,
    getAdminInsights
  };
}
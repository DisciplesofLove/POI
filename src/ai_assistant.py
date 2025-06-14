"""
AI Assistant for JoyNet platform - helps users and admins with model fusion and selection
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import logging
from .model_fusion import ModelFusion
from .model_marketplace import ModelMarketplace

class AIAssistant:
    def __init__(
        self,
        model_fusion: ModelFusion = None,
        marketplace: ModelMarketplace = None
    ):
        """Initialize the AI assistant with optional model fusion and marketplace instances."""
        self.model_fusion = model_fusion
        self.marketplace = marketplace
        self.user_preferences = {}
        self.session_history = []
        
    def set_model_fusion(self, model_fusion: ModelFusion):
        """Set the model fusion engine instance."""
        self.model_fusion = model_fusion
        
    def set_marketplace(self, marketplace: ModelMarketplace):
        """Set the marketplace instance."""
        self.marketplace = marketplace
        
    def store_user_preference(self, user_id: str, preference_data: Dict[str, Any]):
        """Store user preferences for better recommendations."""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {}
            
        # Update user preferences
        for key, value in preference_data.items():
            self.user_preferences[user_id][key] = value
            
    def recommend_models(
        self, 
        user_id: str = None, 
        task_description: str = None,
        model_type: str = None,
        budget_limit: float = None,
        performance_priority: str = None
    ) -> List[Dict[str, Any]]:
        """
        Recommend AI models based on user preferences and task description.
        
        Args:
            user_id: Optional user ID for personalized recommendations
            task_description: Description of the task to be performed
            model_type: Type of model needed (e.g., 'vision', 'language', 'multimodal')
            budget_limit: Maximum budget for model costs
            performance_priority: Priority metric ('accuracy', 'speed', 'efficiency')
            
        Returns:
            List of recommended models with relevance scores
        """
        if not self.marketplace:
            raise ValueError("Marketplace not initialized")
            
        # Get all available models
        all_models = self.marketplace.get_all_models()
        
        # Apply filters
        filtered_models = self._filter_models(all_models, model_type, budget_limit)
        
        # Score models based on task description and preferences
        scored_models = self._score_models(
            filtered_models, 
            task_description, 
            user_id, 
            performance_priority
        )
        
        # Sort by score and return top recommendations
        return sorted(scored_models, key=lambda x: x['relevance_score'], reverse=True)
        
    def _filter_models(
        self, 
        models: List[Dict[str, Any]], 
        model_type: str = None, 
        budget_limit: float = None
    ) -> List[Dict[str, Any]]:
        """Filter models based on type and budget constraints."""
        filtered = models
        
        if model_type:
            filtered = [
                model for model in filtered 
                if model.get('details', {}).get('model_architecture', '').lower().find(model_type.lower()) >= 0
            ]
            
        if budget_limit is not None:
            filtered = [
                model for model in filtered 
                if float(model.get('price', 0)) <= budget_limit
            ]
            
        return filtered
        
    def _score_models(
        self, 
        models: List[Dict[str, Any]], 
        task_description: str = None, 
        user_id: str = None,
        performance_priority: str = None
    ) -> List[Dict[str, Any]]:
        """Score models based on relevance to task and user preferences."""
        scored_models = []
        
        for model in models:
            # Base score
            score = 50.0
            
            # Task relevance scoring
            if task_description and 'description' in model:
                # Simple keyword matching (would use embeddings in production)
                task_words = set(task_description.lower().split())
                model_words = set(model['description'].lower().split())
                common_words = task_words.intersection(model_words)
                
                # Increase score based on word overlap
                score += len(common_words) * 5
                
            # User preference scoring
            if user_id and user_id in self.user_preferences:
                prefs = self.user_preferences[user_id]
                
                # Preferred model types
                if 'preferred_model_types' in prefs and 'details' in model:
                    model_type = model['details'].get('model_architecture', '').lower()
                    if any(pref.lower() in model_type for pref in prefs['preferred_model_types']):
                        score += 15
                
                # Previously used models
                if 'previously_used_models' in prefs and model['id'] in prefs['previously_used_models']:
                    score += 10
                    
            # Performance priority scoring
            if performance_priority and 'benchmarks' in model:
                benchmarks = model['benchmarks']
                if performance_priority == 'accuracy' and benchmarks.get('accuracy', 0) > 90:
                    score += 20
                elif performance_priority == 'speed' and benchmarks.get('latency', 1000) < 50:
                    score += 20
                elif performance_priority == 'efficiency' and benchmarks.get('efficiency_score', 0) > 80:
                    score += 20
            
            # Add to results with score
            model_copy = model.copy()
            model_copy['relevance_score'] = min(score, 100.0)  # Cap at 100
            scored_models.append(model_copy)
            
        return scored_models
        
    def suggest_fusion_combinations(
        self, 
        selected_model_ids: List[str] = None,
        task_description: str = None
    ) -> List[Dict[str, Any]]:
        """
        Suggest optimal model combinations for fusion based on selected models or task.
        
        Args:
            selected_model_ids: List of already selected model IDs
            task_description: Description of the task to be performed
            
        Returns:
            List of suggested model combinations with compatibility scores
        """
        if not self.marketplace:
            raise ValueError("Marketplace not initialized")
            
        all_models = self.marketplace.get_all_models()
        
        # If no models selected, recommend based on task
        if not selected_model_ids:
            if not task_description:
                return []
                
            # Get top models for the task
            top_models = self._score_models(all_models, task_description)[:5]
            selected_model_ids = [model['id'] for model in top_models]
        
        # Get model details
        selected_models = [
            model for model in all_models 
            if model['id'] in selected_model_ids
        ]
        
        # Find complementary models
        complementary_models = self._find_complementary_models(selected_models)
        
        # Generate fusion combinations
        combinations = []
        
        # For each selected model, suggest combinations with complementary models
        for model in selected_models:
            for comp_model in complementary_models:
                if model['id'] != comp_model['id'] and comp_model['id'] not in selected_model_ids:
                    # Check compatibility
                    compatibility = self._check_model_compatibility(model, comp_model)
                    
                    if compatibility['score'] > 60:
                        combinations.append({
                            'models': [model, comp_model],
                            'compatibility': compatibility,
                            'description': f"Combine {model['name']} with {comp_model['name']} for enhanced capabilities"
                        })
        
        # Sort by compatibility score
        return sorted(combinations, key=lambda x: x['compatibility']['score'], reverse=True)
        
    def _find_complementary_models(self, selected_models: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find models that would complement the selected models."""
        if not self.marketplace:
            return []
            
        all_models = self.marketplace.get_all_models()
        complementary = []
        
        # Extract model types from selected models
        selected_types = set()
        for model in selected_models:
            if 'details' in model and 'model_architecture' in model['details']:
                selected_types.add(model['details']['model_architecture'].lower())
        
        # Find models with complementary types
        for model in all_models:
            if model['id'] not in [m['id'] for m in selected_models]:
                model_type = model.get('details', {}).get('model_architecture', '').lower()
                
                # Check for complementary types
                is_complementary = False
                
                # Vision + Language combination
                if ('vision' in model_type and any('language' in t for t in selected_types)) or \
                   ('language' in model_type and any('vision' in t for t in selected_types)):
                    is_complementary = True
                    
                # Transformer + CNN combination
                if ('transformer' in model_type and any('cnn' in t for t in selected_types)) or \
                   ('cnn' in model_type and any('transformer' in t for t in selected_types)):
                    is_complementary = True
                    
                # Add other complementary combinations as needed
                
                if is_complementary:
                    complementary.append(model)
        
        return complementary
        
    def _check_model_compatibility(
        self, 
        model1: Dict[str, Any], 
        model2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check compatibility between two models."""
        # If model fusion engine is available, use it
        if self.model_fusion:
            try:
                return self.model_fusion.check_compatibility([model1['id'], model2['id']])
            except Exception as e:
                logging.error(f"Error checking compatibility with model fusion: {e}")
        
        # Fallback compatibility check
        compatibility_score = 50.0
        connection_points = []
        
        # Check model types for complementary capabilities
        model1_type = model1.get('details', {}).get('model_architecture', '').lower()
        model2_type = model2.get('details', {}).get('model_architecture', '').lower()
        
        # Check for vision + language combination
        if ('vision' in model1_type and 'language' in model2_type) or \
           ('language' in model1_type and 'vision' in model2_type):
            compatibility_score += 30.0
            connection_points.append({
                'name': 'Vision-Language Bridge',
                'description': 'Connect vision model outputs to language model inputs',
                'compatibility': 85
            })
            
        # Check for transformer + CNN combination
        if ('transformer' in model1_type and 'cnn' in model2_type) or \
           ('cnn' in model1_type and 'transformer' in model2_type):
            compatibility_score += 25.0
            connection_points.append({
                'name': 'Feature Extraction Pipeline',
                'description': 'Use CNN for feature extraction and transformer for processing',
                'compatibility': 80
            })
            
        # Add a generic connection point if none found
        if not connection_points:
            connection_points.append({
                'name': 'Custom Adapter',
                'description': 'Custom adapter layer to transform data between models',
                'compatibility': 60
            })
            
        # Normalize score to 0-100 range
        compatibility_score = min(max(compatibility_score, 0.0), 100.0)
        
        return {
            'score': compatibility_score,
            'is_compatible': compatibility_score > 60.0,
            'connection_points': connection_points,
            'recommendations': self._generate_compatibility_recommendation(compatibility_score)
        }
        
    def _generate_compatibility_recommendation(self, score: float) -> str:
        """Generate recommendations based on compatibility score."""
        if score > 80:
            return "These models are highly compatible and should work well together with minimal adaptation."
        elif score > 60:
            return "These models can work together with proper connection configuration."
        else:
            return "These models may not be fully compatible. Consider selecting different models or implementing custom adapters."
            
    def suggest_connection_config(
        self, 
        model_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Suggest optimal connection configuration for selected models.
        
        Args:
            model_ids: List of model IDs to connect
            
        Returns:
            Dictionary with suggested connection configuration
        """
        if not self.model_fusion:
            raise ValueError("Model fusion engine not initialized")
            
        # Check compatibility first
        compatibility = self.model_fusion.check_compatibility(model_ids)
        
        if not compatibility['is_compatible']:
            return {
                'success': False,
                'message': "Models are not compatible enough for automatic configuration",
                'compatibility': compatibility
            }
            
        # Generate connection configuration based on connection points
        connection_config = {}
        
        for point in compatibility['connection_points']:
            connection_type = 'direct' if point['compatibility'] > 80 else 'adapter'
            
            connection_config[point['name']] = {
                'type': connection_type,
                'params': self._generate_connection_params(point, model_ids),
                'compatibility': point['compatibility']
            }
            
        return {
            'success': True,
            'connection_config': connection_config,
            'compatibility': compatibility
        }
        
    def _generate_connection_params(
        self, 
        connection_point: Dict[str, Any],
        model_ids: List[str]
    ) -> Dict[str, Any]:
        """Generate connection parameters based on connection point and models."""
        # This would be more sophisticated in production
        # For now, return basic parameters
        
        if 'Vision-Language' in connection_point['name']:
            return {
                'vision_output_format': 'feature_vector',
                'language_input_format': 'embedding',
                'embedding_dim': 768,
                'normalization': True
            }
        elif 'Feature Extraction' in connection_point['name']:
            return {
                'feature_dim': 1024,
                'pooling': 'mean',
                'dropout': 0.1
            }
        else:
            return {
                'adapter_type': 'linear',
                'activation': 'relu'
            }
            
    def explain_fusion_benefits(
        self, 
        model_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Explain the benefits of fusing the selected models.
        
        Args:
            model_ids: List of model IDs to fuse
            
        Returns:
            Dictionary with explanation of benefits
        """
        if not self.marketplace:
            raise ValueError("Marketplace not initialized")
            
        # Get model details
        models = []
        for model_id in model_ids:
            try:
                model_info = self.marketplace.get_model_info(model_id)
                models.append(model_info)
            except Exception as e:
                logging.error(f"Error getting model info: {e}")
                
        if not models:
            return {
                'success': False,
                'message': "Could not retrieve model information"
            }
            
        # Generate benefits explanation
        capabilities = set()
        for model in models:
            model_type = model.get('details', {}).get('model_architecture', '').lower()
            
            if 'vision' in model_type:
                capabilities.add('visual understanding')
            if 'language' in model_type:
                capabilities.add('language processing')
            if 'transformer' in model_type:
                capabilities.add('contextual understanding')
            if 'cnn' in model_type:
                capabilities.add('feature extraction')
            # Add more capabilities as needed
            
        # Generate benefits based on capabilities
        benefits = []
        
        if 'visual understanding' in capabilities and 'language processing' in capabilities:
            benefits.append({
                'name': 'Multimodal Understanding',
                'description': 'Process and understand both visual and textual information simultaneously'
            })
            
        if 'contextual understanding' in capabilities and 'feature extraction' in capabilities:
            benefits.append({
                'name': 'Enhanced Feature Processing',
                'description': 'Extract rich features and process them with contextual awareness'
            })
            
        # Add more benefit combinations
        
        # If no specific benefits found, add generic benefit
        if not benefits:
            benefits.append({
                'name': 'Combined Capabilities',
                'description': 'Leverage the strengths of multiple models in a unified system'
            })
            
        # Estimate performance improvement
        estimated_improvement = np.random.uniform(15, 35)  # 15-35% improvement
        
        return {
            'success': True,
            'benefits': benefits,
            'capabilities': list(capabilities),
            'estimated_improvement': float(estimated_improvement),
            'recommendation': "These models can be effectively combined to create a more powerful AI system."
        }
        
    def generate_fusion_name(self, model_ids: List[str]) -> str:
        """Generate a creative name for the fused model."""
        if not self.marketplace:
            return "Fusion Model"
            
        # Get model names
        model_names = []
        for model_id in model_ids:
            try:
                model_info = self.marketplace.get_model_info(model_id)
                model_names.append(model_info.get('name', 'Model'))
            except Exception:
                model_names.append('Model')
                
        # Generate name based on model names
        if len(model_names) == 2:
            return f"{model_names[0]}-{model_names[1]} Fusion"
        else:
            return f"Multi-Model Fusion ({len(model_names)} models)"
            
    def log_user_interaction(self, user_id: str, action: str, data: Dict[str, Any]):
        """Log user interaction for improving recommendations."""
        self.session_history.append({
            'user_id': user_id,
            'action': action,
            'data': data,
            'timestamp': 'timestamp_placeholder'  # Would use actual timestamp in production
        })
        
    def get_admin_insights(self) -> Dict[str, Any]:
        """Get insights for admin users about fusion trends and usage."""
        # This would analyze actual usage data in production
        # For now, return simulated insights
        
        return {
            'popular_combinations': [
                {'models': ['Vision Transformer', 'GPT Language Model'], 'usage_count': 156},
                {'models': ['CNN Feature Extractor', 'Decision Transformer'], 'usage_count': 89},
                {'models': ['BERT Encoder', 'Diffusion Generator'], 'usage_count': 67}
            ],
            'success_rate': 78.5,  # Percentage of successful fusions
            'average_improvement': 24.3,  # Average performance improvement
            'user_satisfaction': 4.2,  # Out of 5
            'recommendations': [
                'Consider promoting Vision-Language model combinations',
                'Users are finding value in feature extraction + transformer combinations',
                'Provide more adapter templates for common combinations'
            ]
        }
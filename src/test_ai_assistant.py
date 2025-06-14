"""
Unit tests for the AI Assistant module
"""
import unittest
from unittest.mock import MagicMock, patch
import json
from .ai_assistant import AIAssistant

class TestAIAssistant(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures"""
        self.assistant = AIAssistant()
        
        # Mock model fusion and marketplace
        self.mock_fusion = MagicMock()
        self.mock_marketplace = MagicMock()
        
        self.assistant.set_model_fusion(self.mock_fusion)
        self.assistant.set_marketplace(self.mock_marketplace)
        
    def test_store_user_preference(self):
        """Test storing user preferences"""
        user_id = "test_user"
        preferences = {
            "preferred_model_types": ["vision", "language"],
            "budget_limit": 100
        }
        
        self.assistant.store_user_preference(user_id, preferences)
        
        self.assertIn(user_id, self.assistant.user_preferences)
        self.assertEqual(
            self.assistant.user_preferences[user_id]["preferred_model_types"],
            ["vision", "language"]
        )
        self.assertEqual(
            self.assistant.user_preferences[user_id]["budget_limit"],
            100
        )
        
    def test_recommend_models_no_marketplace(self):
        """Test recommend_models with no marketplace"""
        self.assistant.marketplace = None
        
        with self.assertRaises(ValueError):
            self.assistant.recommend_models(
                user_id="test_user",
                task_description="Test task"
            )
            
    def test_recommend_models(self):
        """Test model recommendations"""
        # Mock marketplace response
        mock_models = [
            {
                "id": "model1",
                "name": "Vision Model",
                "description": "A vision model for image recognition",
                "price": 50,
                "details": {
                    "model_architecture": "vision-transformer"
                }
            },
            {
                "id": "model2",
                "name": "Language Model",
                "description": "A language model for text processing",
                "price": 75,
                "details": {
                    "model_architecture": "language-transformer"
                }
            }
        ]
        
        self.mock_marketplace.get_all_models.return_value = mock_models
        
        # Test with task description
        results = self.assistant.recommend_models(
            task_description="I need a vision model for image recognition"
        )
        
        self.assertEqual(len(results), 2)
        self.assertTrue(results[0]["relevance_score"] >= results[1]["relevance_score"])
        
        # Test with model type filter
        results = self.assistant.recommend_models(
            model_type="vision"
        )
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "model1")
        
        # Test with budget limit
        results = self.assistant.recommend_models(
            budget_limit=60
        )
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "model1")
        
    def test_suggest_fusion_combinations(self):
        """Test fusion combination suggestions"""
        # Mock marketplace response
        mock_models = [
            {
                "id": "model1",
                "name": "Vision Model",
                "details": {
                    "model_architecture": "vision-cnn"
                }
            },
            {
                "id": "model2",
                "name": "Language Model",
                "details": {
                    "model_architecture": "language-transformer"
                }
            },
            {
                "id": "model3",
                "name": "Another Vision Model",
                "details": {
                    "model_architecture": "vision-transformer"
                }
            }
        ]
        
        self.mock_marketplace.get_all_models.return_value = mock_models
        
        # Test with selected model IDs
        results = self.assistant.suggest_fusion_combinations(
            selected_model_ids=["model1"]
        )
        
        self.assertTrue(len(results) > 0)
        
        # Test with no selected models but task description
        self.mock_marketplace.get_all_models.return_value = mock_models
        
        results = self.assistant.suggest_fusion_combinations(
            task_description="I need to process images and text"
        )
        
        self.assertTrue(len(results) > 0)
        
    def test_check_model_compatibility(self):
        """Test model compatibility checking"""
        model1 = {
            "id": "model1",
            "name": "Vision Model",
            "details": {
                "model_architecture": "vision-cnn"
            }
        }
        
        model2 = {
            "id": "model2",
            "name": "Language Model",
            "details": {
                "model_architecture": "language-transformer"
            }
        }
        
        # Test with model fusion available
        self.mock_fusion.check_compatibility.return_value = {
            "score": 85.0,
            "is_compatible": True,
            "connection_points": [
                {
                    "name": "Vision-Language Bridge",
                    "description": "Connect vision model outputs to language model inputs",
                    "compatibility": 85
                }
            ],
            "recommendations": "These models are highly compatible and should work well together with minimal adaptation."
        }
        
        result = self.assistant._check_model_compatibility(model1, model2)
        
        self.assertEqual(result["score"], 85.0)
        self.assertTrue(result["is_compatible"])
        
        # Test with model fusion unavailable (fallback)
        self.mock_fusion.check_compatibility.side_effect = Exception("Connection error")
        
        result = self.assistant._check_model_compatibility(model1, model2)
        
        self.assertTrue(result["score"] > 0)
        self.assertTrue(isinstance(result["is_compatible"], bool))
        self.assertTrue(len(result["connection_points"]) > 0)
        
    def test_suggest_connection_config(self):
        """Test connection configuration suggestions"""
        # Mock model fusion response
        self.mock_fusion.check_compatibility.return_value = {
            "score": 85.0,
            "is_compatible": True,
            "connection_points": [
                {
                    "name": "Vision-Language Bridge",
                    "description": "Connect vision model outputs to language model inputs",
                    "compatibility": 85
                }
            ],
            "recommendations": "These models are highly compatible and should work well together with minimal adaptation."
        }
        
        result = self.assistant.suggest_connection_config(["model1", "model2"])
        
        self.assertTrue(result["success"])
        self.assertIn("connection_config", result)
        self.assertIn("Vision-Language Bridge", result["connection_config"])
        
        # Test with incompatible models
        self.mock_fusion.check_compatibility.return_value = {
            "score": 40.0,
            "is_compatible": False,
            "connection_points": [],
            "recommendations": "These models may not be fully compatible."
        }
        
        result = self.assistant.suggest_connection_config(["model1", "model3"])
        
        self.assertFalse(result["success"])
        self.assertIn("message", result)
        
    def test_explain_fusion_benefits(self):
        """Test fusion benefits explanation"""
        # Mock marketplace responses
        self.mock_marketplace.get_model_info.side_effect = [
            {
                "id": "model1",
                "name": "Vision Model",
                "details": {
                    "model_architecture": "vision-cnn"
                }
            },
            {
                "id": "model2",
                "name": "Language Model",
                "details": {
                    "model_architecture": "language-transformer"
                }
            }
        ]
        
        result = self.assistant.explain_fusion_benefits(["model1", "model2"])
        
        self.assertTrue(result["success"])
        self.assertTrue(len(result["benefits"]) > 0)
        self.assertTrue(len(result["capabilities"]) > 0)
        self.assertTrue(result["estimated_improvement"] > 0)
        
    def test_generate_fusion_name(self):
        """Test fusion name generation"""
        # Mock marketplace responses
        self.mock_marketplace.get_model_info.side_effect = [
            {
                "id": "model1",
                "name": "Vision Model"
            },
            {
                "id": "model2",
                "name": "Language Model"
            }
        ]
        
        result = self.assistant.generate_fusion_name(["model1", "model2"])
        
        self.assertEqual(result, "Vision Model-Language Model Fusion")
        
        # Test with more than 2 models
        self.mock_marketplace.get_model_info.side_effect = [
            {"name": "Model A"},
            {"name": "Model B"},
            {"name": "Model C"}
        ]
        
        result = self.assistant.generate_fusion_name(["model1", "model2", "model3"])
        
        self.assertEqual(result, "Multi-Model Fusion (3 models)")
        
    def test_log_user_interaction(self):
        """Test logging user interactions"""
        user_id = "test_user"
        action = "select_model"
        data = {"model_id": "model1"}
        
        self.assistant.log_user_interaction(user_id, action, data)
        
        self.assertEqual(len(self.assistant.session_history), 1)
        self.assertEqual(self.assistant.session_history[0]["user_id"], user_id)
        self.assertEqual(self.assistant.session_history[0]["action"], action)
        self.assertEqual(self.assistant.session_history[0]["data"], data)
        
    def test_get_admin_insights(self):
        """Test getting admin insights"""
        insights = self.assistant.get_admin_insights()
        
        self.assertIn("popular_combinations", insights)
        self.assertIn("success_rate", insights)
        self.assertIn("average_improvement", insights)
        self.assertIn("user_satisfaction", insights)
        self.assertIn("recommendations", insights)

if __name__ == "__main__":
    unittest.main()
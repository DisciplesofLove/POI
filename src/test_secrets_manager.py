import unittest
from unittest.mock import patch, MagicMock
from utils.secrets_manager import SecretsManager
from utils.config_loader import ConfigLoader
import os
import yaml

class TestSecretsManager(unittest.TestCase):
    def setUp(self):
        self.mock_secret_value = {
            'edge_node_private_key': 'test_private_key',
            'marketplace_private_key': 'test_marketplace_key',
            'coordinator_contract_address': '0x123',
            'marketplace_contract_address': '0x456',
            'poi_contract_address': '0x789',
            'pou_contract_address': '0xabc'
        }

    @patch('boto3.session.Session')
    def test_get_secret(self, mock_session):
        # Setup mock
        mock_client = MagicMock()
        mock_session.return_value.client.return_value = mock_client
        mock_client.get_secret_value.return_value = {
            'SecretString': '{"test": "value"}'
        }

        # Test
        secrets_manager = SecretsManager()
        result = secrets_manager.get_secret('test-secret')

        # Assert
        self.assertEqual(result, {'test': 'value'})
        mock_client.get_secret_value.assert_called_once_with(SecretId='test-secret')

class TestConfigLoader(unittest.TestCase):
    def setUp(self):
        self.test_config = {
            'private_key': '${EDGE_NODE_KEY}',
            'marketplace_key': '${MARKETPLACE_KEY}',
            'addresses': {
                'coordinator': '${COORDINATOR_ADDRESS}',
                'marketplace': '${MARKETPLACE_ADDRESS}'
            }
        }
        
        self.mock_secrets = {
            'edge_node_private_key': 'test_private_key',
            'marketplace_private_key': 'test_marketplace_key',
            'coordinator_contract_address': '0x123',
            'marketplace_contract_address': '0x456'
        }

    @patch('utils.secrets_manager.get_secrets_manager')
    def test_config_replacement(self, mock_get_secrets):
        # Setup mock
        mock_secrets_manager = MagicMock()
        mock_secrets_manager.get_credentials.return_value = self.mock_secrets
        mock_get_secrets.return_value = mock_secrets_manager

        # Create temporary config file
        with open('test_config.yaml', 'w') as f:
            yaml.dump(self.test_config, f)

        try:
            # Test
            config_loader = ConfigLoader()
            result = config_loader.load_config('test_config.yaml')

            # Assert
            self.assertEqual(result['private_key'], 'test_private_key')
            self.assertEqual(result['marketplace_key'], 'test_marketplace_key')
            self.assertEqual(result['addresses']['coordinator'], '0x123')
            self.assertEqual(result['addresses']['marketplace'], '0x456')

        finally:
            # Cleanup
            os.remove('test_config.yaml')

if __name__ == '__main__':
    unittest.main()
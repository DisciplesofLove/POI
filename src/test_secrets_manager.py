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

    @patch('utils.crypto_vault.CryptoVault')
    def test_get_secret(self, mock_crypto_vault):
        # Setup mock
        mock_vault_instance = MagicMock()
        mock_crypto_vault.return_value = mock_vault_instance
        mock_vault_instance.retrieve_vault.return_value = (b'encrypted_data', b'salt')
        mock_vault_instance.decrypt_vault.return_value = {'test': 'value'}
        mock_vault_instance.verify_vault_integrity.return_value = True
        
        # Set environment variable for test
        os.environ['VAULT_PASSPHRASE'] = 'test_passphrase'
        
        # Test
        secrets_manager = SecretsManager()
        secrets_manager._cached_ipfs_hash = 'test_hash'
        result = secrets_manager.get_secret('test')
        
        # Assert
        self.assertEqual(result, 'value')
        mock_vault_instance.retrieve_vault.assert_called_once_with('test_hash')
        mock_vault_instance.decrypt_vault.assert_called_once_with(b'encrypted_data', 'test_passphrase', b'salt')
        
        # Clean up
        del os.environ['VAULT_PASSPHRASE']

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
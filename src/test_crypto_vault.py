import unittest
import os
from unittest.mock import patch, MagicMock
from utils.crypto_vault import CryptoVault

class TestCryptoVault(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        self.domain_name = "test.vault.joy"
        self.vault = CryptoVault(self.domain_name)
        self.test_secrets = {
            "api_key": "test123",
            "private_key": "abc123def456"
        }
        self.test_passphrase = "testpassphrase123"

    @patch('ipfsapi.connect')
    def test_encrypt_decrypt_vault(self, mock_ipfs):
        """Test that encryption and decryption work correctly."""
        # Encrypt data
        encrypted_data, salt = self.vault.encrypt_vault(self.test_secrets, self.test_passphrase)
        
        # Verify encrypted data is bytes and different from original
        self.assertIsInstance(encrypted_data, bytes)
        self.assertNotEqual(encrypted_data, str(self.test_secrets).encode())
        
        # Decrypt data
        decrypted_data = self.vault.decrypt_vault(encrypted_data, self.test_passphrase, salt)
        
        # Verify decrypted data matches original
        self.assertEqual(decrypted_data, self.test_secrets)

    @patch('ipfsapi.connect')
    @patch('iota_client.IotaClient')
    def test_store_retrieve_vault(self, mock_iota, mock_ipfs):
        """Test storing and retrieving vault from IPFS."""
        # Mock IPFS response
        test_ipfs_hash = "QmTest123"
        mock_ipfs_instance = MagicMock()
        mock_ipfs_instance.add_json.return_value = test_ipfs_hash
        mock_ipfs.return_value = mock_ipfs_instance
        
        # Mock IOTA client
        mock_iota_instance = MagicMock()
        mock_iota.return_value = mock_iota_instance
        
        # Encrypt and store data
        encrypted_data, salt = self.vault.encrypt_vault(self.test_secrets, self.test_passphrase)
        ipfs_hash = self.vault.store_vault(encrypted_data, salt)
        
        # Verify IPFS storage was called
        self.assertEqual(ipfs_hash, test_ipfs_hash)
        mock_ipfs_instance.add_json.assert_called_once()
        
        # Verify IOTA message was logged
        mock_iota_instance.message.assert_called_once()
        
        # Mock IPFS retrieval
        mock_ipfs_instance.get_json.return_value = {
            'encrypted_data': encrypted_data.hex(),
            'salt': salt.hex()
        }
        
        # Mock IOTA verification
        mock_iota_instance.find_messages.return_value = [{
            'domain': self.domain_name,
            'ipfs_hash': test_ipfs_hash
        }]
        
        # Test retrieval
        retrieved_data, retrieved_salt = self.vault.retrieve_vault(test_ipfs_hash)
        self.assertEqual(retrieved_data, encrypted_data)
        self.assertEqual(retrieved_salt, salt)

    @patch('ipfsapi.connect')
    @patch('iota_client.IotaClient')
    def test_vault_integrity_verification(self, mock_iota, mock_ipfs):
        """Test vault integrity verification."""
        test_ipfs_hash = "QmTest123"
        
        # Mock IOTA client with valid message
        mock_iota_instance = MagicMock()
        mock_iota_instance.find_messages.return_value = [{
            'domain': self.domain_name,
            'ipfs_hash': test_ipfs_hash
        }]
        mock_iota.return_value = mock_iota_instance
        
        # Mock IPFS with valid data
        mock_ipfs_instance = MagicMock()
        mock_ipfs_instance.get_json.return_value = {
            'encrypted_data': 'test',
            'salt': 'test'
        }
        mock_ipfs.return_value = mock_ipfs_instance
        
        # Test valid integrity check
        self.assertTrue(self.vault.verify_vault_integrity(test_ipfs_hash))
        
        # Test invalid integrity check (no IOTA message)
        mock_iota_instance.find_messages.return_value = []
        self.assertFalse(self.vault.verify_vault_integrity(test_ipfs_hash))
        
        # Test invalid integrity check (IPFS error)
        mock_iota_instance.find_messages.return_value = [{
            'domain': self.domain_name,
            'ipfs_hash': test_ipfs_hash
        }]
        mock_ipfs_instance.get_json.side_effect = Exception("IPFS error")
        self.assertFalse(self.vault.verify_vault_integrity(test_ipfs_hash))

if __name__ == '__main__':
    unittest.main()
import os
import json
from .crypto_vault import CryptoVault

class SecretsManager:
    def __init__(self, domain_name=None):
        """
        Initialize SecretsManager with a domain name for the crypto vault.
        
        Args:
            domain_name (str): Optional domain name for the vault. If not provided,
                             will use environment variable or default.
        """
        if domain_name is None:
            environment = os.getenv('ENVIRONMENT', 'development')
            domain_name = os.getenv('VAULT_DOMAIN', f'vault.{environment}.joy')
            
        self.vault = CryptoVault(domain_name)
        self._cached_secrets = None
        self._cached_ipfs_hash = None
        
    def get_secret(self, secret_name):
        """
        Retrieve a secret from the crypto vault.
        
        Args:
            secret_name (str): Name of the secret to retrieve
            
        Returns:
            dict: Dictionary containing the secret key/value pairs
            
        Raises:
            ValueError: If secret not found or vault access error
        """
        # Get passphrase from environment or secure input
        passphrase = os.getenv('VAULT_PASSPHRASE')
        if not passphrase:
            raise ValueError("VAULT_PASSPHRASE environment variable must be set")
            
        # Use cached secrets if available
        if self._cached_secrets is not None:
            return self._cached_secrets.get(secret_name)
            
        try:
            # Get latest vault hash from domain contract
            ipfs_hash = self._cached_ipfs_hash
            if not ipfs_hash:
                raise ValueError("No vault IPFS hash found - vault may need initialization")
                
            # Verify vault integrity
            if not self.vault.verify_vault_integrity(ipfs_hash):
                raise ValueError("Vault integrity check failed")
                
            # Retrieve and decrypt vault
            encrypted_data, salt = self.vault.retrieve_vault(ipfs_hash)
            self._cached_secrets = self.vault.decrypt_vault(encrypted_data, passphrase, salt)
            
            return self._cached_secrets.get(secret_name)
            
        except Exception as e:
            raise ValueError(f"Error retrieving secret: {str(e)}")

    def get_credentials(self):
        """
        Get credentials from the crypto vault based on environment.
        
        Returns:
            dict: Dictionary containing credentials
        """
        environment = os.getenv('ENVIRONMENT', 'development')
        secret_name = f'credentials.{environment}'
        return self.get_secret(secret_name)
        
    def store_secret(self, secret_name: str, secret_value: dict):
        """
        Store a secret in the crypto vault.
        
        Args:
            secret_name (str): Name of the secret
            secret_value (dict): Secret data to store
            
        Returns:
            str: IPFS hash of the updated vault
        """
        passphrase = os.getenv('VAULT_PASSPHRASE')
        if not passphrase:
            raise ValueError("VAULT_PASSPHRASE environment variable must be set")
            
        try:
            # Get existing secrets if any
            current_secrets = {}
            if self._cached_ipfs_hash:
                encrypted_data, salt = self.vault.retrieve_vault(self._cached_ipfs_hash)
                current_secrets = self.vault.decrypt_vault(encrypted_data, passphrase, salt)
                
            # Update with new secret
            current_secrets[secret_name] = secret_value
            
            # Encrypt and store updated vault
            encrypted_data, salt = self.vault.encrypt_vault(current_secrets, passphrase)
            ipfs_hash = self.vault.store_vault(encrypted_data, salt)
            
            # Update cache
            self._cached_secrets = current_secrets
            self._cached_ipfs_hash = ipfs_hash
            
            return ipfs_hash
            
        except Exception as e:
            raise ValueError(f"Error storing secret: {str(e)}")

# Global instance
_secrets_manager = None

def get_secrets_manager():
    """
    Get or create the global SecretsManager instance.
    
    Returns:
        SecretsManager: Global secrets manager instance
    """
    global _secrets_manager
    if _secrets_manager is None:
        domain = os.getenv('VAULT_DOMAIN')
        _secrets_manager = SecretsManager(domain)
    return _secrets_manager

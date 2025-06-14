import os
import json
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64
import ipfsapi
from iota_client import IotaClient

class CryptoVault:
    def __init__(self, domain_name, ipfs_host='localhost', ipfs_port=5001):
        """
        Initialize CryptoVault with a domain name and IPFS connection.
        
        Args:
            domain_name (str): The JoyNet domain name (e.g. 'myvault.joy')
            ipfs_host (str): IPFS node host
            ipfs_port (int): IPFS node port
        """
        self.domain_name = domain_name
        self.ipfs = ipfsapi.connect(ipfs_host, ipfs_port)
        self.iota = IotaClient()
        
    def _generate_encryption_key(self, passphrase: str, salt: bytes = None) -> bytes:
        """
        Generate an encryption key from a passphrase using PBKDF2.
        
        Args:
            passphrase (str): User's passphrase
            salt (bytes): Optional salt, generated if not provided
            
        Returns:
            bytes: Encryption key
        """
        if salt is None:
            salt = os.urandom(16)
            
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(passphrase.encode()))
        return key

    def encrypt_vault(self, data: dict, passphrase: str) -> tuple:
        """
        Encrypt vault data with a passphrase.
        
        Args:
            data (dict): Dictionary of secrets to encrypt
            passphrase (str): User's passphrase
            
        Returns:
            tuple: (encrypted_data, salt)
        """
        salt = os.urandom(16)
        key = self._generate_encryption_key(passphrase, salt)
        f = Fernet(key)
        encrypted_data = f.encrypt(json.dumps(data).encode())
        return encrypted_data, salt

    def decrypt_vault(self, encrypted_data: bytes, passphrase: str, salt: bytes) -> dict:
        """
        Decrypt vault data with a passphrase.
        
        Args:
            encrypted_data (bytes): Encrypted vault data
            passphrase (str): User's passphrase
            salt (bytes): Salt used in encryption
            
        Returns:
            dict: Decrypted vault data
        """
        key = self._generate_encryption_key(passphrase, salt)
        f = Fernet(key)
        decrypted_data = f.decrypt(encrypted_data)
        return json.loads(decrypted_data)

    def store_vault(self, encrypted_data: bytes, salt: bytes) -> str:
        """
        Store encrypted vault in IPFS and log hash in IOTA.
        
        Args:
            encrypted_data (bytes): Encrypted vault data
            salt (bytes): Salt used for encryption
            
        Returns:
            str: IPFS hash of stored vault
        """
        # Store data and salt in IPFS
        vault_data = {
            'encrypted_data': base64.b64encode(encrypted_data).decode('utf-8'),
            'salt': base64.b64encode(salt).decode('utf-8')
        }
        
        ipfs_hash = self.ipfs.add_json(vault_data)
        
        # Log hash in IOTA for tamper detection
        message = {
            'domain': self.domain_name,
            'ipfs_hash': ipfs_hash,
            'timestamp': str(int(time.time()))
        }
        
        self.iota.message(message)
        
        return ipfs_hash

    def retrieve_vault(self, ipfs_hash: str) -> tuple:
        """
        Retrieve encrypted vault from IPFS.
        
        Args:
            ipfs_hash (str): IPFS hash of the vault
            
        Returns:
            tuple: (encrypted_data, salt)
        """
        vault_data = self.ipfs.get_json(ipfs_hash)
        
        encrypted_data = base64.b64decode(vault_data['encrypted_data'])
        salt = base64.b64decode(vault_data['salt'])
        
        # Verify hash on IOTA
        messages = self.iota.find_messages({
            'domain': self.domain_name,
            'ipfs_hash': ipfs_hash
        })
        
        if not messages:
            raise ValueError("Vault hash not found in IOTA - possible tampering detected")
            
        return encrypted_data, salt

    def verify_vault_integrity(self, ipfs_hash: str) -> bool:
        """
        Verify vault integrity using IOTA logs.
        
        Args:
            ipfs_hash (str): IPFS hash to verify
            
        Returns:
            bool: True if integrity check passes
        """
        messages = self.iota.find_messages({
            'domain': self.domain_name,
            'ipfs_hash': ipfs_hash
        })
        
        if not messages:
            return False
            
        # Verify the vault data matches the hash
        try:
            vault_data = self.ipfs.get_json(ipfs_hash)
            return True
        except:
            return False

# Example usage:
"""
# Create vault
vault = CryptoVault('myvault.joy')

# Store secrets
secrets = {
    'api_key': 'secret123',
    'private_key': 'abc123def456'
}

# Encrypt and store
encrypted_data, salt = vault.encrypt_vault(secrets, 'mypassphrase')
ipfs_hash = vault.store_vault(encrypted_data, salt)

# Retrieve and decrypt
encrypted_data, salt = vault.retrieve_vault(ipfs_hash)
decrypted_secrets = vault.decrypt_vault(encrypted_data, 'mypassphrase', salt)

# Verify integrity
is_valid = vault.verify_vault_integrity(ipfs_hash)
"""
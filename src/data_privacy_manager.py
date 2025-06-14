import os
import json
import hashlib
import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import ipfs_utils

class DataPrivacyManager:
    """
    Manages data privacy, encryption, and secure sharing for user data
    """
    
    def __init__(self, ipfs_client=None):
        """Initialize the data privacy manager"""
        self.ipfs_client = ipfs_client or ipfs_utils.get_ipfs_client()
    
    def generate_key_pair(self):
        """Generate a new RSA key pair for a user"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        public_key = private_key.public_key()
        
        # Serialize private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Serialize public key
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return {
            'private_key': private_pem.decode('utf-8'),
            'public_key': public_pem.decode('utf-8')
        }
    
    def encrypt_data(self, data, public_key_pem):
        """Encrypt data using recipient's public key"""
        # Load the public key
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
        
        # Generate a random AES key
        aes_key = os.urandom(32)  # 256-bit key
        
        # Encrypt the AES key with the RSA public key
        encrypted_aes_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Generate a random IV
        iv = os.urandom(16)
        
        # Encrypt the data with AES
        cipher = Cipher(algorithms.AES(aes_key), modes.CFB(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        
        # Convert data to bytes if it's not already
        if isinstance(data, str):
            data = data.encode('utf-8')
        elif isinstance(data, dict) or isinstance(data, list):
            data = json.dumps(data).encode('utf-8')
        
        encrypted_data = encryptor.update(data) + encryptor.finalize()
        
        # Combine everything into a package
        result = {
            'encrypted_aes_key': base64.b64encode(encrypted_aes_key).decode('utf-8'),
            'iv': base64.b64encode(iv).decode('utf-8'),
            'encrypted_data': base64.b64encode(encrypted_data).decode('utf-8')
        }
        
        return result
    
    def decrypt_data(self, encrypted_package, private_key_pem):
        """Decrypt data using user's private key"""
        # Load the private key
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        
        # Decode the components
        encrypted_aes_key = base64.b64decode(encrypted_package['encrypted_aes_key'])
        iv = base64.b64decode(encrypted_package['iv'])
        encrypted_data = base64.b64decode(encrypted_package['encrypted_data'])
        
        # Decrypt the AES key
        aes_key = private_key.decrypt(
            encrypted_aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Decrypt the data
        cipher = Cipher(algorithms.AES(aes_key), modes.CFB(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        # Try to parse as JSON if possible
        try:
            return json.loads(decrypted_data.decode('utf-8'))
        except:
            return decrypted_data.decode('utf-8')
    
    def store_encrypted_data(self, data, public_key_pem):
        """Encrypt and store data on IPFS"""
        encrypted_package = self.encrypt_data(data, public_key_pem)
        
        # Store the encrypted package on IPFS
        ipfs_hash = self.ipfs_client.add_json(encrypted_package)
        
        return {
            'ipfs_hash': ipfs_hash,
            'data_hash': hashlib.sha256(json.dumps(data).encode('utf-8')).hexdigest()
        }
    
    def retrieve_and_decrypt_data(self, ipfs_hash, private_key_pem):
        """Retrieve encrypted data from IPFS and decrypt it"""
        # Get the encrypted package from IPFS
        encrypted_package = self.ipfs_client.get_json(ipfs_hash)
        
        # Decrypt the data
        return self.decrypt_data(encrypted_package, private_key_pem)
    
    def generate_data_sharing_token(self, data_id, recipient_public_key, expiration_time, private_key_pem):
        """Generate a token for sharing data with specific recipients"""
        token_data = {
            'data_id': data_id,
            'recipient': recipient_public_key[:64] + '...',  # Abbreviated for token
            'expiration': expiration_time,
            'timestamp': int(time.time())
        }
        
        # Sign the token
        token_json = json.dumps(token_data, sort_keys=True)
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        
        signature = private_key.sign(
            token_json.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        # Create the complete token
        complete_token = {
            'data': token_data,
            'signature': base64.b64encode(signature).decode('utf-8')
        }
        
        return complete_token
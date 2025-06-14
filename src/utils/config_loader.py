import os
import yaml
from .secrets_manager import get_secrets_manager

class ConfigLoader:
    def __init__(self):
        self.secrets_manager = get_secrets_manager()
        
    def _replace_env_vars(self, config_dict):
        """Replace environment variables in config with values from Secrets Manager."""
        credentials = self.secrets_manager.get_credentials()
        
        # Map of environment variables to secrets manager keys
        secret_mappings = {
            'EDGE_NODE_KEY': 'edge_node_private_key',
            'MARKETPLACE_KEY': 'marketplace_private_key',
            'COORDINATOR_ADDRESS': 'coordinator_contract_address',
            'MARKETPLACE_ADDRESS': 'marketplace_contract_address',
            'POI_ADDRESS': 'poi_contract_address',
            'POU_ADDRESS': 'pou_contract_address'
        }
        
        for key, value in config_dict.items():
            if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                env_var = value[2:-1]  # Remove ${ and }
                if env_var in secret_mappings and secret_mappings[env_var] in credentials:
                    config_dict[key] = credentials[secret_mappings[env_var]]
                else:
                    # Fallback to environment variable if not in secrets
                    config_dict[key] = os.getenv(env_var, value)
            elif isinstance(value, dict):
                self._replace_env_vars(value)
        return config_dict

    def load_config(self, config_path):
        """
        Load configuration from YAML file and replace variables with secrets.
        
        Args:
            config_path (str): Path to YAML configuration file
            
        Returns:
            dict: Configuration with secrets loaded
        """
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
            
        return self._replace_env_vars(config)
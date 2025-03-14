"""
Example script for running an edge computing node
"""
import os
import asyncio
import logging
from pathlib import Path
import yaml
from dotenv import load_dotenv

from src.edge_node import EdgeNode

async def main():
    load_dotenv()
    
    # Load config
    config_path = Path('config/node.yaml')
    with open(config_path) as f:
        config = yaml.safe_load(f)
        
    # Initialize edge node
    node = EdgeNode(
        config['private_key'],
        config['coordinator_address'],
        config['poi_address'],
        config['web3_provider'],
        config['host'],
        config['port']
    )
    
    # Configure logging
    logging.basicConfig(
        filename=config['log_file'],
        level=getattr(logging, config['log_level']),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print(f"Starting edge node...")
    print(f"Node address: {node.account.address}")
    print(f"Listening on: {config['host']}:{config['port']}")
    
    try:
        # Start node
        await node.start()
        
        # Keep running
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("Shutting down...")
        
    except Exception as e:
        logging.error(f"Node error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
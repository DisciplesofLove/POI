from iota_sdk import Client, Wallet
from iota_streams import Channel, Author, Subscriber
from typing import Dict, Any, Optional
import json

class IOTAInferenceHandler:
    def __init__(self, node_url: str, wallet_seed: str):
        self.client = Client(node_url)
        self.wallet = Wallet(wallet_seed)
        self.channels: Dict[str, Channel] = {}
        
    async def create_model_channel(self, model_id: str) -> str:
        """Create a new IOTA Streams channel for a model."""
        author = Author(self.client)
        channel = author.create_channel()
        self.channels[model_id] = channel
        return channel.id
        
    async def subscribe_to_model(self, model_id: str, channel_id: str) -> bool:
        """Subscribe to a model's IOTA Streams channel."""
        subscriber = Subscriber(self.client)
        channel = await subscriber.connect_to_channel(channel_id)
        self.channels[model_id] = channel
        return True
        
    async def request_inference(self, model_id: str, input_data: Dict[str, Any]) -> str:
        """Request inference through IOTA Streams."""
        channel = self.channels.get(model_id)
        if not channel:
            raise ValueError("Not subscribed to model channel")
            
        # Create message payload
        payload = {
            "type": "inference_request",
            "input": input_data,
            "timestamp": str(self.client.get_time())
        }
        
        # Send message through channel
        message = await channel.send_message(json.dumps(payload))
        return message.id
        
    async def receive_inference_result(self, model_id: str, message_id: str) -> Optional[Dict[str, Any]]:
        """Receive inference results through IOTA Streams."""
        channel = self.channels.get(model_id)
        if not channel:
            raise ValueError("Not subscribed to model channel")
            
        # Wait for and process result message
        message = await channel.receive_message(message_id)
        if message:
            payload = json.loads(message.payload)
            if payload["type"] == "inference_result":
                return payload["result"]
        return None
        
    async def verify_inference(self, model_id: str, message_id: str) -> bool:
        """Verify that an inference was performed through IOTA Streams."""
        channel = self.channels.get(model_id)
        if not channel:
            return False
            
        message = await channel.get_message(message_id)
        return message is not None
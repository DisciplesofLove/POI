"""
Message storage and AI analysis manager.
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional
import hashlib
from datetime import datetime, timedelta
import mimetypes
from pathlib import Path
import aioipfs
from cryptography.fernet import Fernet

from .webrtc_manager import Message
from ..ai.analyzer import ContentAnalyzer

logger = logging.getLogger(__name__)

class MessageManager:
    def __init__(self, ipfs_client, config: dict):
        self.ipfs = ipfs_client
        self.config = config
        self.encryption_key = Fernet.generate_key()
        self.fernet = Fernet(self.encryption_key)
        self.content_analyzer = ContentAnalyzer()
        self.messages: Dict[str, List[Message]] = {}  # channel_id -> messages
        
    async def store_message(self, channel_id: str, message: Message):
        """Store a message with optional file content in IPFS"""
        if not self.config["storage"]["message_retention"]["enabled"]:
            return
            
        try:
            # Encrypt message content if enabled
            if self.config["storage"]["message_retention"]["encryption"]:
                message.content = self.fernet.encrypt(message.content.encode()).decode()
                
            # Store message metadata
            message_data = message.__dict__
            message_hash = await self.ipfs.add_json(message_data)
            
            # Store in memory
            if channel_id not in self.messages:
                self.messages[channel_id] = []
            self.messages[channel_id].append(message)
            
            # Clean up old messages
            await self._cleanup_old_messages(channel_id)
            
            return message_hash
            
        except Exception as e:
            logger.error(f"Error storing message: {e}")
            raise
            
    async def store_file(self, file_path: str, metadata: dict = None) -> str:
        """Store a file in IPFS with metadata"""
        if not self.config["storage"]["ipfs"]["enabled"]:
            return None
            
        try:
            # Check file size
            file_size = Path(file_path).stat().st_size
            if file_size > self.config["storage"]["ipfs"]["max_file_size"]:
                raise ValueError(f"File too large: {file_size} bytes")
                
            # Check mime type
            mime_type = mimetypes.guess_type(file_path)[0]
            allowed = False
            for pattern in self.config["storage"]["ipfs"]["allowed_mime_types"]:
                if pattern.endswith("/*"):
                    if mime_type.startswith(pattern[:-1]):
                        allowed = True
                        break
                elif pattern == mime_type:
                    allowed = True
                    break
                    
            if not allowed:
                raise ValueError(f"Unsupported file type: {mime_type}")
                
            # Add file to IPFS
            ipfs_hash = await self.ipfs.add(file_path)
            
            # Pin file if enabled
            if self.config["storage"]["ipfs"]["pin_files"]:
                await self.ipfs.pin.add(ipfs_hash)
                
            # Store metadata
            if metadata:
                metadata.update({
                    "ipfs_hash": ipfs_hash,
                    "mime_type": mime_type,
                    "size": file_size,
                    "timestamp": datetime.now().isoformat()
                })
                await self.ipfs.add_json(metadata)
                
            return ipfs_hash
            
        except Exception as e:
            logger.error(f"Error storing file: {e}")
            raise
            
    async def analyze_content(self, content: str, content_type: str) -> dict:
        """Analyze content using AI if enabled and supported"""
        if not self.config["ai_analysis"]["enabled"]:
            return {}
            
        # Check if content type is supported
        supported = False
        for pattern in self.config["ai_analysis"]["supported_types"]:
            if pattern.endswith("/*"):
                if content_type.startswith(pattern[:-1]):
                    supported = True
                    break
            elif pattern == content_type:
                supported = True
                break
                
        if not supported:
            return {}
            
        try:
            analysis = {}
            features = self.config["ai_analysis"]["features"]
            
            if "content_moderation" in features:
                analysis["moderation"] = await self.content_analyzer.moderate_content(content, content_type)
                
            if "text_classification" in features and content_type.startswith("text/"):
                analysis["classification"] = await self.content_analyzer.classify_text(content)
                
            if "image_recognition" in features and content_type.startswith("image/"):
                analysis["recognition"] = await self.content_analyzer.analyze_image(content)
                
            if "document_analysis" in features and content_type == "application/pdf":
                analysis["document"] = await self.content_analyzer.analyze_document(content)
                
            if "sentiment_analysis" in features and content_type.startswith("text/"):
                analysis["sentiment"] = await self.content_analyzer.analyze_sentiment(content)
                
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing content: {e}")
            return {}
            
    async def get_messages(self, channel_id: str, start_time: Optional[datetime] = None,
                          end_time: Optional[datetime] = None) -> List[Message]:
        """Get messages for a channel with optional time range"""
        if channel_id not in self.messages:
            return []
            
        messages = self.messages[channel_id]
        
        if start_time:
            messages = [m for m in messages if datetime.fromtimestamp(m.timestamp) >= start_time]
            
        if end_time:
            messages = [m for m in messages if datetime.fromtimestamp(m.timestamp) <= end_time]
            
        # Decrypt if needed
        if self.config["storage"]["message_retention"]["encryption"]:
            for message in messages:
                try:
                    message.content = self.fernet.decrypt(message.content.encode()).decode()
                except Exception:
                    # Skip messages that can't be decrypted
                    continue
                    
        return messages
        
    async def _cleanup_old_messages(self, channel_id: str):
        """Remove messages older than the configured retention period"""
        if not self.config["storage"]["message_retention"]["enabled"]:
            return
            
        max_age = timedelta(days=self.config["storage"]["message_retention"]["max_age_days"])
        cutoff = datetime.now() - max_age
        
        if channel_id in self.messages:
            self.messages[channel_id] = [
                m for m in self.messages[channel_id]
                if datetime.fromtimestamp(m.timestamp) >= cutoff
            ]
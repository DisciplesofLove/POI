"""
AI-powered content analysis for messages and files.
"""
import logging
from typing import Dict, List, Optional
import json
from pathlib import Path
import aiohttp
import numpy as np
from PIL import Image
import io
import pytesseract
from transformers import pipeline

logger = logging.getLogger(__name__)

class ContentAnalyzer:
    def __init__(self):
        # Initialize AI models
        self.text_classifier = pipeline("text-classification")
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.image_classifier = pipeline("image-classification")
        self.document_analyzer = pipeline("document-question-answering")
        
        # Content moderation thresholds
        self.moderation_thresholds = {
            "toxicity": 0.8,
            "adult": 0.9,
            "violence": 0.8,
            "hate": 0.7
        }
        
    async def moderate_content(self, content: str, content_type: str) -> dict:
        """Check content for policy violations"""
        try:
            if content_type.startswith("text/"):
                return await self._moderate_text(content)
            elif content_type.startswith("image/"):
                return await self._moderate_image(content)
            else:
                return {"safe": True}
        except Exception as e:
            logger.error(f"Error in content moderation: {e}")
            return {"error": str(e)}
            
    async def classify_text(self, text: str) -> dict:
        """Classify text content"""
        try:
            result = self.text_classifier(text)
            return {
                "label": result[0]["label"],
                "confidence": result[0]["score"]
            }
        except Exception as e:
            logger.error(f"Error in text classification: {e}")
            return {"error": str(e)}
            
    async def analyze_sentiment(self, text: str) -> dict:
        """Analyze text sentiment"""
        try:
            result = self.sentiment_analyzer(text)
            return {
                "sentiment": result[0]["label"],
                "confidence": result[0]["score"]
            }
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return {"error": str(e)}
            
    async def analyze_image(self, image_data: bytes) -> dict:
        """Analyze image content"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Run image classification
            result = self.image_classifier(image)
            
            # Extract text from image
            text = pytesseract.image_to_string(image)
            
            return {
                "classification": {
                    "label": result[0]["label"],
                    "confidence": result[0]["score"]
                },
                "text_content": text if text.strip() else None
            }
        except Exception as e:
            logger.error(f"Error in image analysis: {e}")
            return {"error": str(e)}
            
    async def analyze_document(self, document_data: bytes) -> dict:
        """Analyze document content"""
        try:
            # Extract text from PDF
            text = self._extract_pdf_text(document_data)
            
            # Run document analysis
            analysis = self.document_analyzer(
                question="What is this document about?",
                context=text[:1000]  # Use first 1000 chars for summary
            )
            
            return {
                "summary": analysis["answer"],
                "confidence": analysis["score"],
                "text_content": text
            }
        except Exception as e:
            logger.error(f"Error in document analysis: {e}")
            return {"error": str(e)}
            
    async def _moderate_text(self, text: str) -> dict:
        """Check text content for policy violations"""
        try:
            # Use text classification for moderation
            results = self.text_classifier(text, candidate_labels=[
                "toxic", "adult", "violence", "hate", "safe"
            ])
            
            violations = []
            for result in results:
                if (result["label"] != "safe" and 
                    result["score"] > self.moderation_thresholds.get(result["label"], 0.8)):
                    violations.append({
                        "type": result["label"],
                        "confidence": result["score"]
                    })
                    
            return {
                "safe": len(violations) == 0,
                "violations": violations
            }
            
        except Exception as e:
            logger.error(f"Error in text moderation: {e}")
            return {"error": str(e)}
            
    async def _moderate_image(self, image_data: bytes) -> dict:
        """Check image content for policy violations"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Run image classification for moderation
            results = self.image_classifier(image, candidate_labels=[
                "explicit", "violence", "hate_symbol", "safe"
            ])
            
            violations = []
            for result in results:
                if (result["label"] != "safe" and 
                    result["score"] > self.moderation_thresholds.get(result["label"], 0.8)):
                    violations.append({
                        "type": result["label"],
                        "confidence": result["score"]
                    })
                    
            return {
                "safe": len(violations) == 0,
                "violations": violations
            }
            
        except Exception as e:
            logger.error(f"Error in image moderation: {e}")
            return {"error": str(e)}
            
    def _extract_pdf_text(self, pdf_data: bytes) -> str:
        """Extract text content from PDF document"""
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_data)) as pdf:
                return "\n".join(page.extract_text() for page in pdf.pages)
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            return ""
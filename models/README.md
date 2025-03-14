# Model Directory

This directory contains example AI models for testing the platform:

- example_cnn.pt: A simple CNN for image classification
- example_transformer.pt: A transformer model for text generation 

Models should be uploaded to IPFS when registering on the marketplace.

## Model Requirements

1. Models must be PyTorch format (.pt files)
2. Models must include metadata with:
   - Input shape
   - Output shape 
   - Framework version
   - Description
   
3. Models must be optimized for inference:
   - Quantized if possible
   - CUDA compatible
   - Batch size of 1
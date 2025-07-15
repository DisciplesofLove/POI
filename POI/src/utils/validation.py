"""Validation utilities for the POI system."""
import torch
from typing import Any, Optional

def validate_model_output(output: Any) -> Optional[str]:
    """Validate model output.
    
    Args:
        output: Model output to validate
        
    Returns:
        Error message if validation fails, None if valid
        
    This checks:
    - Output is a tensor
    - No NaN or infinite values
    - Tensor has valid shape/dtype
    """
    if not isinstance(output, torch.Tensor):
        return "Output must be a tensor"
        
    if torch.isnan(output).any():
        return "Output contains NaN values"
        
    if torch.isinf(output).any():
        return "Output contains infinite values"
        
    if not output.dtype in [torch.float32, torch.float64, torch.int32, torch.int64]:
        return f"Invalid output dtype: {output.dtype}"
        
    if len(output.shape) == 0:
        return "Output tensor must have at least one dimension"
        
    if output.numel() == 0:
        return "Output tensor cannot be empty"
        
    if output.numel() > 1e8:  # 100M elements
        return "Output tensor too large"
        
    return None
"""
Example AI models for testing
"""
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    """Simple CNN for image classification."""
    def __init__(self, num_classes: int = 1000):
        super().__init__()
        
        # Convolutional layers
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        
        # Fully connected layers
        self.classifier = nn.Sequential(
            nn.Linear(128 * 56 * 56, 512),
            nn.ReLU(),
            nn.Dropout(),
            nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

def save_example_models():
    """Save example models for testing."""
    # CNN model
    cnn = SimpleCNN()
    cnn.eval()
    torch.save(cnn, "models/example_cnn.pt")
    
    print("Example models saved successfully")
"""Constants used throughout the POI system."""

# Blockchain timeouts (seconds)
TRANSACTION_TIMEOUT = 120
BLOCK_CONFIRMATION_TIMEOUT = 60

# Model parameters
MIN_PROOF_SIZE = 32  # Minimum size of proof in bytes
MAX_PROOF_SIZE = 1024 * 1024  # Maximum size of proof (1MB)

# Network parameters
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Gas estimation safety margin (multiply by this factor)
GAS_ESTIMATE_MARGIN = 1.2
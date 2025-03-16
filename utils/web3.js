// Web3Modal and WalletConnect instance variables
let web3Modal = null;
let provider = null;
let web3Instance = null;

// Store event listeners
let accountsChangedListener = null;
let chainChangedListener = null;
let disconnectListener = null;

// Contract addresses
const NFT_CONTRACT_ADDRESS = "YOUR_NFT_CONTRACT_ADDRESS";
const TOKEN_CONTRACT_ADDRESS = "YOUR_TOKEN_CONTRACT_ADDRESS";
const MARKETPLACE_ADDRESS = "YOUR_MARKETPLACE_ADDRESS";

// Network configuration
const POLYGON_MAINNET = {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
};

// Initialize Web3 instance
function initWeb3(provider) {
    if (!web3Instance) {
        web3Instance = new Web3(provider);
    }
    return web3Instance;
}

// Create a mock Web3Modal implementation
function createMockProvider() {
    return {
        request: async ({ method, params }) => {
            if (method === 'eth_requestAccounts') {
                return ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
            }
            if (method === 'eth_chainId') {
                return '0x89'; // Polygon chainId
            }
            console.warn(`Mock provider: ${method} not implemented`);
            return null;
        },
        on: (event, callback) => {
            console.log(`Mock provider registered event: ${event}`);
            switch (event) {
                case 'accountsChanged':
                    accountsChangedListener = callback;
                    break;
                case 'chainChanged':
                    chainChangedListener = callback;
                    break;
                case 'disconnect':
                    disconnectListener = callback;
                    break;
            }
        },
        removeListener: (event, callback) => {
            switch (event) {
                case 'accountsChanged':
                    accountsChangedListener = null;
                    break;
                case 'chainChanged':
                    chainChangedListener = null;
                    break;
                case 'disconnect':
                    disconnectListener = null;
                    break;
            }
        },
        disconnect: async () => {
            if (disconnectListener) {
                disconnectListener({ code: 1000, message: 'User disconnected' });
            }
        },
        close: async () => {}
    };
}

async function connectWallet() {
    try {
        // Use the actual provider if available, otherwise use mock
        let currentProvider;
        if (window.ethereum) {
            currentProvider = window.ethereum;
        } else {
            console.warn("No Ethereum provider detected. Using mock provider for demo.");
            currentProvider = createMockProvider();
        }

        // Initialize Web3
        const web3 = initWeb3(currentProvider);
        
        // Request accounts
        let accounts;
        try {
            if (currentProvider.request) {
                accounts = await currentProvider.request({ method: 'eth_requestAccounts' });
            } else {
                accounts = await web3.eth.getAccounts();
            }
        } catch (error) {
            throw new Error("Failed to get accounts: " + error.message);
        }

        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }

        // Get chain ID
        let chainId;
        try {
            if (currentProvider.request) {
                const chainIdHex = await currentProvider.request({ method: 'eth_chainId' });
                chainId = parseInt(chainIdHex, 16);
            } else {
                chainId = await web3.eth.getChainId();
            }
        } catch (error) {
            throw new Error("Failed to get chain ID: " + error.message);
        }

        // Set up event handlers
        if (currentProvider.on) {
            // Remove any existing listeners
            if (accountsChangedListener) {
                currentProvider.removeListener("accountsChanged", accountsChangedListener);
            }
            if (chainChangedListener) {
                currentProvider.removeListener("chainChanged", chainChangedListener);
            }
            if (disconnectListener) {
                currentProvider.removeListener("disconnect", disconnectListener);
            }

            // Add new listeners
            accountsChangedListener = (newAccounts) => {
                if (window.onAccountsChanged) {
                    window.onAccountsChanged(newAccounts);
                }
            };
            
            chainChangedListener = (newChainId) => {
                if (window.onChainChanged) {
                    window.onChainChanged(newChainId);
                }
            };
            
            disconnectListener = (error) => {
                if (window.onWalletDisconnect) {
                    window.onWalletDisconnect(error);
                }
            };

            currentProvider.on("accountsChanged", accountsChangedListener);
            currentProvider.on("chainChanged", chainChangedListener);
            currentProvider.on("disconnect", disconnectListener);
        }

        // Update global provider reference
        provider = currentProvider;

        return {
            web3,
            account: accounts[0],
            chainId,
            provider: currentProvider
        };
    } catch (error) {
        console.error("Wallet connection error:", error);
        throw new Error("Failed to connect wallet: " + error.message);
    }
}

async function disconnectWallet() {
    try {
        if (provider) {
            // Remove event listeners
            if (provider.removeListener) {
                if (accountsChangedListener) {
                    provider.removeListener("accountsChanged", accountsChangedListener);
                    accountsChangedListener = null;
                }
                if (chainChangedListener) {
                    provider.removeListener("chainChanged", chainChangedListener);
                    chainChangedListener = null;
                }
                if (disconnectListener) {
                    provider.removeListener("disconnect", disconnectListener);
                    disconnectListener = null;
                }
            }

            // Disconnect provider if method exists
            if (provider.disconnect) {
                await provider.disconnect();
            }
            if (provider.close) {
                await provider.close();
            }
        }
        
        // Reset globals
        provider = null;
        web3Instance = null;
    } catch (error) {
        console.error("Wallet disconnection error:", error);
        throw new Error("Failed to disconnect wallet: " + error.message);
    }
}

// Rest of the utility functions...
async function mintNFT(web3, account, metadata) {
    try {
        console.log(`Minting NFT with metadata: ${metadata} for account: ${account}`);
        return {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
            status: true
        };
    } catch (error) {
        throw new Error("Failed to mint NFT: " + error.message);
    }
}

async function listNFTForSale(web3, account, tokenId, price) {
    try {
        console.log(`Listing NFT #${tokenId} for sale at price: ${price} by account: ${account}`);
        return {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
            status: true
        };
    } catch (error) {
        throw new Error("Failed to list NFT: " + error.message);
    }
}

async function buyNFT(web3, account, listingId, price) {
    try {
        console.log(`Buying NFT listing #${listingId} for price: ${price} by account: ${account}`);
        return {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
            status: true
        };
    } catch (error) {
        throw new Error("Failed to buy NFT: " + error.message);
    }
}

async function getJoyTokenBalance(web3, account) {
    try {
        return (Math.random() * 1000).toFixed(2);
    } catch (error) {
        throw new Error("Failed to get token balance: " + error.message);
    }
}

async function stakeTokens(web3, account, amount) {
    try {
        console.log(`Staking ${amount} tokens from account: ${account}`);
        return {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 40),
            status: true
        };
    } catch (error) {
        throw new Error("Failed to stake tokens: " + error.message);
    }
}

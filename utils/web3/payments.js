// Get Web3 instance
function getWeb3Instance() {
    if (!window.web3Instance) {
        throw new Error('Web3 not initialized');
    }
    return window.web3Instance;
}

// Convert MATIC amount to Wei
function toWei(amount) {
    const web3 = getWeb3Instance();
    return web3.utils.toWei(amount.toString(), 'ether');
}

// Convert Wei to MATIC amount
function fromWei(amount) {
    const web3 = getWeb3Instance();
    return web3.utils.fromWei(amount.toString(), 'ether');
}

// Send payment transaction
async function sendPayment(toAddress, amount) {
    try {
        const web3 = getWeb3Instance();
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        if (!fromAddress) {
            throw new Error('No wallet connected');
        }

        // Convert amount to Wei
        const amountInWei = toWei(amount);

        // Get gas price
        const gasPrice = await web3.eth.getGasPrice();
        
        // Estimate gas
        const gasEstimate = await web3.eth.estimateGas({
            from: fromAddress,
            to: toAddress,
            value: amountInWei
        });

        // Send transaction
        const transaction = await web3.eth.sendTransaction({
            from: fromAddress,
            to: toAddress,
            value: amountInWei,
            gas: Math.round(gasEstimate * 1.1), // Add 10% buffer
            gasPrice: gasPrice
        });

        return {
            success: true,
            transaction
        };
    } catch (error) {
        console.error('Payment failed:', error);
        throw error;
    }
}

// Check transaction status
async function checkTransactionStatus(txHash) {
    try {
        const web3 = getWeb3Instance();
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        return receipt;
    } catch (error) {
        console.error('Failed to check transaction status:', error);
        throw error;
    }
}

// Get wallet balance
async function getWalletBalance(address) {
    try {
        const web3 = getWeb3Instance();
        const balance = await web3.eth.getBalance(address);
        return fromWei(balance);
    } catch (error) {
        console.error('Failed to get wallet balance:', error);
        throw error;
    }
}

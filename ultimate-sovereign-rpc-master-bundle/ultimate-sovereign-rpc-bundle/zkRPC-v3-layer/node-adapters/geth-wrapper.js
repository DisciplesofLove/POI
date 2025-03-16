// Example: Geth RPC Wrapper - Adds zkProof to every response
const { generateProof } = require('./proofGenerator');

async function getBalance(address) {
    const result = await fetchGeth("eth_getBalance", [address, "latest"]);
    const proof = await generateProof("BalanceProof", result);
    return { result, proof };
}

async function fetchGeth(method, params) {
    const response = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 })
    });
    const { result } = await response.json();
    return result;
}
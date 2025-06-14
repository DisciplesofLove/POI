// Example Governance API - Trigger on-chain slash proposal
async function proposeSlash(nodeAddress) {
    const response = await fetch("https://governance.rpc-dao.com/proposeSlash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node: nodeAddress, reason: "Invalid zkRPC Proof" })
    });

    if (!response.ok) {
        console.error("Failed to propose slash:", await response.text());
    } else {
        console.log("Slash proposal submitted for", nodeAddress);
    }
}

module.exports = { proposeSlash };
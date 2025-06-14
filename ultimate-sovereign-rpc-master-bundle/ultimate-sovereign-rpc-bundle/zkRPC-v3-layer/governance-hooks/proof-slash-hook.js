// Governance Hook - Trigger slash vote if proof fails
const { proposeSlash } = require('./governanceAPI');

async function handleFailedProof(nodeAddress) {
    console.warn(`Proof failed for node ${nodeAddress}, triggering governance proposal`);
    await proposeSlash(nodeAddress);
}
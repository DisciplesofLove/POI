// Proof Generator - Calls circom to create zkProofs
const { exec } = require('child_process');

async function generateProof(circuit, data) {
    return new Promise((resolve, reject) => {
        exec(`./generate_proof ${circuit} ${data}`, (err, stdout, stderr) => {
            if (err) {
                return reject(`Proof generation failed: ${stderr}`);
            }
            resolve(stdout.trim());
        });
    });
}

module.exports = { generateProof };
// Transaction Inclusion Proof Circuit (Ethereum Tx Proof)
// Proves a transaction is in a block
pragma circom 2.0.0;

template TxProof() {
    signal input txHash;
    signal input blockTxRoot;
    signal input inclusionProof[256];  // Merkle proof

    component verifier = MerkleProof(256);
    verifier.leaf <== txHash;
    verifier.root <== blockTxRoot;
    verifier.proof <== inclusionProof;

    verifier.out === 1; // Proof must validate
}

component main = TxProof();
// Balance Proof Circuit (Ethereum State Proof)
// Proves an account balance directly from the state root
pragma circom 2.0.0;

template BalanceProof() {
    signal input balance;
    signal input stateRoot;
    signal input accountProof[256];  // Merkle proof

    component verifier = MerkleProof(256);
    verifier.leaf <== balance;
    verifier.root <== stateRoot;
    verifier.proof <== accountProof;

    verifier.out === 1; // Proof must validate
}

component main = BalanceProof();
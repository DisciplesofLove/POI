// Go Verifier Example - zkRPC Proof Verifier
package verifier

import (
    "encoding/json"
    "fmt"
    "os/exec"
)

type Proof struct {
    Type    string `json:"type"`
    Proof   string `json:"proof"`
    Root    string `json:"root"`
    Circuit string `json:"circuit"`
}

func VerifyProof(proofData []byte) (bool, error) {
    var proof Proof
    if err := json.Unmarshal(proofData, &proof); err != nil {
        return false, fmt.Errorf("invalid proof format: %v", err)
    }

    cmd := exec.Command("./circom_verifier", proof.Circuit, proof.Proof, proof.Root)
    output, err := cmd.CombinedOutput()
    if err != nil {
        return false, fmt.Errorf("verification failed: %s", output)
    }
    return string(output) == "VALID
", nil
}
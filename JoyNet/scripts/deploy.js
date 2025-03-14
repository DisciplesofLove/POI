const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy JoyToken
    const JoyToken = await ethers.getContractFactory("JoyToken");
    const initialSupply = ethers.utils.parseEther("1000000000"); // 1B tokens
    const joyToken = await JoyToken.deploy(initialSupply);
    await joyToken.deployed();
    console.log("JoyToken deployed to:", joyToken.address);

    // Deploy Identity
    const Identity = await ethers.getContractFactory("Identity");
    const identity = await Identity.deploy();
    await identity.deployed();
    console.log("Identity deployed to:", identity.address);

    // Deploy ZKVerifier
    const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
    const zkVerifier = await ZKVerifier.deploy();
    await zkVerifier.deployed();
    console.log("ZKVerifier deployed to:", zkVerifier.address);

    // Deploy ProofOfInference
    const ProofOfInference = await ethers.getContractFactory("ProofOfInference");
    const proofOfInference = await ProofOfInference.deploy(zkVerifier.address);
    await proofOfInference.deployed();
    console.log("ProofOfInference deployed to:", proofOfInference.address);

    // Deploy ModelMarketplace
    const ModelMarketplace = await ethers.getContractFactory("ModelMarketplace");
    const modelMarketplace = await ModelMarketplace.deploy(
        joyToken.address,
        proofOfInference.address,
        identity.address
    );
    await modelMarketplace.deployed();
    console.log("ModelMarketplace deployed to:", modelMarketplace.address);

    // Deploy NodeCoordinator
    const NodeCoordinator = await ethers.getContractFactory("NodeCoordinator");
    const nodeCoordinator = await NodeCoordinator.deploy(joyToken.address);
    await nodeCoordinator.deployed();
    console.log("NodeCoordinator deployed to:", nodeCoordinator.address);

    // Deploy SovereignRPC
    const SovereignRPC = await ethers.getContractFactory("SovereignRPC");
    const sovereignRPC = await SovereignRPC.deploy();
    await sovereignRPC.deployed();
    console.log("SovereignRPC deployed to:", sovereignRPC.address);

    // Update deployment addresses
    const addresses = {
        JoyToken: joyToken.address,
        Identity: identity.address,
        ZKVerifier: zkVerifier.address,
        ProofOfInference: proofOfInference.address,
        ModelMarketplace: modelMarketplace.address,
        NodeCoordinator: nodeCoordinator.address,
        SovereignRPC: sovereignRPC.address,
    };

    // Write addresses to file
    const addressesPath = path.join(__dirname, "../config/addresses.json");
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("Contract addresses written to:", addressesPath);

    // Write ABIs to files
    const contracts = {
        JoyToken,
        Identity,
        ZKVerifier,
        ProofOfInference,
        ModelMarketplace,
        NodeCoordinator,
        SovereignRPC,
    };

    for (const [name, contract] of Object.entries(contracts)) {
        const abiPath = path.join(__dirname, `../src/contracts/${name}.json`);
        const abi = {
            address: addresses[name],
            abi: contract.interface.format("json"),
        };
        fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
        console.log(`${name} ABI written to:`, abiPath);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
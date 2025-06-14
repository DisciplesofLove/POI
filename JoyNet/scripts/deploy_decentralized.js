const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy JoyToken
    console.log("\nDeploying JoyToken...");
    const JoyToken = await ethers.getContractFactory("JoyToken");
    const joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    console.log("JoyToken deployed to:", joyToken.address);

    // Deploy EnhancedSovereignRPC
    console.log("\nDeploying EnhancedSovereignRPC...");
    const EnhancedSovereignRPC = await ethers.getContractFactory("EnhancedSovereignRPC");
    const rpcContract = await EnhancedSovereignRPC.deploy(joyToken.address, deployer.address);
    await rpcContract.deployed();
    console.log("EnhancedSovereignRPC deployed to:", rpcContract.address);

    // Deploy NodeCoordinator
    console.log("\nDeploying NodeCoordinator...");
    const NodeCoordinator = await ethers.getContractFactory("NodeCoordinator");
    const nodeCoordinator = await NodeCoordinator.deploy(rpcContract.address, joyToken.address);
    await nodeCoordinator.deployed();
    console.log("NodeCoordinator deployed to:", nodeCoordinator.address);

    // Deploy ProofOfUse
    console.log("\nDeploying ProofOfUse...");
    const ProofOfUse = await ethers.getContractFactory("ProofOfUse");
    const proofOfUse = await ProofOfUse.deploy(rpcContract.address);
    await proofOfUse.deployed();
    console.log("ProofOfUse deployed to:", proofOfUse.address);

    // Initialize contracts
    console.log("\nInitializing contracts...");

    // Grant roles in JoyToken
    const MINTER_ROLE = await joyToken.MINTER_ROLE();
    const FEE_MANAGER_ROLE = await joyToken.FEE_MANAGER_ROLE();
    
    await joyToken.grantRole(MINTER_ROLE, rpcContract.address);
    await joyToken.grantRole(FEE_MANAGER_ROLE, rpcContract.address);
    await joyToken.grantRole(MINTER_ROLE, nodeCoordinator.address);
    await joyToken.grantRole(FEE_MANAGER_ROLE, nodeCoordinator.address);

    console.log("Roles granted in JoyToken");

    // Add initial verifiers to ProofOfUse
    const initialVerifiers = [
        deployer.address,
        // Add more initial verifiers here
    ];

    for (const verifier of initialVerifiers) {
        await proofOfUse.addVerifier(verifier);
    }
    console.log("Initial verifiers added to ProofOfUse");

    // Add initial regions to NodeCoordinator
    const regions = [
        { name: ethers.utils.formatBytes32String("us-east"), targetNodes: 5 },
        { name: ethers.utils.formatBytes32String("us-west"), targetNodes: 5 },
        { name: ethers.utils.formatBytes32String("eu-central"), targetNodes: 5 },
        { name: ethers.utils.formatBytes32String("ap-east"), targetNodes: 5 }
    ];

    for (const region of regions) {
        await nodeCoordinator.addRegion(region.name, region.targetNodes);
    }
    console.log("Initial regions added to NodeCoordinator");

    // Mint initial JoyTokens for testing
    const initialMint = ethers.utils.parseEther("1000000"); // 1M JOY
    await joyToken.mint(deployer.address, initialMint);
    console.log("Initial JOY tokens minted");

    console.log("\nDeployment complete! Contract addresses:");
    console.log("=======================================");
    console.log("JoyToken:", joyToken.address);
    console.log("EnhancedSovereignRPC:", rpcContract.address);
    console.log("NodeCoordinator:", nodeCoordinator.address);
    console.log("ProofOfUse:", proofOfUse.address);

    // Write deployment addresses to a file
    const fs = require("fs");
    const deploymentInfo = {
        JoyToken: joyToken.address,
        EnhancedSovereignRPC: rpcContract.address,
        NodeCoordinator: nodeCoordinator.address,
        ProofOfUse: proofOfUse.address,
        network: network.name,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
        "deployment-info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\nDeployment info written to deployment-info.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
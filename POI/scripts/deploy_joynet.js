const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy JoyToken
    console.log("Deploying JoyToken...");
    const JoyToken = await ethers.getContractFactory("JoyToken");
    const joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    console.log("JoyToken deployed to:", joyToken.address);

    // Deploy ProofOfUse
    console.log("Deploying ProofOfUse...");
    const ProofOfUse = await ethers.getContractFactory("ProofOfUse");
    const proofOfUse = await ProofOfUse.deploy();
    await proofOfUse.deployed();
    console.log("ProofOfUse deployed to:", proofOfUse.address);

    // Deploy ProofOfIntegrity
    console.log("Deploying ProofOfIntegrity...");
    const ProofOfIntegrity = await ethers.getContractFactory("ProofOfIntegrity");
    const proofOfIntegrity = await ProofOfIntegrity.deploy();
    await proofOfIntegrity.deployed();
    console.log("ProofOfIntegrity deployed to:", proofOfIntegrity.address);

    // Deploy ProofOfInference
    console.log("Deploying ProofOfInference...");
    const ProofOfInference = await ethers.getContractFactory("ProofOfInference");
    const proofOfInference = await ProofOfInference.deploy(joyToken.address);
    await proofOfInference.deployed();
    console.log("ProofOfInference deployed to:", proofOfInference.address);

    // Deploy PermaNetDomainRegistry
    console.log("Deploying PermaNetDomainRegistry...");
    const PermaNetDomainRegistry = await ethers.getContractFactory("PermaNetDomainRegistry");
    const domainRegistry = await PermaNetDomainRegistry.deploy(
        joyToken.address,
        proofOfUse.address,
        proofOfIntegrity.address,
        proofOfInference.address
    );
    await domainRegistry.deployed();
    console.log("PermaNetDomainRegistry deployed to:", domainRegistry.address);

    // Deploy PermaNetDAORegistry
    console.log("Deploying PermaNetDAORegistry...");
    const PermaNetDAORegistry = await ethers.getContractFactory("PermaNetDAORegistry");
    const daoRegistry = await PermaNetDAORegistry.deploy(
        domainRegistry.address,
        joyToken.address
    );
    await daoRegistry.deployed();
    console.log("PermaNetDAORegistry deployed to:", daoRegistry.address);

    // Set up contract relationships
    console.log("Setting up contract relationships...");

    // Grant roles in JoyToken
    const MINTER_ROLE = await joyToken.MINTER_ROLE();
    await joyToken.grantRole(MINTER_ROLE, proofOfInference.address);
    console.log("Granted MINTER_ROLE to ProofOfInference");

    // Initialize ProofOfUse with domain registry
    await proofOfUse.setDomainRegistry(domainRegistry.address);
    console.log("Initialized ProofOfUse");

    // Initialize ProofOfIntegrity with domain registry
    await proofOfIntegrity.setDomainRegistry(domainRegistry.address);
    console.log("Initialized ProofOfIntegrity");

    // Initialize ProofOfInference with domain registry
    await proofOfInference.setDomainRegistry(domainRegistry.address);
    console.log("Initialized ProofOfInference");

    console.log("Deployment complete!");
    console.log({
        JoyToken: joyToken.address,
        ProofOfUse: proofOfUse.address,
        ProofOfIntegrity: proofOfIntegrity.address,
        ProofOfInference: proofOfInference.address,
        PermaNetDomainRegistry: domainRegistry.address,
        PermaNetDAORegistry: daoRegistry.address
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy JoyToken
    console.log("\nDeploying JoyToken...");
    const JoyToken = await ethers.getContractFactory("JoyToken");
    const joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    console.log("JoyToken deployed to:", joyToken.address);

    // Deploy TokenEconomics
    console.log("\nDeploying TokenEconomics...");
    const TokenEconomics = await ethers.getContractFactory("TokenEconomics");
    const tokenEconomics = await TokenEconomics.deploy(joyToken.address);
    await tokenEconomics.deployed();
    console.log("TokenEconomics deployed to:", tokenEconomics.address);

    // Deploy DynamicFees
    console.log("\nDeploying DynamicFees...");
    const DynamicFees = await ethers.getContractFactory("DynamicFees");
    const dynamicFees = await DynamicFees.deploy(tokenEconomics.address);
    await dynamicFees.deployed();
    console.log("DynamicFees deployed to:", dynamicFees.address);

    // Deploy ProofOfUse
    console.log("\nDeploying ProofOfUse...");
    const ProofOfUse = await ethers.getContractFactory("ProofOfUse");
    const proofOfUse = await ProofOfUse.deploy();
    await proofOfUse.deployed();
    console.log("ProofOfUse deployed to:", proofOfUse.address);

    // Deploy ModelMarketplace
    console.log("\nDeploying ModelMarketplace...");
    const ModelMarketplace = await ethers.getContractFactory("ModelMarketplace");
    const modelMarketplace = await ModelMarketplace.deploy(
        joyToken.address,
        proofOfUse.address,
        tokenEconomics.address,
        dynamicFees.address
    );
    await modelMarketplace.deployed();
    console.log("ModelMarketplace deployed to:", modelMarketplace.address);

    // Deploy DomainRegistry
    console.log("\nDeploying DomainRegistry...");
    const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
    const domainRegistry = await DomainRegistry.deploy(
        joyToken.address,
        tokenEconomics.address,
        dynamicFees.address
    );
    await domainRegistry.deployed();
    console.log("DomainRegistry deployed to:", domainRegistry.address);

    // Setup roles and permissions
    console.log("\nSetting up roles and permissions...");
    
    // Grant MINTER_ROLE to TokenEconomics
    const MINTER_ROLE = await joyToken.MINTER_ROLE();
    await joyToken.grantRole(MINTER_ROLE, tokenEconomics.address);
    console.log("Granted MINTER_ROLE to TokenEconomics");

    // Grant ECONOMICS_ROLE to relevant contracts
    const ECONOMICS_ROLE = await joyToken.ECONOMICS_ROLE();
    await joyToken.grantRole(ECONOMICS_ROLE, tokenEconomics.address);
    await joyToken.grantRole(ECONOMICS_ROLE, modelMarketplace.address);
    await joyToken.grantRole(ECONOMICS_ROLE, domainRegistry.address);
    console.log("Granted ECONOMICS_ROLE to platform contracts");

    // Initialize pools
    console.log("\nInitializing token pools...");
    await joyToken.updatePoolBalances();
    console.log("Token pools initialized");

    console.log("\nDeployment complete! Contract addresses:");
    console.log("=======================================");
    console.log("JoyToken:", joyToken.address);
    console.log("TokenEconomics:", tokenEconomics.address);
    console.log("DynamicFees:", dynamicFees.address);
    console.log("ProofOfUse:", proofOfUse.address);
    console.log("ModelMarketplace:", modelMarketplace.address);
    console.log("DomainRegistry:", domainRegistry.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
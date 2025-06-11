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

  // Deploy TokenEconomics
  console.log("Deploying TokenEconomics...");
  const TokenEconomics = await ethers.getContractFactory("TokenEconomics");
  const tokenEconomics = await TokenEconomics.deploy(joyToken.address);
  await tokenEconomics.deployed();
  console.log("TokenEconomics deployed to:", tokenEconomics.address);

  // Deploy DynamicFees
  console.log("Deploying DynamicFees...");
  const DynamicFees = await ethers.getContractFactory("DynamicFees");
  const dynamicFees = await DynamicFees.deploy(tokenEconomics.address);
  await dynamicFees.deployed();
  console.log("DynamicFees deployed to:", dynamicFees.address);

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
  const proofOfInference = await ProofOfInference.deploy();
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

  // Deploy ModelMarketplace
  console.log("Deploying ModelMarketplace...");
  const ModelMarketplace = await ethers.getContractFactory("ModelMarketplace");
  const modelMarketplace = await ModelMarketplace.deploy(
    joyToken.address,
    proofOfUse.address,
    tokenEconomics.address,
    dynamicFees.address
  );
  await modelMarketplace.deployed();
  console.log("ModelMarketplace deployed to:", modelMarketplace.address);

  // Deploy GeneralMarketplace
  console.log("Deploying GeneralMarketplace...");
  const GeneralMarketplace = await ethers.getContractFactory("GeneralMarketplace");
  const generalMarketplace = await GeneralMarketplace.deploy(
    joyToken.address,
    tokenEconomics.address,
    dynamicFees.address
  );
  await generalMarketplace.deployed();
  console.log("GeneralMarketplace deployed to:", generalMarketplace.address);

  // Save deployment addresses
  const deploymentInfo = {
    JoyToken: joyToken.address,
    TokenEconomics: tokenEconomics.address,
    DynamicFees: dynamicFees.address,
    ProofOfUse: proofOfUse.address,
    ProofOfIntegrity: proofOfIntegrity.address,
    ProofOfInference: proofOfInference.address,
    PermaNetDomainRegistry: domainRegistry.address,
    ModelMarketplace: modelMarketplace.address,
    GeneralMarketplace: generalMarketplace.address
  };

  console.log("\nDeployment Info:", deploymentInfo);

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployment/addresses.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
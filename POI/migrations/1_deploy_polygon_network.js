const ModelMarketplaceV2 = artifacts.require("ModelMarketplaceV2");
const IOTAValidator = artifacts.require("IOTAValidator");
const ModelGovernanceDAO = artifacts.require("ModelGovernanceDAO");
const TimelockController = artifacts.require("TimelockController");
const JoyToken = artifacts.require("JoyToken");
const ProofOfUse = artifacts.require("ProofOfUse");

module.exports = async function (deployer, network) {
  if (network === "polygon_supernet") {
    // Deploy JoyToken first
    await deployer.deploy(JoyToken);
    const joyToken = await JoyToken.deployed();

    // Deploy ProofOfUse
    await deployer.deploy(ProofOfUse);
    const proofOfUse = await ProofOfUse.deployed();

    // Deploy ModelMarketplace with JoyToken and ProofOfUse addresses
    // Deploy IOTA Validator
    await deployer.deploy(IOTAValidator);
    const iotaValidator = await IOTAValidator.deployed();

    // Deploy Timelock for DAO
    const minDelay = 2 * 24 * 60 * 60; // 2 days
    const proposers = [];
    const executors = [];
    await deployer.deploy(TimelockController, minDelay, proposers, executors);
    const timelock = await TimelockController.deployed();

    // Deploy DAO
    const votingDelay = 1;
    const votingPeriod = 45818; // ~1 week
    const quorumPercentage = 4;
    await deployer.deploy(
      ModelGovernanceDAO,
      joyToken.address,
      timelock.address,
      votingDelay,
      votingPeriod,
      quorumPercentage
    );
    const dao = await ModelGovernanceDAO.deployed();

    // Deploy ModelMarketplaceV2
    await deployer.deploy(
      ModelMarketplaceV2,
      joyToken.address,
      proofOfUse.address,
      iotaValidator.address,
      dao.address
    );
  }
};
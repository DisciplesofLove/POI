const EthicalModelGovernanceDAO = artifacts.require("EthicalModelGovernanceDAO");
const LoveAndViceScore = artifacts.require("LoveAndViceScore");
const ModelGovernanceDAO = artifacts.require("ModelGovernanceDAO");
const JoyToken = artifacts.require("JoyToken");
const TimelockController = artifacts.require("TimelockController");

module.exports = async function (deployer, network) {
  if (network === "polygon_supernet") {
    // Get deployed instances
    const joyToken = await JoyToken.deployed();
    const timelock = await TimelockController.deployed();
    
    // Deploy Love and Vice Score system
    await deployer.deploy(LoveAndViceScore);
    const loveAndViceScore = await LoveAndViceScore.deployed();
    
    // Deploy ethical governance DAO
    const votingDelay = 1;
    const votingPeriod = 45818; // ~1 week
    const quorumPercentage = 4; // 4%
    
    await deployer.deploy(
      EthicalModelGovernanceDAO,
      joyToken.address,
      timelock.address,
      votingDelay,
      votingPeriod,
      quorumPercentage,
      loveAndViceScore.address
    );
    const ethicalDao = await EthicalModelGovernanceDAO.deployed();

    // Setup initial roles
    const CURATOR_ROLE = await loveAndViceScore.CURATOR_ROLE();
    const GOVERNANCE_ROLE = await loveAndViceScore.GOVERNANCE_ROLE();
    
    // Grant roles to the DAO
    await loveAndViceScore.grantRole(GOVERNANCE_ROLE, ethicalDao.address);
    
    // Optional: Grant curator role to deployer for initial setup
    await loveAndViceScore.grantRole(CURATOR_ROLE, deployer.address);
  }
};
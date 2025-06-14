const { ethers } = require("hardhat");

async function main() {
  // Get contract factories
  const JoyToken = await ethers.getContractFactory("JoyToken");
  const JSCBridge = await ethers.getContractFactory("JSCBridge");

  // Deploy JoyToken if not already deployed
  const joyToken = await JoyToken.deploy();
  await joyToken.deployed();
  console.log("JoyToken deployed to:", joyToken.address);

  // Bridge parameters
  const minDeposit = ethers.utils.parseEther("1"); // 1 JSC minimum
  const maxDeposit = ethers.utils.parseEther("1000"); // 1000 JSC maximum
  const dailyLimit = ethers.utils.parseEther("10000"); // 10000 JSC daily limit

  // Deploy JSCBridge
  const bridge = await JSCBridge.deploy(
    joyToken.address,
    minDeposit,
    maxDeposit,
    dailyLimit
  );
  await bridge.deployed();
  console.log("JSCBridge deployed to:", bridge.address);

  // Grant bridge MINTER_ROLE on JoyToken
  const MINTER_ROLE = await joyToken.MINTER_ROLE();
  await joyToken.grantRole(MINTER_ROLE, bridge.address);
  console.log("Granted MINTER_ROLE to bridge");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
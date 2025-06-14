const hre = require("hardhat");

async function main() {
    const Registrar = await hre.ethers.getContractFactory("TLDRegistrar");
    const registrar = await Registrar.deploy();
    await registrar.deployed();
    console.log("Registrar Contract Deployed:", registrar.address);
}

main().catch(console.error);
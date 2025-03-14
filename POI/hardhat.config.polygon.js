require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    polygon_supernet: {
      url: process.env.POLYGON_SUPERNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: parseInt(process.env.POLYGON_CHAIN_ID),
      gasPrice: "auto"
    }
  }
};
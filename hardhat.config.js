require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    basecamp: {
      url: process.env.BASECAMP_RPC_URL || "https://rpc.basecamp-testnet.camp.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY.replace(/^0x/, '')] : [],
      chainId: 123420001114,
      gasPrice: "auto",
      timeout: 120000,
      httpHeaders: {},
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      basecamp: process.env.BLOCKSCOUT_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "basecamp",
        chainId: 123420001114,
        urls: {
          apiURL: "https://explorer.basecamp-testnet.camp.network/api",
          browserURL: "https://explorer.basecamp-testnet.camp.network",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

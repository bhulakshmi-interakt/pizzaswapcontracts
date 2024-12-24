require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const FTM_KEY="2YH2EXQ7PRV2G45C35PAQ5YT7HDN2UG14U"

// {
//   ftmTestnet: "DE9HP51TTV8EDVPJSPYB4UQCS8YE2HDKV4",
//   opera: "DE9HP51TTV8EDVPJSPYB4UQCS8YE2HDKV4",
//   polygonAmoy: "2YH2EXQ7PRV2G45C35PAQ5YT7HDN2UG14U",
// },
const PRIVATE_KEY ="3ecd08cb074d0536e86046b7d670047c8685c4f49d30bcec27a6a7345b517916"
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    fantom_test: {
      url: "https://rpc.testnet.fantom.network",
      accounts: [PRIVATE_KEY],
    },
    // bsc_test: {
    //   url: "https://bsc-testnet-rpc.publicnode.com",
    //   accounts: [process.env.PRIVATEKEY, process.env.PRIVATEKEY1],
    // },
    polygonAmoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/EhFANtBmffNP75sVBULQ4lzYT_HdmirZ",
      accounts: [PRIVATE_KEY],
      chainId: 80002,
      timeout: 200000,
    },
    sepolia: {
      url: "https://ethereum-sepolia.blockpi.network/v1/rpc/c745c9ef5b5653e28394e197b3e9413a5d47ff27",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    hardhat: {
      timeout: 200000, // Increase timeout
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    //  apiKey: "WQKQ9RXXCTK715PKG1H7JUMV4ZEUW3KKXN"
   apiKey: FTM_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 200000,
  },
};



const { ethers } = require("hardhat");

const fs = require("fs");
const envfile = require("envfile");
const parsedFile = envfile.parse(fs.readFileSync("./scripts/sepolia_lottery.env"));
const tokenAbi = require('./erc20tokenabi.json')
const lotteryAbi = require('./lottery.json')
const lotteryNFTAbi = require('./lotterynft.json')

const lotteryCa = '0x347f96ADd6De6C1E948d38E50fa554d2A954f06d';
const lotteryNFTca = '0x3C97Ec92397CE59B8Ec9D3F7576dFeE73a58d9A6';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    // "https://ethereum-sepolia-rpc.publicnode.com",
    // "https://bsc-testnet-rpc.publicnode.com"
    "https://rpc-amoy.polygon.technology"
  );
  const adminPrivateKey = "e694a21afc32303e01f22994fb72f21eac72d7874f087e86b5ed47e7a8dc25eb"; 
  const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
  
  const lotteryContract = new ethers.Contract(lotteryCa, lotteryAbi, adminWallet);
  const lotteryNFTContract = new ethers.Contract(lotteryNFTca, lotteryNFTAbi, adminWallet);

  console.log(lotteryContract.address, lotteryNFTContract.address)

  console.log("lotteryNFTContract.owner", await lotteryContract.issueIndex())
  console.log("lotteryNFTContract.owner", await lotteryNFTContract.name())
  // const tx = await lotteryNFTContract.transferOwnership(lotteryContract.address); // Lottery contract now owns the LotteryNFT
  // await tx.wait()
  // console.log("transfered ownership")

  // const tx = await lotteryContract.reset()
  // await tx.wait()
  // console.log("reset")

  // // //////////////start
  // //   // Initialize the Lottery contract
    const tx2 = await lotteryContract.enterDrawingPhase();
    await tx2.wait();
    console.log("Lottery contract enterDrawingPhase");

  // // // ///close - drawing
  const externalRandomNumber = Math.floor(Math.random() * 1000000); // Example random number
  console.log("Random number:", externalRandomNumber);
  const tx3 = await lotteryContract.drawing(externalRandomNumber);
  await tx3.wait();
  console.log("Lottery contract drawing finished");

  
  // const tx4 = await lotteryContract.setMaxNumber(50);
  // await tx4.wait();
  // console.log("Min price and max number set");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

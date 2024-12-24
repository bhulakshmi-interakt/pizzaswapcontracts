
const { ethers } = require("hardhat");

const fs = require("fs");
const envfile = require("envfile");
const parsedFile = envfile.parse(fs.readFileSync("./scripts/sepolia_lottery.env"));
const tokenAbi = require('./erc20tokenabi.json')

// const pizzaToken = '0x26cf332054007d1E5105285Cb5202257186a2CdF'; //sepolia
// const pizzaToken = '0xB18FBf384Bb2EFBd2A2166CE4cEE682D3Db812c3';//bsc
const pizzaToken = '0x05071699842a97faFA22648820798e21BD9aa914'; //polygon

async function main() {
  
  const provider = new ethers.providers.JsonRpcProvider(
    // "https://ethereum-sepolia-rpc.publicnode.com",
    // "https://bsc-testnet-rpc.publicnode.com"
    "https://polygon-amoy.g.alchemy.com/v2/3Xek0xVTTMoYGPa9lNxEOAYA9krVtP5c"
  );

  const pizzaTokenContract = new ethers.Contract(pizzaToken, tokenAbi, provider);

  // const PIZZA = await ethers.getContractFactory("PizzaswapToken");
  // const pizzaTokenContract = await PIZZA.deploy();
  // await pizzaTokenContract.deployed();

  console.log("pizzaTokenContract", pizzaTokenContract.address);

  const LotteryNFT = await ethers.getContractFactory("LotteryNFT");
  const lotteryNFT = await LotteryNFT.deploy();
  await lotteryNFT.deployed();
  console.log("lotteryNFT", lotteryNFT.address);


  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.deployed();

  console.log("lottery", lottery.address);

  
  const txxx = await lotteryNFT.transferOwnership(lottery.address); // Lottery contract now owns the LotteryNFT
  await txxx.wait()

  const minPrice = ethers.utils.parseUnits("10", 18); 
  const maxNumber = 50; // Example maximum number
  const adminAddress = "0xf71dB8060CDd46f20FA25c68Af19E79ee9D19f78"; // Replace with your admin address

    // Initialize the Lottery contract
    const tx = await lottery.initialize(
      pizzaTokenContract.address,
      lotteryNFT.address,
      minPrice,
      maxNumber,
      adminAddress
  );
  // Wait for the transaction to be confirmed
  await tx.wait();
  console.log("Lottery contract initialized");

  
  

  // Optionally, set initial allocations for rewards
  const allocation1 = 60;
  const allocation2 = 20;
  const allocation3 = 10;
  const tx2 = await lottery.setAllocation(allocation1, allocation2, allocation3);
  await tx2.wait();
  console.log("Allocation set:", allocation1, allocation2, allocation3);


  // Set initial parameters like minPrice and maxNumber (if needed)
  const tx3 = await lottery.setMinPrice(minPrice);
  await tx3.wait();
  
  const tx4 = await lottery.setMaxNumber(maxNumber);
  await tx4.wait();
  console.log("Min price and max number set");




  parsedFile.REACT_APP_LOTTERY = lottery.address;
  parsedFile.REACT_APP_NFT = lotteryNFT.address;
  fs.writeFileSync(
    "./scripts/sepolia_lottery.env",
    envfile.stringify(parsedFile, null, "\t")
  );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

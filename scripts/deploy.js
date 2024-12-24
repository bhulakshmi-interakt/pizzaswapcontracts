// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
// const { abi } = require("../artifacts/contracts/exchange-protocol/dexfactory.sol/pancakeswapPair.json");
// const { abi } = require("../artifacts/contracts/lottery/lottery.sol/Lottery.json");

const fs = require("fs");
// const path = require('path');
const envfile = require("envfile");
const parsedFile = envfile.parse(fs.readFileSync("./scripts/sepolia.env"));
const parsedFileSdkConstant = envfile.parse(
  fs.readFileSync("./scripts/constants.d.ts")
);

const factoryAbi = fs.readFileSync("./scripts/factoryabi.json").toString();
// const masterchefAbi = fs.readFileSync("./scripts/masterchef.json").toString();

const isHardhat = true;
const INIT_CODE_PAIR_HASH ="0x1633a53d959618aefe36f37f87ba0cb5c4b353d8ee0b88d1cee376ff14bd3e1e";
const factoryAddress = "0xFAC137851A3496809AaA10E7E97b303eF5CE3f6e";
async function main() {
  const [deployer] = await ethers.getSigners();

  const provider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com",
  //   "https://bsc-testnet.public.blastapi.io",
  //  "https://rpc-amoy.polygon.technology",
  );
  
  // get timestamp for lottery
  const currentTime = new Date();
  const currentTimeInSeconds = currentTime.getTime() / 1000;
  const lotteryEndTime = currentTimeInSeconds + 1800;
  console.log(currentTimeInSeconds);
  // get blockc number
  // const provider = new ethers.providers.JsonRpcProvider(
  //   "https://rpc.testnet.fantom.network"
  //   // "https://polygon-amoy.g.alchemy.com/v2/3Xek0xVTTMoYGPa9lNxEOAYA9krVtP5c"
  // );
  const currentBlockNumber = await provider.getBlockNumber();
  console.log("currentblock", currentBlockNumber);
  // dex
  const Factory = await ethers.getContractFactory("AGFSwapFactory");
  let exchangeFactory = null;
  if (INIT_CODE_PAIR_HASH == "") {
    exchangeFactory = await Factory.deploy(deployer.address);
    await exchangeFactory.deployed();
    console.log(
      "INIT_CODE_PAIR_HASH",
      await exchangeFactory.INIT_CODE_PAIR_HASH()
    );
    console.log("exchangeFactory", exchangeFactory.address);
    return;
  } else {
    exchangeFactory = new ethers.Contract(factoryAddress, factoryAbi, deployer);
  }
  console.log("exchangeFactory", exchangeFactory.address);

  /* ----------- WETH -------------- */
  //deploy WETH contract for test
  const WETH = await ethers.getContractFactory("WETH9");
  const wETH = await WETH.deploy();
  await wETH.deployed();

  console.log("WETH", wETH.address);

  const Router = await ethers.getContractFactory("AGFSwapRouter");
  const exchangeRouter = await Router.deploy(
    exchangeFactory.address,
    wETH.address
  );
  await exchangeRouter.deployed();

  console.log("exchangeRouter", exchangeRouter.address);

  //multicall
  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.deployed();
  console.log("multicall", multicall.address);

  //deploy tokens

  const AGFswapToken = await ethers.getContractFactory("AGFswapToken");
  const AGFtoken = await AGFswapToken.deploy();
  await AGFtoken.deployed();

  const Corn = await ethers.getContractFactory("CornToken");
  const corn = await Corn.deploy(AGFtoken.address);
  await corn.deployed();

  let usdAddress, busd;
  if (isHardhat) {
    const Busd = await ethers.getContractFactory("BEP20Token");
    busd = await Busd.deploy();
    await busd.deployed();
    usdAddress = busd.address;
  } else {
    usdAddress = process.env.USDT;
    busd = new ethers.Contract(
      usdAddress,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
      ],
      deployer
    );
  }

  console.log("AGFtoken token", AGFtoken.address);
  console.log("corn token", corn.address);
  console.log("usdt token", usdAddress);

  //masterchef
  const MasterChef = await ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(
    AGFtoken.address,
    corn.address,
    deployer.address,
    ethers.utils.parseUnits("0.01", "ether"),
    currentBlockNumber,
    "0xE7CFbf09B008e0bb75F0E2446518556e96d9fAb2"
  );
  await masterChef.deployed();

  console.log("masterchef", masterChef.address);

  //token mints

  tx = await AGFtoken.mint(
    deployer.address,
    ethers.utils.parseUnits("100000000000", 18)
  );
  await tx.wait();
  tx = await AGFtoken.mint(
    corn.address,
    ethers.utils.parseUnits("100000000000", 18)
  );
  await tx.wait();
  tx = await corn.mint(
    masterChef.address,
    ethers.utils.parseUnits("100000000000", 18)
  );
  await tx.wait();

  const amountWETH = 0.1;
  const amountAGF = 1000;
  const amountUsdt = 10;

  tx = await wETH.deposit({
    value: ethers.utils.parseUnits(String(amountWETH * 2), "ether"),
  });
  await tx.wait();
  console.log("deposit wETH");
  // const balance = await wETH.balanceOf(deployer.address);
  // console.log(ethers.utils.formatEther(String(balance)))
  //approve
  tx = await wETH.approve(
    exchangeRouter.address,
    ethers.utils.parseUnits(String(amountWETH * 2), 18)
  );
  await tx.wait();
  console.log("approve wETH");

  tx = await AGFtoken.approve(
    exchangeRouter.address,
    ethers.utils.parseUnits(String(amountAGF), 18)
  );
  await tx.wait();
  console.log("approve AGFtoken");

  tx = await busd.approve(
    exchangeRouter.address,
    ethers.utils.parseUnits(String(amountUsdt), 18)
  );
  await tx.wait();
  console.log("approve usdt");

  const pcnLp1 = await exchangeFactory.getPair(
    wETH.address,
    AGFtoken.address
  );
  console.log("pcn Lp token", pcnLp1);

  //create LP token
  tx = await exchangeRouter.addLiquidity(
    wETH.address,
    AGFtoken.address,
    ethers.utils.parseUnits(String(amountWETH), 18),
    ethers.utils.parseUnits(String(amountAGF), 18),
    0,
    0,
    deployer.address,
    "111111111111111111111",{
      gasLimit: 500000,
      maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
      maxFeePerGas: ethers.utils.parseUnits('60', 'gwei'),
    }
  );
  await tx.wait();
  console.log("addLiquidity pcn Lp");

  const AGFLp = await exchangeFactory.getPair(
    wETH.address,
    AGFtoken.address
  );

  console.log("AGFLp token", AGFLp);

  //busd lp

  tx = await exchangeRouter.addLiquidity(
    wETH.address,
    usdAddress,
    ethers.utils.parseUnits(String(amountWETH), 18),
    ethers.utils.parseUnits(String(amountUsdt), 18),
    0,
    0,
    deployer.address,
    "111111111111111111111",
    {
      gasLimit: 500000,
    maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei'),
    maxFeePerGas: ethers.utils.parseUnits('60', 'gwei'),
    }
  );
  await tx.wait();
  console.log("addLiquidity usdt lp");

  var usdLp = await exchangeFactory.getPair(wETH.address, usdAddress);

  console.log("usdt lp token", usdLp);

  // var cakeLpContract = new ethers.Contract(cakeLp, abi, provider);

  // const multi1 = await cake.balanceOf(cakeLp);
  // console.log("multi1", multi1);
  // const multi2 = await wETH.balanceOf(cakeLp);
  // console.log("multi2", multi2);
  // const multi3 = await cakeLpContract.balanceOf(masterChef.address);
  // console.log("multi3", multi3);
  // const multi4 = await cakeLpContract.totalSupply();
  // console.log("multi4", multi4);
  // const multi5 = await cake.decimals();
  // console.log("multi5", multi5);
  // const multi6 = await wETH.decimals();
  // console.log("multi6", multi6);

  tx = await masterChef.add(10, AGFLp, 1, 86400, false);
  await tx.wait();
  console.log("add to masterChef AGFLp", AGFLp);

  tx = await masterChef.add(10, usdLp, 2, 43200, false);
  await tx.wait();
  console.log("add to masterChef usdLp", usdLp);

  //cake vault

  const PcnVault = await ethers.getContractFactory("PcnVault");
  const pcnVault = await PcnVault.deploy(
    AGFtoken.address,
    corn.address,
    masterChef.address,
    deployer.address,
    deployer.address
  );
  await pcnVault.deployed();

  console.log("pcnVault", pcnVault.address);

  //transfer ownership for farming and pool

  tx = await AGFtoken.transferOwnership(masterChef.address);
  await tx.wait();

  tx = await corn.transferOwnership(masterChef.address);
  await tx.wait();

  //RandomNumberGenerator deploy

  const RandomNumberGenerator = await ethers.getContractFactory(
    "MockRandomNumberGenerator"
  );
  const randomNumberGenerator = await RandomNumberGenerator.deploy();
  await randomNumberGenerator.deployed();

  tx = await randomNumberGenerator.setNextRandomResult(938437);
  await tx.wait();

  // //Lottery deploy

  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    AGFtoken.address,
    randomNumberGenerator.address
  );
  await lottery.deployed();

  // //set Lottery

  tx = await lottery.setOperatorAndTreasuryAndInjectorAddresses(
    deployer.address,
    deployer.address,
    deployer.address
  );
  await tx.wait();

  tx = await lottery.startLottery(
    Number(lotteryEndTime).toFixed(0),
    ethers.utils.parseUnits("0.01", 18),
    2000,
    [250, 375, 625, 1250, 2500, 5000],
    2000
  );

  await tx.wait();

  tx = await randomNumberGenerator.setLotteryAddress(lottery.address);
  await tx.wait();

  tx = await randomNumberGenerator.changeLatestLotteryId();
  await tx.wait();

  //prediction

  const Aggregator = await ethers.getContractFactory("AggregatorV3");
  const aggregator = await Aggregator.deploy(18, 0);
  await aggregator.deployed();

  const Prediction = await ethers.getContractFactory("BnbPricePrediction");
  const prediction = await Prediction.deploy(
    aggregator.address,
    deployer.address,
    deployer.address,
    1,
    2,
    ethers.utils.parseUnits("0.01", 18),
    3600
  );
  await prediction.deployed();

  // test
  // const cakeLpContract = new ethers.Contract(cakeLp, abi, deployer);
  // var amt = await cakeLpContract.totalSupply();
  // console.log("amt", amt)
  // tx = await cakeLpContract.approve(masterChef.address, ethers.utils.parseUnits("1000", 18))
  // await tx.wait();
  // console.log("success")

  // tx = await masterChef.deposit(1, ethers.utils.parseUnits("10", 18));
  // await tx.wait();
  // tx = await masterChef.withdraw(1, ethers.utils.parseUnits("1", 18));
  // await tx.wait();

  // tx = await cake.approve(cakeVault.address, "100000000000000000000000")
  // await tx.wait();
  // console.log("suc")
  // tx = await cakeVault.deposit("100");
  // await tx.wait();
  // console.log("success");

  // import to file

  parsedFile.REACT_APP_FACTORY = exchangeFactory.address;
  parsedFile.REACT_APP_ROUTER = exchangeRouter.address;
  parsedFile.REACT_APP_MASTERCHEF = masterChef.address;
  parsedFile.REACT_APP_CAKEFAULT = pcnVault.address;
  parsedFile.REACT_APP_LOTTERY = lottery.address;
  parsedFile.REACT_APP_MULTICALL = multicall.address;
  parsedFile.REACT_APP_CHAINLINKORACLE = aggregator.address;
  parsedFile.REACT_APP_PREDICTIONS = prediction.address;
  parsedFile.REACT_APP_WETH = wETH.address;
  parsedFile.REACT_APP_BUSD = usdAddress;
  parsedFile.REACT_APP_PCN = AGFtoken.address;
  parsedFile.REACT_APP_CORN = corn.address;
  parsedFile.REACT_APP_PCNLP = AGFLp;
  parsedFile.REACT_APP_USDTLP = usdLp;
  fs.writeFileSync(
    "./scripts/sepolia.env",
    envfile.stringify(parsedFile, null, "\t")
  );

  //change addresses in sdk

  // const sdkFile = fs.readFileSync("./scripts/constants.d.ts", "utf-8");

  // var result = sdkFile
  //   .replace(
  //     String(parsedFileSdkConstant["export declare const FACTORY_ADDRESS"]),
  //     `"${exchangeFactory.address}";`
  //   )
  //   .replace(
  //     parsedFileSdkConstant["export declare const INIT_CODE_HASH"],
  //     `"${await exchangeFactory.INIT_CODE_PAIR_HASH()}";`
  //   );

  // fs.writeFileSync("./scripts/constants.d.ts", result, "utf-8");

  //   console.log("data", data)
  //   if (err) {
  //     return console.log(err);
  //   }
  //   var result = data.replace(parsedFileSdkConstant["export declare const FACTORY_ADDRESS"], String(exchangeFactory.address))
  //     .replace(parsedFileSdkConstant["export declare const INIT_CODE_HASH"], String(exchangeFactory.INIT_CODE_PAIR_HASH()))

  // console.log("result", result);

  //   fs.writeFile(sdkPath, result, 'utf8', function (err) {
  //     if (err) return console.log(err);
  //   });
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

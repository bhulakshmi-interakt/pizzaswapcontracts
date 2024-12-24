// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
// const { abi } = require("../artifacts/contracts/exchange-protocol/dexfactory.sol/pancakeswapPair.json");
const { abi } = require("../artifacts/contracts/lottery/lottery.sol/Lottery.json");

const fs = require('fs');
const path = require('path');
const envfile = require('envfile')
const parsedFile = envfile.parse(fs.readFileSync('./frontend/.env'));
const parsedFileSdkConstant = envfile.parse(fs.readFileSync('./frontend/node_modules/@pancakeswap/sdk/dist/constants.d.ts'));

async function main() {
    const [deployer] = await ethers.getSigners();

    // get timestamp for lottery
    const currentTime = new Date();
    const currentTimeInSeconds = currentTime.getTime() / 1000;
    const lotteryEndTime = currentTimeInSeconds + 1800;
    console.log(currentTimeInSeconds);
    // get blockc number
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.testnet.fantom.network");
    const lotteryContract = new ethers.Contract("0xd3Bd1A1e057616c7a56D0F1Ef971BAEF1a895f65", abi, deployer);
    // dex


    // tx = await lotteryContract.buyTickets(
    //     1,
    //     [1938437]
    // )
    // await tx.wait();

    // console.log("wowo")

    // tx = await lotteryContract.closeLottery(1);
    // await tx.wait();


    // tx = await lotteryContract.drawFinalNumberAndMakeLotteryClaimable(
    //     1,
    //     false
    // )
    // await tx.wait();

    // const ticketNumbers = await lotteryContract.viewNumbersAndStatusesForTicketIds(
    //     [0]
    // )
    // console.log("ticket Numbers", ticketNumbers)


    tx = await lotteryContract.claimTickets(
        1,
        [
            70
        ],
        [5]
    )
    await tx.wait();




    // const loteryState = await lotteryContract.viewUserInfoForLotteryId(
    //     "0x3b36423d0F9581c511120c49E7413432748ABebC",
    //     1,
    //     0,
    //     1000
    // );
    // console.log("lottyer status", loteryState)




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


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

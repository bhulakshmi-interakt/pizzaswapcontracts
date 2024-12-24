
const { ethers } = require("hardhat");

const fs = require("fs");
const envfile = require("envfile");
const parsedFile = envfile.parse(fs.readFileSync("./scripts/sepolia_lottery.env"));
const tokenAbi = require('./erc20tokenabi.json')

const masterchefAbi = require('./masterchef.json')

const masterchef = '0x24fdD3129177cc55661E6dc6a51fCE52d7584566';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com",
    // "https://bsc-testnet-rpc.publicnode.com"
    // "https://rpc-amoy.polygon.technology"
  );
  const adminPrivateKey = "e694a21afc32303e01f22994fb72f21eac72d7874f087e86b5ed47e7a8dc25eb"; 
  const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
  
  const stakeContract = new ethers.Contract(masterchef, masterchefAbi, adminWallet);
  
  const tx3 = await stakeContract.set(
    0,
    1000,
    0,
    3600,
    false
  );
  await tx3.wait();
  console.log("reset farm data");


const data = await stakeContract.poolInfo(0)
console.log(data)

const data2 = await stakeContract.userInfo(0, "0xf71dB8060CDd46f20FA25c68Af19E79ee9D19f78")
console.log(data2)



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

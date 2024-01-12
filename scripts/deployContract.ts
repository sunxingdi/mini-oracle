import { Wallet, Contract, ContractFactory, providers } from "ethers";
import { ethers } from "hardhat";
import fs from 'fs';

import {
  ConsumerContractAbiFile,
  ConsumerContractAttrFile,
  MiniOracleContractAbiFile,
  MiniOracleContractAttrFile,
} from "./config";

import {
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
} from "../hardhat.config";

let provider: providers.JsonRpcProvider;
const privateKey = PRIVATE_KEY;

async function initSetting() {

  // 查询版本
  console.log("Ethers Version: ", ethers.version)

  // 设置网络
  const hre: HardhatRuntimeEnvironment = await import('hardhat');
  const networkName = hre.network.name; // 获取通过命令行传递的 --network 参数值

  if (networkName === 'sepolia') {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    console.log('网络设置：使用远端RPC网络', networkName);

  } else if (networkName === 'localhost') {
    provider = new ethers.JsonRpcProvider();
    console.log('网络设置：使用本地网络...');

  }  else {
    throw new Error("网络参数错误，请检查...");
  }

  console.log("\n", '检查网络连接...');

  try {
      await provider.getBlockNumber(); // 尝试调用任意一个 provider 方法
      console.log('已连接到以太坊网络.');
  } catch (error) {
      console.log('未连接到以太坊网络：', error.message);
      process.exit()
  }  
}

//业务代码############################################################

let wallet:Wallet;

async function initialWallet() {
  console.log("\n", '初始化账户...');

  wallet = new ethers.Wallet(privateKey, provider);

  console.log('账户 A 地址：', wallet.address);
  console.log('账户 A 余额：', ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");

}

async function saveContractBuildInfo(ContractFactory:ContractFactory, Contract:Contract, ContractAttrFile:string, ContractAbiFile:string) {
  
  console.log("\n", "保存合约地址和ABI...");
  // 保存合约地址
  const ContractAddr = Contract.target;
  fs.writeFileSync(ContractAttrFile, JSON.stringify({ 'address': ContractAddr }, null, 2), 'utf8');
  console.log(`合约地址已保存到文件：${ContractAttrFile}`);
  // 保存合约ABI
  const ContractABI = JSON.stringify(ContractFactory.interface.fragments, null, 2);
  fs.writeFileSync(ContractAbiFile, ContractABI, 'utf8');
  console.log(`合约ABI已保存到文件：${ContractAbiFile}`);

}

async function makeDeploy() {

  console.log("\n", "部署预言机合约...");
  const MiniOracleContractFactory = await ethers.getContractFactory("MiniOracle", wallet); //指定账户部署，需要用私钥初始化
  const MiniOracleContract = await MiniOracleContractFactory.deploy();
  console.log("预言机合约地址:", MiniOracleContract.target);

  console.log("\n", "保存合约地址和ABI...");
  await saveContractBuildInfo(
    MiniOracleContractFactory,
    MiniOracleContract,
    MiniOracleContractAttrFile,
    MiniOracleContractAbiFile
  )

  // const MiniOracleContractInstance = await MiniOracleContract.waitForDeployment();
  // console.log("\nMiniOracleContractInstance: \n", MiniOracleContractInstance);

  const MiniOracleContractTransactionResponse = await MiniOracleContract.deploymentTransaction()
  console.log("\n", "返回交易信息...");
  console.log(MiniOracleContractTransactionResponse);

  const MiniOracleContractTxHash = MiniOracleContractTransactionResponse.hash //获取交易哈希
  const MiniOracleContractTxReceipt = await provider.waitForTransaction(MiniOracleContractTxHash); //等待交易完成，返回交易回执
  // const MiniOracleContractTxReceipt = await provider.getTransactionReceipt(MiniOracleContractTxHash); //该方法有问题，不等待直接获取回执，可能交易还未完成。
  console.log("\n", "获取交易回执...");
  console.log(MiniOracleContractTxReceipt);
  console.log("\n", "预言机合约部署完成...");

  //###########################################################################################
  console.log("\n", "部署用户合约...");
  const ConsumerContractFactory = await ethers.getContractFactory("Consumer", wallet); //指定账户部署，需要用私钥初始化
  const ConsumerContract = await ConsumerContractFactory.deploy();
  console.log("用户合约地址:", ConsumerContract.target);

  console.log("\n", "保存合约地址和ABI...");
  await saveContractBuildInfo(
    ConsumerContractFactory,
    ConsumerContract,
    ConsumerContractAttrFile,
    ConsumerContractAbiFile
  )

  // const ConsumerContractInstance = await ConsumerContract.waitForDeployment();
  // console.log("\nConsumerContractInstance: \n", ConsumerContractInstance);

  const ConsumerContractTransactionResponse = await ConsumerContract.deploymentTransaction()
  console.log("\n", "返回交易信息...");
  console.log(ConsumerContractTransactionResponse);

  const ConsumerContractTxHash = ConsumerContractTransactionResponse.hash //获取交易哈希
  const ConsumerContractTxReceipt = await provider.waitForTransaction(ConsumerContractTxHash); //等待交易完成，返回交易回执
  // const ConsumerContractTxReceipt = await provider.getTransactionReceipt(ConsumerContractTxHash); //该方法有问题，不等待直接获取回执，可能交易还未完成。
  console.log("\n", "获取交易回执...");
  console.log(ConsumerContractTxReceipt);
  console.log("\n", "用户合约部署完成...");

  console.log("\n", "所有合约部署完成...");
  console.log("预言机合约地址: ", MiniOracleContract.target);
  console.log("用户合约地址:   ", ConsumerContract.target);  
}

async function main() {

  await initSetting();
  await initialWallet();
  await makeDeploy();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { Wallet, Contract, providers } from "ethers";
import { ethers } from "hardhat";

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

const MiniOracleAttr = require(MiniOracleContractAttrFile); // 预言机合约属性
const MiniOracleAddress = MiniOracleAttr.address;           // 预言机合约地址
const MiniOracleABI = require(MiniOracleContractAbiFile);   // 预言机合约ABI

const ConsumerAttr = require(ConsumerContractAttrFile);     // 用户合约属性
const ConsumerAddress = ConsumerAttr.address;               // 用户合约地址
const ConsumerABI = require(ConsumerContractAbiFile);       // 用户合约ABI

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

async function getDataFromOracle() {

  // 创建用户合约实例
  const ConsumerContract = new ethers.Contract(ConsumerAddress, ConsumerABI, wallet);

  // 创建预言机合约实例
  const MiniOracleContract = new ethers.Contract(MiniOracleAddress, MiniOracleABI, wallet);

  // 调用预言机更新数据
  const currencyPair = "BTCUSD"
  const feedDataTx = await ConsumerContract.updatePrice(
    MiniOracleAddress,
    currencyPair,
    {
      value: ethers.parseEther("1"),
    }
  );

  // 等待交易完成
  const receipt = await feedDataTx.wait();
  console.log("\n", `请求完成, 获取交易回执: `);
  console.log(receipt);

  // 监控 DataFeedDone 事件
  console.log("\n", `正在监听，事件名：DataFeedDone事件，合约地址：${MiniOracleAddress}`);
  MiniOracleContract.once("DataFeedDone", async (requestId: number, userContractAddr: string, event) => {

    console.log("\n", `监听到DataFeedDone事件...`);
    console.log(`事件参数: requestId=${requestId}, userContractAddr=${userContractAddr}`);
    console.log(`事件对象: `, event);

    // 输出获取到的数据
    const price = await ConsumerContract.price();
    console.log("\n", `价格更新...`);
    console.log(price);

  });

}

async function main() {

  await initSetting();
  await initialWallet();
  await getDataFromOracle();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

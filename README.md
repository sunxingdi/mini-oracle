# 预言机原理和实践

### Mini预言机原理

Mini预言机由3个部分组成：

- 用户合约
  用户合约Consumer.sol中有2个函数：
  updatePrice()函数用于调用预言机，存储请求ID。
  dataFeedBack()函数用于预言机回调，处理获取到的数据。

- 预言机合约
  预言机合约MiniOracle.sol中有3个函数：
  getData()函数用于广播RequestNotify数据请求事件，链下数据供应商会实时监听该事件。
  feedData()函数用于投喂用户数据，数据供应商调用该函数将数据发送给用户。
  withdraw()函数用于提款。

- 数据供应商dataProvider.ts
  链下数据供应商实时监听RequestNotify数据请求事件，接收到事件后，调用feedData()函数将数据发送给用户。

### Mini预言机使用步骤

1. 启动本地网络
  
   ❗若使用本地网络，执行此步，网络参数修改为--network localhost
   
   执行命令

    ```
    npx hardhat node
    ```

2. 部署预言机合约和用户合约
    
    执行命令
    ```
    npx hardhat run .\scripts\deployContract.ts --network sepolia
    ```

    日志详见：[部署合约日志](./docs/部署合约日志.md)


    sepolia测试网合约地址为：

    预言机合约地址:  0x49899ba018Fe47B7DC32d57A80fE4363a53C4fdB
    
    用户合约地址:    0x1BCBA9C7102F678927E394ac0928a59623232030

3. 数据供应商启动监听
    
    执行命令
    ```
    npx hardhat run .\scripts\dataProvider.ts --network sepolia
    ```

    日志详见：[厂商监听日志](./docs/厂商监听日志.md)    

    供应商提供价格数据为：555

4. 用户请求预言机数据
    
    执行命令
    ```
    npx hardhat run .\scripts\consumer.ts --network sepolia
    ```

    日志详见：[用户请求日志](./docs/用户请求日志.md)   

    请求完成后，可以看到状态变量price的值已修改为555。
    
    可在sepolia测试网查看状态变量和事件信息。
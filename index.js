require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const _abi = require('./Ecoin.json');
const app = express();

app.use(cors({
    origin: [process.env.ALLOWED_ORIGIN, process.env.ALLOWED_ORIGIN2],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const web3 = new Web3.Web3(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const contractAddress = "0xc1dd030230F6125D30538C167CAbEd9Fc440a91C"
const contract = new web3.eth.Contract(_abi.abi, contractAddress);
const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(signer);
web3.eth.defaultAccount = signer.address;

const sendTransact = async (method, params) => {
    const gasPrice = await web3.eth.getGasPrice();
    var tx = {from : signer.address, to : contractAddress , gas : 500000, gasPrice : gasPrice, data : method(...params).encodeABI()};
    var signedTx = await web3.eth.accounts.signTransaction(tx, signer.privateKey);
    var sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
    return sentTx;
}

app.post('/api/grant-role-minter', async (req, res)=>{
  try {
    const {account, amount} = req.body;
    
    sendTransact(contract.methods.grantRoleMinter, [account, amount]);

    res.json({
      result: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

app.post('/api/mint', async (req, res)=>{
  try {
    const {to, amount} = req.body;

    sendTransact(contract.methods.mint, [to, amount]);

    res.json({
      result: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = 3002
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});

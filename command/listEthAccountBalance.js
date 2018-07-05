'use strict'

const sprintf=require("sprintf-js").sprintf;
const Web3 = require('web3');
var web3 = new Web3();

let WalletCore = require('wanchain-crosschain');
let config = require('../config.js');
let backend;

async function main(){

    let wanchainwalletcore = new WalletCore(config);
    await wanchainwalletcore.init(config);
    backend = wanchainwalletcore.be;

    // eth address list
    let ethAddressList = [];
    try {
        ethAddressList = await backend.getEthAccountsInfo(backend.ethSender);

        console.log(sprintf("%46s %26s", "ETH address", "balance"));
        ethAddressList.forEach(function(ethAddress){
            console.log(sprintf("%46s %26s", ethAddress.address, web3.fromWei(ethAddress.balance)));
        });

    }catch(err) {
        console.log("listEthAddr error: ", err);
    }
    process.exit();
}

main();




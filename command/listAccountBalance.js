'use strict'

const sprintf=require("sprintf-js").sprintf;
const Web3 = require('web3');
var web3 = new Web3();

let WalletCore = require('wanchainwalletcore');
let config = require('../config.js');
let backend;

async function main(){
    let wanchainwalletcore = new WalletCore(config);
    await wanchainwalletcore.init(config);
    backend = wanchainwalletcore.be;

    // eth address list
    let ethAddressList = [];
    try {
        let sender = await backend.createrSender("ETH");
        ethAddressList = await backend.getEthAccountsInfo(sender);
        sender.close();

        console.log(sprintf("%46s %20s", "ETH address", "balance"));
        ethAddressList.forEach(function(ethAddress){
            console.log(sprintf("%46s %20s", ethAddress.address, web3.fromWei(ethAddress.balance)));
        });

    }catch(err) {
        console.log("listEthAddr error: ", err);
    }

    // wan address list
    let wanAddressList = [];
    try {
        let sender = await backend.createrSender("WAN");
        wanAddressList = await backend.getWanAccountsInfo(sender);
        sender.close();

        // console.log(sprintf("%46s %20s", "WAN address", "balance"));
        console.log(sprintf("%46s %26s %26s", "WAN address", "WAN balance", "WETH balance"));
        wanAddressList.forEach(function(wanAddress){
            console.log(sprintf("%46s %26s %26s", wanAddress.address, web3.fromWei(wanAddress.balance), web3.fromWei(wanAddress.wethBalance)));
        });

    }catch(err) {
        console.log("listWanAddr error: ", err);
    }

    process.exit();
}

main();




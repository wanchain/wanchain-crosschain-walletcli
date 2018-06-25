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

    // wan address list
    let wanAddressList = [];
    try {
        let sender = await backend.createrSender("WAN");
        wanAddressList = await backend.getWanAccountsInfo(sender);
        sender.close();

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




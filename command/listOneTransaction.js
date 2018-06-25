'use strict'

const sprintf=require("sprintf-js").sprintf;

let WalletCore = require('wanchain-crosschain');
let config = require('../config.js');
let backend;



 function listDetail(option){
    try {

        let records = backend.getTxHistory(option);
        console.log('records:',records);
        return records;
    }catch(err) {
        return null;
        console.error("listEthAddr error: ", err);
    }

}

async function main(){
    let wanchainwalletcore = new WalletCore(config);
    await wanchainwalletcore.init(config);
    backend = wanchainwalletcore.be;

    if(process.argv.length == 3){
        let option = {'HashX': process.argv[2]};
        return listDetail(option);
    }else{
        console.error("Please input current param.");
        return null;
    }
    process.exit();
}

main();




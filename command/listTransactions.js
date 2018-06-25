'use strict'

const sprintf=require("sprintf-js").sprintf;
let WalletCore = require('wanchain-crosschain');

let backend;
let config = require('../config.js');


function listDetail(option){
    let records = backend.getTxHistory(option);
    console.log(records);
}
function listBried(){
    let records = backend.getTxHistory();
    //console.log(records);
    console.log(sprintf("%46s %46s %10s %66s %20s", "from Address", "receive Address", "value","HashX", "status"));
    for(let i=0; i<records.length; i++){
        console.log(sprintf("%46s %46s %10s %66s %20s", records[i].from, records[i].crossAdress, records[i].value,records[i].HashX, records[i].status));

    }

}


async function main(){
    console.log("Ctrl C to exit.");
    let wanchainwalletcore = new WalletCore(config);
    await wanchainwalletcore.init(config);
    backend = wanchainwalletcore.be;

    setInterval(function(){
        if(process.argv.length == 3){
            let option = {'HashX': process.argv[2]};
            listDetail(option);
        }else{
            listBried();
        }
        console.log();
    }, 10000);







}

main();
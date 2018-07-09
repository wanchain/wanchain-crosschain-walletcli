'use strict'

const sprintf=require("sprintf-js").sprintf;
let WalletCore = require('wanchain-crosschain');

let backend;
let config = require('../config.js');
let col = require('colors');
let tsf = require('./tranStatusFactory.js');  // tsf:  trans status factory.

function listDetail(option){
    let records = backend.getTxHistory(option);
    console.log(records);
}
function listBried(){
    let records = backend.getTxHistory();
    for(let i=0; i<records.length; i++){

        //console.log(records[i]);
        let status      = tsf[records[i].status][0];
        let statusColor = tsf[records[i].status][1];
        /*
        let dot         = '.';
        console.log("status, statusColor", status, statusColor);
        let  colorStr = eval("`'${status}'`+`${dot}`+`${statusColor}`");
        console.log(colorStr.green);
        */
        console.log(sprintf("%46s\t%46s","HashX:",records[i].HashX));
        switch(statusColor)
        {
            case "grey":
                console.log(sprintf("%46s\t%46s","Status:",`${status}`.grey));
                break;
            case "cyan":
                console.log(sprintf("%46s\t%46s","Status:",`${status}`.cyan));
                break;
            case "green":
                console.log(sprintf("%46s\t%46s","Status:",`${status}`.green));
                break;
            case "red":
                console.log(sprintf("%46s\t%46s","Status:",`${status}`.red));
                break;
            case "blue":
                console.log(sprintf("%46s\t%46s","Status:",`${status}`.blue));
                break;
            default:
                console.log(sprintf("%46s %46s %10s %66s %20s",
                    records[i].from,
                    records[i].crossAdress,
                    records[i].value,
                    records[i].HashX,
                    `${status}`));

        }

        console.log(sprintf("%46s\t%46s","from Address:",records[i].from));
        console.log(sprintf("%46s\t%46s","receive Address:",records[i].crossAdress));
        console.log(sprintf("%46s\t%46s","value:",records[i].value));
        console.log("\n");
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

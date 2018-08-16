'use strict';

const loki = require('lokijs');
const path = require('path');

let btcDbPath = process.env.HOME;
if (process.platform === 'darwin') {
    btcDbPath = path.join(btcDbPath, '/Library/bitcoin/testnet/db/');
}else if (process.platform === 'win32') {
    btcDbPath = path.join(process.env.APPDATA, 'bitcoin/testnet/db\\');
} else {
    btcDbPath = path.join(btcDbPath, '.bitcoin/testnet/db/');
}

let db = new loki(path.join(btcDbPath, 'btc.db'),{
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
});

async function main() {
    let btcAddress = db.getCollection("btcAddress");
    let result = btcAddress.find();

    for(let i=0; i<result.length; i++){
        console.log('address: ', result[i].address);
// console.log('encryptedKey: ', result[i].encryptedKey)
    }

    db.close();

}

async function databaseInitialize() {
    let btcAddress = db.getCollection("btcAddress");
    if (!btcAddress) {
        btcAddress = db.addCollection("btcAddress");
    }

    await main();
}

if(process.argv.length !== 2) {
    console.log("usage: node  listBtcAccount.js");
    process.exit(0)
}

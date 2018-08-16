'use strict';

const bitcoin  = require('bitcoinjs-lib');
const wif = require('wif');
const bip38 = require('bip38');
const loki = require('lokijs');
const path = require('path');

let bitcoinNetwork = bitcoin.networks.testnet;
let version = 0xef;

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

async function decryptedWIF(encrypted, pwd) {
    let decryptedKey = await bip38.decrypt(encrypted, pwd);
    let privateKeyWif = await wif.encode(version, decryptedKey.privateKey, decryptedKey.compressed);

    return privateKeyWif;
}

async function getECPairArray(encryptedKeyResult) {
    let ECPairArray = [];
    try {
        for(let i=0; i<encryptedKeyResult.length; i++){
            let privateKeyWif = await decryptedWIF(encryptedKeyResult[i].encryptedKey, process.argv[2]);
            let alice = await bitcoin.ECPair.fromWIF(privateKeyWif, bitcoinNetwork);
            ECPairArray.push(alice);
        }

        return ECPairArray;
    } catch (err) {
        if (err.code === 'ERR_ASSERTION') {
            console.log('password wrong!');
        } else {
            console.log('err: ', err);
        }

        process.exit(0)
    }

}

async function main() {
    let btcAddress = db.getCollection("btcAddress");
    let result = btcAddress.find();
    db.close();

    let ECPairArray = await getECPairArray(result);

    console.log(ECPairArray);
}

async function databaseInitialize() {
    let btcAddress = db.getCollection("btcAddress");
    if (!btcAddress) {
        btcAddress = db.addCollection("btcAddress");
    }

    await main();
}

if(process.argv.length !== 3) {
    console.log("usage: node  ecPairArray.js password");
    process.exit(0)
}


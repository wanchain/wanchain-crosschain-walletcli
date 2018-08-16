'use strict';

const bitcoin  = require('bitcoinjs-lib');
const crypto = require('crypto');
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

async function genBip38Wallet(pwd) {
    try {
        let btcAddress = db.getCollection("btcAddress");
        let result = btcAddress.get(1);

        if (result) {
            let encryptedKey = result.encryptedKey;
            await decryptedWIF(encryptedKey, pwd);
        }

        const keyPair = bitcoin.ECPair.makeRandom({network: bitcoinNetwork, rng: () => Buffer.from(crypto.randomBytes(32))});
        const { address } = await bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoinNetwork });
        const privateKey = keyPair.toWIF();
        const decoded = wif.decode(privateKey, version);
        const encrypted = await bip38.encrypt( decoded.privateKey, decoded.compressed, pwd);

        return [address, encrypted]
    } catch (err) {
        if (err.code === 'ERR_ASSERTION') {
            console.log('password wrong!');
        } else {
            console.log('err: ', err);
        }

        process.exit(0)
    }
}

async function saveAddress(address, encryptedKey) {

    let btcAddress = db.getCollection("btcAddress");
    btcAddress.insert({address: address, encryptedKey: encryptedKey});

    db.save();

    console.log('address: ', address);
    console.log("Success: Do not share your password with anyone and keep it somewhere safe.")

    db.close();
}

async function main() {
    let btcWallet = await genBip38Wallet(process.argv[2]);

    let address = btcWallet[0];
    let encryptedKey = btcWallet[1];

    await saveAddress(address, encryptedKey);
}

async function databaseInitialize() {
    let btcAddress = db.getCollection("btcAddress");
    if (!btcAddress) {
        btcAddress = db.addCollection("btcAddress");
    }

    await main();
}

if(process.argv.length !== 3) {
    console.log("usage: node  createBtcAddress.js password");
    process.exit(0)
}





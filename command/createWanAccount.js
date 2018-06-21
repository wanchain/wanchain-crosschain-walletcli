#!/usr/bin/env node

'use strict'

const fs = require('fs');
const path = require('path');
const config = require('../config.js');


const keythereum = require("keythereum");
keythereum.constants.quiet = true;
const wanUtil = require('wanchain-util');

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
mkdirsSync(config.wanKeyStorePath);

if(process.argv.length != 3) {
    console.log("usage: node  createWanAccount.js password")
    process.exit(0)
}
let keyPassword = process.argv[2];

let params = { keyBytes: 32, ivBytes: 16 };
let options = {
  kdf: "scrypt",
  cipher: "aes-128-ctr",
  kdfparams: {
    n: 262144,
    dklen: 32,
    prf: "hmac-sha256"
  }
};
let dk = keythereum.create(params);
let keyObject = keythereum.dump(keyPassword, dk.privateKey, dk.salt, dk.iv, options);

let dk2 = keythereum.create(params);
let keyObject2 = keythereum.dump(keyPassword, dk2.privateKey, dk2.salt, dk2.iv, options);
keyObject.crypto2 = keyObject2.crypto

keyObject.waddress = wanUtil.generateWaddrFromPriv(dk.privateKey, dk2.privateKey).slice(2)
keythereum.exportToFile(keyObject, config.wanKeyStorePath);
console.log("Your address is 0x"+keyObject.address);





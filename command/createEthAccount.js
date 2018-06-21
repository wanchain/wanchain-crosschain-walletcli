#!/usr/bin/env node

'use strict'

const fs = require('fs');
const path = require('path');
const keythereum = require("keythereum");

let config = require('../config.js');

keythereum.constants.quiet = true;

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
mkdirsSync(config.ethKeyStorePath);

if(process.argv.length != 3) {
    console.log("usage: node createEthAccount.js password")
    process.exit(0)
}

let keyPassword = process.argv[2];


let params = { keyBytes: 32, ivBytes: 16 };
let dk = keythereum.create(params);
let options = {
  kdf: "scrypt",
  cipher: "aes-128-ctr",
  kdfparams: {
    n: 262144,
    dklen: 32,
    prf: "hmac-sha256"
  }
};
let keyObject = keythereum.dump(keyPassword, dk.privateKey, dk.salt, dk.iv, options);


keythereum.exportToFile(keyObject,config.ethKeyStorePath);
console.log("Your address is 0x"+keyObject.address);





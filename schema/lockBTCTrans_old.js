'use strict';

let prompt = require('prompt');
let colors = require("colors/safe");
let lockBTCTransSchema = require('../schema/lockBTCTrans');

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");


prompt.get(lockBTCTransSchema, function (err, result) {
    let passwd;
    let value;

    try {
        passwd = result.walletPassword;
        value = result.amount;
    } catch (e) {
        console.log('err: ',e);
        process.exit(1);
    }
});


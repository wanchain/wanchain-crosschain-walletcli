'use strict';

let WanchainCore = require('wanchain-crosschain');
const bitcoin  = require('bitcoinjs-lib');
const Client = require('bitcoin-core');
const config = require('../config.js');
const pu = require('promisefy-util');
const assert = require('chai').assert;

let client;

let wanchainCore;
let ccUtil;
let btcUtil;
describe('btc cli test', ()=>{
    before(async ()=>{
        wanchainCore = new WanchainCore(config);
        ccUtil = wanchainCore.be;
        btcUtil = wanchainCore.btcUtil;
        await wanchainCore.init(config);
        client = ccUtil.client;
        console.log("start");
    });

    it('TC001: create new bitcoin address', async ()=>{
        // mocha --timeout 100000 test.js
        let newAddress = await btcUtil.createAddress('1234567890');
        console.log('newAddress: ', newAddress);
    });

    after('end', async ()=>{
        wanchainCore.close();
    })
});


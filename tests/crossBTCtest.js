'use strict';

let WanchainCore = require('wanchain-crosschainbtc');
const bitcoin  = require('bitcoinjs-lib');
const Client = require('bitcoin-core');
const config = require('../config.js');
const pu = require('promisefy-util');
const assert = require('chai').assert;

let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

let client;
let wanchainCore;
let ccUtil;
let btcUtil;

let passwd;
let toBtcAddress;
let btcArray;
let aliceAddr = [];
let utxos;
let btcBalance;
let keyPairArray;
let normalSendAmount;

describe('btc cli test', ()=>{
    before(async ()=>{
        wanchainCore = new WanchainCore(config);
        ccUtil = wanchainCore.be;
        btcUtil = wanchainCore.btcUtil;
        await wanchainCore.init(config);
        client = ccUtil.client;

        //change for yourself
        passwd = '1234567890';
        toBtcAddress = '2N9vyH7SoJrYaLDJUfdaoTRxXZKy2YRPM5G';
        normalSendAmount = 0.01;

        console.log("start");
    });

    it('TC001: createBtcAddress and listBtcAddress', async ()=>{
        // mocha --timeout 100000 test.js
        btcArray = await btcUtil.getAddressList();

        if (btcArray.length > 0) {
            let addr = btcArray[btcArray.length -1];
            try {
                await btcUtil.decryptedWIF(addr['encryptedKey'], passwd);
                assert.equal(1, 1)
            } catch (e) {
             assert.equal(0, 1);
            }
        } else {
            let newAddress = await btcUtil.createAddress(passwd);

            setTimeout(async () => {
                let addressList = await btcUtil.getAddressList();
                let addr = addressList[addressList.length -1]['address'];

                assert.equal(newAddress.address, addr);
            }, 1000);
        }
    });

    it('TC002: sendBtcToAddress', async ()=>{

        for (let i=0;i<btcArray.length; i++) {
            aliceAddr.push(btcArray[i].address)
        }

        // btc balance
        utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, config.MIN_CONFIRM_BLKS, config.MAX_CONFIRM_BLKS, aliceAddr);
        let result = await ccUtil.getUTXOSBalance(utxos);
        console.log('========');
        btcBalance = web3.toBigNumber(result).div(100000000);

        if (btcBalance > normalSendAmount) {
            keyPairArray = await btcUtil.getECPairs(passwd);

            let target = {
                address: toBtcAddress,
                value: web3.toBigNumber(normalSendAmount).mul(100000000)
            };


            let {rawTx, fee} = await ccUtil.btcBuildTransaction(utxos, keyPairArray, target, config.feeRate);
            if (!rawTx) {
                assert.equal(0, 1);
            }

            let hash = await ccUtil.sendRawTransaction(ccUtil.btcSender, rawTx);
            console.log('result hash:', hash);
        } else {
            console.log('btcBalance <= normalSendAmount');
        }
    });

    it('TC003: lockBtc', async () => {

    });

    after('end', async ()=>{
        wanchainCore.close();
    })
});


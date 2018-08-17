#!/usr/bin/env node

const WanchainCore = require('wanchain-crosschain');
const config = require('./config.js');
let wanchainCore;
let ccUtil;
let btcUtil;
const bitcoin  = require('bitcoinjs-lib');
const Client = require('bitcoin-core');
const pu = require('promisefy-util');
const assert = require('chai').assert;
const Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const client = new Client(config.btcServer.regtest);
const feeRate = 55;

const vorpal = require('vorpal')();
// setInterval(function(){
//     console.log("update backend")
// }, 9000);

vorpal
    .command('foo', 'Outputs "bar".')
    .action(function(args, callback) {
    this.log('bar');
    callback();
    });

vorpal
    .command('listBtcStoreman', 'list btc storeman')
    .action(function(args, callback) {
        this.log('bar');
        callback();
    });



// for test information.
let lastContract;
let lastTxid;
const value = 1;
const value2 = 2;
const secret = 'LgsQ5Y89f3IVkyGJ6UeRnEPT4Aum7Hvz';
const commitment = 'bf19f1b16bea379e6c3978920afabb506a6694179464355191d9a7f76ab79483';
const storemanHash160 = Buffer.from('d3a80a8e8bf8fbfea8eee3193dc834e61f257dfe', 'hex');
const storemanHash160Addr = "0xd3a80a8e8bf8fbfea8eee3193dc834e61f257dfe";
const storemanWif = 'cQrhq6e1bWZ8YBqaPcg5Q8vwdhEwwq1RNsMmv2opPQ4fuW2u8HYn';
var storeman = bitcoin.ECPair.fromWIF(
    storemanWif, bitcoin.networks.testnet
);
var alice = bitcoin.ECPair.fromWIF(
    'cPbcvQW16faWQyAJD5sJ67acMtniFyodhvCZ4bqUnKyjataXKLd5', bitcoin.networks.testnet
);
const userWanAddr = "0xbd100cf8286136659a7d63a38a154e28dbf3e0fd";
const aliceAddr = getAddress(alice);
const aliceHash160Addr = bitcoin.crypto.hash160(storeman.publicKey).toString('hex');
const storemanAddr = getAddress(storeman);

function selectUtxoTest(utxos, value) {
    let utxo;
    for(let i=0; i<utxos.length; i++){
        if(utxos[i].amount >= value){
            utxo = utxos[i];
            console.log("find utxo:", utxo);
            return utxo;
        }
    }
    console.log("can't find");
    return null;
}
function getAddress(keypair){
    const pkh = bitcoin.payments.p2pkh({pubkey: keypair.publicKey, network: bitcoin.networks.testnet});
    return pkh.address;
}


async function fundHtlcTest(){
    let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, 0, 10000000, [aliceAddr]);
    console.log("utxos: ", utxos);

    let utxo = selectUtxoTest(utxos, value2);
    if(!utxo){
        console.log("############## no utxo");
        return;
    }
    console.log("utxo: ", utxo);

    // generate script and p2sh address
    let blocknum = await ccUtil.getBlockNumber(ccUtil.btcSender);
    const lockTime = 1000;
    let redeemLockTimeStamp = blocknum + lockTime;
    let x = btcUtil.generatePrivateKey().slice(2); // hex string without 0x
    let hashx = bitcoin.crypto.sha256(Buffer.from(x, 'hex')).toString('hex');
    console.log("############### x:",x);
    console.log("############### hashx:",hashx);

    let contract = await btcUtil.hashtimelockcontract(hashx, redeemLockTimeStamp, storemanHash160,aliceHash160Addr);
    lastContract = contract;
    lastContract.x = x;
    const txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);
    txb.setVersion(1);
    txb.addInput(utxo.txid, utxo.vout);
    txb.addOutput(contract['p2sh'], value*100000000); // fee is 1
    txb.sign(0, alice);

    const rawTx = txb.build().toHex();
    console.log("rawTx: ", rawTx);

    let result = await ccUtil.sendRawTransaction(ccUtil.btcSender,rawTx);
    console.log("result hash:", result);
    return result;
}
vorpal
    .command('lockWbtcTest', "lock  wbtc")
    .action(async function(args,callback) {
        let wdTx = {};
        wdTx.storemanGroup = storemanHash160Addr;
        tx.hashx = lastContract.hashx;
        tx.txhash = lastTxid;
        tx.lockedTimestamp = lastContract.redeemblocknum;
        tx.gas = '1000000';
        tx.gasPrice = '200000000000'; //200G;
        tx.passwd='wanglu';
        wdTx.from = "0xbd100cf8286136659a7d63a38a154e28dbf3e0fd";
        wdTx.amount = 1;
        //newTrans.createTransaction(tx.from, config.wanchainHtlcAddr, tx.amount.toString(),tx.storemanGroup,tx.cross,tx.gas,this.toGweiString(tx.gasPrice.toString()),'WETH2ETH',tx.nonce);
        let wdHash = await ccUtil.sendWanHash(ccUtil.wanSender, wdTx);
        console.log("wdHash: ",wdHash);
    });
function XXXsendDepositX(wanSender, userWanAddr,gas,gasPrice,x, passwd){

}
vorpal
    .command('ttt', "lock  wbtc")
    .action(async function(args,callback) {
        const tx = {};
        tx.storeman = storemanHash160Addr;
        tx.userWanAddr = "0xbd100cf8286136659a7d63a38a154e28dbf3e0fd";
        let x = "45212e642c133049fc4377dfc84938fc6d1bd9a3bb6921ea96464d7e26352ee5";
        let vHashx = bitcoin.crypto.sha256(Buffer.from(x,'hex')).toString('hex');
        tx.hashx = vHashx;
        tx.gas = '1000000';
        tx.gasPrice = '200000000000'; //200G;
        tx.passwd='wanglu';

        console.log("x:",x);
        console.log("vHashx:", vHashx);
        let redeemHash = await ccUtil.sendDepositX(ccUtil.wanSender, tx.userWanAddr,tx.gas,tx.gasPrice,x, tx.passwd);
        console.log("redeemHash: ", redeemHash);
    });
vorpal
    .command('lockBtcTest', "lock btc to wbtc")
    .action(async function(args,callback) {
        await client.sendToAddress(aliceAddr, 2);
        await client.generate(1);
        let txhash = await fundHtlcTest();
        //let btcTx = await btcUtil.btc2wbtcLock(btcUtil.getECPairs(), 2, feeRate, storemanHash160Addr);
        lastTxid = txhash;
        const tx = {};
        tx.storeman = storemanHash160Addr;
        tx.userWanAddr = "0xbd100cf8286136659a7d63a38a154e28dbf3e0fd";
        tx.hashx = '0x'+lastContract.hashx;
        tx.txhash = lastTxid;
        tx.lockedTimestamp = lastContract.redeemblocknum;
        tx.gas = '1000000';
        tx.gasPrice = '200000000000'; //200G;
        tx.passwd='wanglu';
        console.log("######## tx.hashx: ", tx.hashx);
        let txHash = await ccUtil.sendWanNotice(ccUtil.wanSender, tx);
        console.log("sendWanNotice txHash:", txHash);

        //wait storeman lock
        console.log("check storeman lock tx");
        while(1){
            let crossEvent = await ccUtil.getDepositCrossLockEvent(ccUtil.wanSender, tx.hashx);
            console.log(crossEvent);
            if(crossEvent.length == 0){
                console.log("wait...");
                await pu.sleep(10000);
            }
            else{
                break;
            }
        }
        // sendDepositX(sender, from,gas,gasPrice,x, passwd, nonce)
        console.log("x: ", lastContract.x);
        let redeemHash = await ccUtil.sendDepositX(ccUtil.wanSender, tx.userWanAddr,tx.gas,tx.gasPrice,'0x'+lastContract.x, tx.passwd);
        console.log("redeemHash: ", redeemHash);
        // check the utxo is received.
        // async _verifyBtcUtxo(storemanAddr, txHash, xHash, lockedTimestamp)
        // let amount = await ccUtil._verifyBtcUtxo(storemanHash160, txhash, commitment, lastContract.lockedTlimestamp);
        // console.log("amount:   ", amount);
        // await pu.sleep(20000);
        // console.log( await web3.eth.getTransactionReceipt(txHash));
        callback();
    });
// vorpal
// 	.command('lockBtc', "lock btc to wbtc")
// 	.action(function(args,callback){
// 		var self = this;
//
// 		var promise = this.prompt([
// 			{
// 				type: 'input',
// 				name: 'storeman',
// 				message: 'storeman(d3a80a8e8bf8fbfea8eee3193dc834e61f257dfe): '
// 			},
// 			{
// 				type: 'input',
// 				name: 'amount',
// 				message: 'amount: '
// 			},
//             {
//                 type: 'input',
//                 name: 'userWanAddr',
//                 message: 'your wanchain address: '
//             },
//             {
//                 type: 'password',
//                 name: 'password',
//                 message: 'Btc wallet Password: '
//             }
//             ], function (answers) {
// 			// You can use callbacks...
// 		});
//
// 		promise.then(async function(answers) {
// 			// Or promises!
// 			console.log("storeman:", answers.storeman);
//             console.log("amount:", answers.amount);
//             let keyPairArray = btcUtil.getECPairs(answers.password);
//             //let hash = await ccUtil.btc2wbtcLock(keyPairArray,answers.amount,0,answers.storeman);
//             let hash = "this is a test hash";
//             console.log("hash: ", hash);
//             // notice wanchain.
//             const tx = {};
//             tx.storeman = answers.storeman;
//             tx.userWanAddr = answers.userWanAddr;
//             tx.hashx='0x0011223344';
//             tx.txhash = hash;
//             tx.lockedTimestamp = 1234567;
//             tx.gas = '1000000';
//             tx.gasPrice = '200000000000'; //200G;
//             tx.passwd='wanglu';
//             let txHash = await ccUtil.sendWanNotice(ccUtil.wanSender, tx);
//             console.log(txHash);
//
//             callback();
// 		});
// 	});
vorpal
    .delimiter('wallet$')
    .show();

async function main(){
    wanchainCore = new WanchainCore(config);
    ccUtil = wanchainCore.be;
    btcUtil = wanchainCore.btcUtil;
    await wanchainCore.init(config);

    vorpal
        .delimiter('wallet$')
        .show();
}
main();



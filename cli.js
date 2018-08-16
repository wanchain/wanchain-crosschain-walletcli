#!/usr/bin/env node

const WanchainCore = require('wanchain-crosschain');
const config = require('./config.js');
let wanchainCore;
let ccUtil;
let btcUtil;

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

vorpal
	.command('lockBtc', "lock btc to wbtc")
	.action(function(args,callback){
		var self = this;

		var promise = this.prompt([
			{
				type: 'input',
				name: 'storeman',
				message: 'storeman(d3a80a8e8bf8fbfea8eee3193dc834e61f257dfe): '
			},
			{
				type: 'input',
				name: 'amount',
				message: 'amount: '
			},
            {
                type: 'input',
                name: 'userWanAddr',
                message: 'your wanchain address: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'Btc wallet Password: '
            }
            ], function (answers) {
			// You can use callbacks...
		});

		promise.then(async function(answers) {
			// Or promises!
			console.log("storeman:", answers.storeman);
            console.log("amount:", answers.amount);
            let keyPairArray = ccUtil.getECPairs(answers.password);
            let hash = await ccUtil.btc2wbtcLock(keyPairArray,answers.amount,0,answers.storeman);
            //let hash = "this is a test hash";
            console.log("hash: ", hash);
            // notice wanchain.
            const tx = {};
            tx.storeman = '0xd3a80a8e8bf8fbfea8eee3193dc834e61f257dfe';
            tx.userWanAddr = '0xbd100cf8286136659a7d63a38a154e28dbf3e0fd';
            tx.hashx='0x0011223344';
            tx.txhash = '0x0011223344';
            tx.lockedTimestamp = 1234567;
            tx.gas = '1000000';
            tx.gasPrice = '200000000000'; //200G;
            tx.passwd='wanglu';
            let txHash = await ccUtil.sendWanNotice(ccUtil.wanSender, tx);
            console.log(txHash);

            callback();
		});
	});
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



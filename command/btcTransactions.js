let WanchainCore = require('wanchain-crosschain');
let config = require('../config.js');
let vorpal = require('vorpal')();
let sprintf=require("sprintf-js").sprintf;

let print4log = console.log;

let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// create bitcoin address
vorpal
    .command('createNewAddress', "create new bitcoin address")
    .action(function(args,callback) {
        let self = this;

        let promise = this.prompt([
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
            let newAddress;
            try{
                newAddress = await btcUtil.createAddress(answers.password);
                print4log('new address: ',newAddress.address);
            } catch (e) {
                print4log('create btc address error: ', e)
            }

            callback();
        })
    });

// addressList
vorpal
    .command('addressList', "get bitcoin address list")
    .action(async function(args,callback) {
        let addressList;

        try{
            addressList = await btcUtil.getAddressList();

            print4log("address");
            addressList.forEach(function(Array){
                print4log(Array.address);
            });

        } catch (e) {
            print4log('get bitcoin address list error: ', e)
        }

        callback();
    });

// getBalance
vorpal
    .command('btcBalance', "get bitcoin address balance")
    .action(async function(args,callback) {
        let addressList;

        try{
            addressList = await btcUtil.getAddressList();

            let aliceAddr = [];
            for (let i=0;i<addressList.length; i++) {
                aliceAddr.push(addressList[i].address)
            }

            let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, 0, 1000, aliceAddr);
            let result = await ccUtil.getUTXOSBalance(utxos);
            print4log('btc bancale: ', web3.toBigNumber(result).div(100000000).toString());

        } catch (e) {
            print4log('get bitcoin address balance error: ', e)
        }

        callback();
    });

// getWbtcBalance
vorpal
    .command('wbtcBalance', "get wbtc address balance")
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

            print4log(sprintf("%46s %26s", "WAN address", "WBTC balance"));
            wanAddressList.forEach(function(wanAddress){
                // web3.fromWei(wanAddress.balance),
                print4log(sprintf("%46s %26s", wanAddress.address, web3.toBigNumber(wanAddress.wethBalance).div(100000000)));
            });

        }catch(err) {
            print4log("listWanAddr error: ", err);
        }

        callback();
    });

// getWanBalance
vorpal
    .command('wanBalance', "get wan address balance")
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

            print4log(sprintf("%46s %26s", "WAN address", "balance"));
            wanAddressList.forEach(function(wanAddress){
                // web3.fromWei(wanAddress.balance),
                print4log(sprintf("%46s %26s", wanAddress.address,  web3.fromWei(wanAddress.balance)));
            });

        }catch(err) {
            print4log("listWanAddr error: ", err);
        }

        callback();
    });

// bitcoin normal transaction
vorpal
	.command('normalTransaction', "bitcoin normal transaction")
	.action(function(args,callback){
		let self = this;

		let promise = this.prompt([
			{
				type: 'input',
				name: 'amount',
				message: 'amount: '
			},
            {
                type: 'input',
                name: 'rate',
                message: 'Fee Rate: '
            },
            {
                type: 'input',
                name: 'to',
                message: 'to: '
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
            let keyPairArray;

            try {
                keyPairArray = await btcUtil.getECPairs(answers.password);

                let target = {
                    address: answers.to,
                    value: web3.toBigNumber(answers.amount).mul(100000000)
                };

                let res = await ccUtil.btcTxBuildSendWallet(keyPairArray, target, answers.rate);

                if (res.error !== undefined) {
                    print4log('error send transaction');
                }

                print4log('txid: ' + res.result);
            } catch (e) {
                print4log("bitcoin normal transaction error: ", err);
            }

            callback();
		});
	});

// list all transactions
vorpal
    .command('listTransaction', "get all transasction")
    .action(async function(args,callback) {
        let addressList;

        try{
            addressList = await btcUtil.getAddressList();

            print4log("transactions");
            addressList.forEach(function(Array){
                print4log(Array.address);
            });

        } catch (e) {
            print4log('get bitcoin transaction list error: ', e)
        }

        callback();
    });

// list all storeman
vorpal
    .command('listStoreman', "get all storeman")
    .action(async function(args,callback) {
        let addressList;

        try{
            addressList = await btcUtil.getAddressList();

            print4log("transactions");
            addressList.forEach(function(Array){
                print4log(Array.address);
            });

        } catch (e) {
            print4log('get bitcoin transaction list error: ', e)
        }

        callback();
    });

// lockBtc
vorpal
    .command('lockBtc', "crosschain lockBtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'btcAddress',
                message: 'btcAddress: '
            },
            {
                type: 'input',
                name: 'wanAddress',
                message: 'wanAddress: '
            },
            {
                type: 'input',
                name: 'amount',
                message: 'amount: '
            },
            {
                type: 'input',
                name: 'rate',
                message: 'Fee Rate: '
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
            print4log('btcAddress', answers.btcAddress);
            print4log('wanAddress', answers.wanAddress);
            print4log('amount', answers.amount);
            print4log('rate', answers.rate);
            print4log('password', answers.password);

            callback();
        });
    });

// redeemBtc

// revokeBtc

// lockwbtc

// redeemWbtc

// revokeWbtc

async function main(){
    wanchainCore = new WanchainCore(config);
    ccUtil = wanchainCore.be;
    btcUtil = wanchainCore.btcUtil;
    await wanchainCore.init(config);

    vorpal
        .delimiter('wanWallet$')
        .show();
}

main();

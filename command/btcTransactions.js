let WanchainCore = require('wanchain-crosschain');
let config = require('../config.js');
let vorpal = require('vorpal')();
let sprintf=require("sprintf-js").sprintf;
let btcConfig = require('./btcUtils/btcConfig');
let btcScripts = require('./btcUtils/btcScripts');

let print4log = console.log;

let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// create bitcoin address
vorpal
    .command('createNewAddress', btcConfig.createNewAddress.desc)
    .cancel(() => {
        process.exit(0)
    })
    .action(function(args,callback) {
        let self = this;

        let promise = this.prompt([
            { type: btcConfig.passwd.type, name: btcConfig.passwd.name, message: btcConfig.passwd.message}
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            if (btcScripts.checkPasswd(answers[btcConfig.passwd.type])) {
                let newAddress;
                try{
                    newAddress = await btcUtil.createAddress(answers[btcConfig.passwd.name]);
                    print4log('new address: ',newAddress.address);
                } catch (e) {
                    print4log('create btc address error')
                }
            }

            callback();
        })
    });

// addressList
vorpal
    .command('addressList', btcConfig.addressList.desc)
    .action(async function(args,callback) {
        let addressList;

        try{
            addressList = await btcUtil.getAddressList();

            print4log("address");
            addressList.forEach(function(Array){
                print4log(Array.address);
            });

        } catch (e) {
            print4log('get bitcoin address list error')
        }

        callback();
    });

// getBalance
vorpal
    .command('btcBalance', btcConfig.btcBalance.desc)
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
            print4log('get bitcoin address balance error')
        }

        callback();
    });

// getWbtcBalance
vorpal
    .command('wbtcBalance', btcConfig.wbtcBalance.desc)
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

            print4log(sprintf("%46s %26s", "WAN address", "WBTC balance"));
            wanAddressList.forEach(function(wanAddress){
                print4log(sprintf("%46s %26s", wanAddress.address, web3.toBigNumber(wanAddress.wethBalance).div(100000000)));
            });

        }catch(err) {
            print4log("listWanAddr error");
        }

        callback();
    });

// getWanBalance
vorpal
    .command('wanBalance', btcConfig.wanBalance.desc)
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

            print4log(sprintf("%46s %26s", "WAN address", "balance"));
            wanAddressList.forEach(function(wanAddress){
                print4log(sprintf("%46s %26s", wanAddress.address,  web3.fromWei(wanAddress.balance)));
            });

        }catch(err) {
            print4log("listWanAddr error");
        }

        callback();
    });

// list all storeman
vorpal
    .command('listStoreman', btcConfig.listStoreman.desc)
    .action(async function(args,callback) {

        try{
            let smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
            smgs.forEach(function(Array, index){
                print4log(config.consoleColor.COLOR_FgRed, '====== storeman ' + (index + 1) + ' ====== ', '\x1b[0m');
                for(let name in Array){
                    console.log(name + ':' + Array[name]);
                }
            });

        } catch (e) {
            print4log('get bitcoin transaction list error')
        }

        callback();
    });


// bitcoin normal transaction
vorpal
	.command('normalTransaction', btcConfig.normalTransaction.desc)
    .cancel(() => {
        process.exit(0)
    })
	.action(function(args,callback){

		let promise = this.prompt([
            { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message},
            { type: btcConfig.to.type, name: btcConfig.to.name, message: btcConfig.to.message},
            { type: btcConfig.passwd.type, name: btcConfig.passwd.name, message: btcConfig.passwd.message},
            ]);

		promise.then(async function(answers) {
            let btcBalance;
		    if (btcScripts.checkBalance(answers[btcConfig.amount.name], null)) {
                let addressList;
                try{
                    addressList = await btcUtil.getAddressList();

                    let aliceAddr = [];
                    for (let i=0;i<addressList.length; i++) {
                        aliceAddr.push(addressList[i].address)
                    }

                    let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, 0, 1000, aliceAddr);
                    let result = await ccUtil.getUTXOSBalance(utxos);

                    btcBalance = web3.toBigNumber(result).div(100000000);
                } catch (e) {
                    print4log('get bitcoin address balance error');

                    callback();
                    return;
                }
            } else {
		        callback();
                return;
            }

            if (btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) &&
                answers[btcConfig.to.name].length >0 &&
                btcScripts.checkPasswd(answers[btcConfig.passwd.name])
            ) {
                let keyPairArray;

                try {
                    keyPairArray = await btcUtil.getECPairs(answers[btcConfig.passwd.type]);

                    let target = {
                        address: answers.to,
                        value: web3.toBigNumber(answers.amount).mul(100000000)
                    };

                    let res = await ccUtil.btcTxBuildSendWallet(keyPairArray, target, btcConfig.rate.value);

                    if (res.error !== undefined) {
                        print4log('error send transaction');
                    }

                    print4log('txid: ' + res.result);
                } catch (e) {
                    print4log("bitcoin normal transaction error: ", err);
                }
            }


            callback();
		});
	});

// list all transactions
vorpal
    .command('listTransaction', btcConfig.listTransaction.desc)
    .action(async function(args,callback) {
        try{
            let records = ccUtil.getBtcWanTxHistory({});
            console.log(records);

        } catch (e) {
            print4log('get bitcoin transaction list error');
        }

        callback();
    });

// lockBtc
vorpal
    .command('lockBtc', "crosschain lockBtc")
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;
        // storeman

        return new Promise(async function(resolve, reject) {
            try{
                let smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
                smgs.forEach(function(Array, index){
                    print4log(config.consoleColor.COLOR_FgRed, '====== storeman ' + (index + 1) + ' ====== ', '\x1b[0m');
                    for(let name in Array){
                        console.log(name + ':' + Array[name]);
                    }
                });

            } catch (e) {
                print4log('get bitcoin transaction list error');
            }

            // wan address list
            let wanAddressList = [];
            try {
                wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);
                print4log(config.consoleColor.COLOR_FgRed, '====== wan address list ====== ', '\x1b[0m');

                print4log(sprintf("%46s %26s", "WAN address", "balance"));
                wanAddressList.forEach(function(wanAddress){
                    print4log(sprintf("%46s %26s", wanAddress.address,  web3.fromWei(wanAddress.balance)));
                });

            }catch(err) {
                print4log("listWanAddr error");
            }


            self.prompt([
                { type: btcConfig.wanAddress.type, name: btcConfig.wanAddress.name, message: btcConfig.wanAddress.message},
                { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message},
                { type: btcConfig.passwd.type, name: btcConfig.passwd.name, message: btcConfig.passwd.message},
            ], async function (answers) {
                // Or promises!
                let btcBalance;

                if (btcScripts.checkBalance(answers[btcConfig.amount.name], null)) {
                    let addressList;

                    try {
                        addressList = await btcUtil.getAddressList();

                        let aliceAddr = [];
                        for (let i=0;i<addressList.length; i++) {
                            aliceAddr.push(addressList[i].address)
                        }

                        let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, 0, 1000, aliceAddr);
                        let result = await ccUtil.getUTXOSBalance(utxos);

                        btcBalance = web3.toBigNumber(result).div(100000000);

                    } catch (e) {
                        print4log('get bitcoin address balance error');

                        callback();
                        return;
                    }
                } else {

                    callback();
                    return;
                }

                if (btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) &&
                    answers[btcConfig.wanAddress.name].length >0 &&
                    btcScripts.checkPasswd(answers[btcConfig.passwd.name])) {
                    print4log('lockBtc func here!');
                }

                callback();
            });
        });
    });

// redeemBtc
vorpal
    .command('redeemBtc', "crosschain redeemBtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'redeemHash',
                message: 'redeem hash: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'wan account password: '
            }
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            print4log('redeemHash', answers.redeemHash);
            print4log('password', answers.password);

            callback();
        });
    });

// revokeBtc
vorpal
    .command('revokeBtc', "crosschain revokeBtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'revokeHash',
                message: 'revoke hash: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'btc account password: '
            }
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            print4log('revokeHash', answers.revokeHash);
            print4log('password', answers.password);

            callback();
        });
    });

// lockwbtc
vorpal
    .command('lockWbtc', "crosschain lockWbtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'wanAddress',
                message: 'wanAddress: '
            },
            {
                type: 'input',
                name: 'btcAddress',
                message: 'btcAddress: '
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
                message: 'wan address Password: '
            }
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            print4log('wanAddress', answers.wanAddress);
            print4log('btcAddress', answers.btcAddress);
            print4log('amount', answers.amount);
            print4log('rate', answers.rate);
            print4log('password', answers.password);

            callback();
        });
    });

// redeemWbtc
vorpal
    .command('redeemWbtc', "crosschain redeemWbtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'redeemHash',
                message: 'redeem hash: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'wan account password: '
            }
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            print4log('redeemHash', answers.redeemHash);
            print4log('password', answers.password);

            callback();
        });
    });

// revokeWbtc
vorpal
    .command('revokeWbtc', "crosschain revokeWbtc")
    .action(function(args,callback){
        let self = this;

        let promise = this.prompt([
            {
                type: 'input',
                name: 'revokeHash',
                message: 'revoke hash: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'btc account password: '
            }
        ], function (answers) {
            // You can use callbacks...
        });

        promise.then(async function(answers) {
            // Or promises!
            print4log('revokeHash', answers.revokeHash);
            print4log('password', answers.password);

            callback();
        });
    });

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

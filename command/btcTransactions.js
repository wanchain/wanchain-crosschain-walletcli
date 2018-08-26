let WanchainCore = require('wanchain-crosschain');
let config = require('../config.js');
let vorpal = require('vorpal')();
let sprintf=require("sprintf-js").sprintf;
let btcConfig = require('./btcUtils/btcConfig');
let btcScripts = require('./btcUtils/btcScripts');
const bitcoin  = require('bitcoinjs-lib');

let print4log = console.log;

let Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

/**
 * @method createNewAddress
 * @param passwd
 * @return btcAddress
 */
vorpal
    .command('createBtcAddress', btcConfig.createNewAddress.desc)
    .cancel(() => {
        process.exit(0)
    })
    .action(function(args,callback) {
        print4log(config.consoleColor.COLOR_FgRed, btcConfig.createNewAddress.notice, '\x1b[0m');

        let promise = this.prompt([
            { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message}
        ]);

        promise.then(async function(answers) {
            // Or promises!
            if (btcScripts.checkPasswd(answers[btcConfig.btcPasswd.type])) {
                let newAddress;
                try{
                    newAddress = await btcUtil.createAddress(answers[btcConfig.btcPasswd.name]);
                    print4log(config.consoleColor.COLOR_FgYellow, newAddress.address, '\x1b[0m');
                } catch (e) {
                    print4log(btcConfig.createNewAddress.error)
                }
            }

            callback();
        })
    });

/**
 * @method addressList
 * @return list
 */
vorpal
    .command('listBtcAddress', btcConfig.listBtcAddress.desc)
    .action(async function(args,callback) {
        let addressList;
        try{
            addressList = await btcUtil.getAddressList();

            addressList.forEach(function(Array){
                print4log(config.consoleColor.COLOR_FgYellow, Array.address, '\x1b[0m');
            });
        } catch (e) {
            print4log(btcConfig.addressList.error)
        }

        callback();
    });

/**
 * @method btcBalance
 * @return balance
 */
vorpal
    .command('getBtcBalance', btcConfig.getBtcBalance.desc)
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

            print4log(config.consoleColor.COLOR_FgYellow, web3.toBigNumber(result).div(100000000).toString(), '\x1b[0m');
        } catch (e) {
            print4log(btcConfig.btcBalance.error)
        }

        callback();
    });

/**
 * @method wbtcBalance
 * @return balance
 */
vorpal
    .command('listWbtcBalance', btcConfig.listWbtcBalance.desc)
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
            print4log(btcConfig.wbtcBalance.error);
        }

        callback();
    });

/**
 * @method wanBalance
 * @return balance
 */
vorpal
    .command('listWanBalance', btcConfig.listWanBalance.desc)
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
            print4log(btcConfig.wanBalance.error);
        }

        callback();
    });

/**
 * @method listStoreman
 * @return list
 */
vorpal
    .command('listStoremanGroups', btcConfig.listStoremanGroups.desc)
    .action(async function(args,callback) {

        try{
            let smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
            smgs.forEach(function(Array, index){
                print4log(config.consoleColor.COLOR_FgRed, '====== storeman ' + (index + 1) + ' ====== ', '\x1b[0m');
                for(let name in Array){
                    print4log(config.consoleColor.COLOR_FgYellow, name + ': ' + Array[name], '\x1b[0m');
                }
            });

        } catch (e) {
            print4log(btcConfig.listStoreman.error)
        }

        callback();
    });


/**
 * @method normalTransaction
 * @param amount, to, passwd
 * @return txid
 */
vorpal
	.command('sendBtcToAddress', btcConfig.sendBtcToAddress.desc)
    .cancel(() => {
        process.exit(0)
    })
	.action(function(args,callback){

		let promise = this.prompt([
            { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message},
            { type: btcConfig.to.type, name: btcConfig.to.name, message: btcConfig.to.message},
            { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message},
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

                    let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, config.MIN_CONFIRM_BLKS, config.MAX_CONFIRM_BLKS, aliceAddr);
                    let result = await ccUtil.getUTXOSBalance(utxos);

                    btcBalance = web3.toBigNumber(result).div(100000000);

                    console.log("btcBalance:",btcBalance);
	                if (btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) &&
		                answers[btcConfig.to.name].length >0 &&
		                btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])
	                ) {
		                let keyPairArray;

		                try {
			                keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.type]);
			                console.log("keyPairArray:",keyPairArray);
			                if (keyPairArray.length >0) {
				                let target = {
					                address: answers.to,
					                value: web3.toBigNumber(answers.amount).mul(100000000)
				                };


				                const {rawTx, fee} = await this.btcBuildTransaction(utxos, keyPairArray, target, config.feeRate);
				                if (!rawTx) {
					                callback();
					                return;
				                }
				                console.log("###############rawTx: ", rawTx);
				                let result = await this.sendRawTransaction(this.btcSender, rawTx);
				                console.log('result hash:', result);
				                callback();
				                return;
			                } else {
				                print4log('no bitcoin keyPairs!')
			                }


		                } catch (e) {
			                print4log("bitcoin normal transaction error: ", err);
		                }
	                }


                } catch (e) {
                    print4log(btcConfig.btcBalance.error);

                    callback();
                    return;
                }
            } else {
		        callback();
                return;
            }

			if (btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) &&
                answers[btcConfig.to.name].length >0 &&
                btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])
            ) {
                let keyPairArray;

                try {
                    keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.type]);

                    if (keyPairArray.length >0) {
                        let target = {
                            address: answers.to,
                            value: web3.toBigNumber(answers.amount).mul(100000000)
                        };

                        let res = await ccUtil.btcTxBuildSendWallet(keyPairArray, target, btcConfig.rate.value);

                        print4log(config.consoleColor.COLOR_FgYellow, res.result, '\x1b[0m');
                    }
                } catch (e) {
                    print4log(btcConfig.normalTransaction.error);
                }
            }


            callback();
		});
	});

/**
 * @method listTransaction
 * @return list
 */
vorpal
    .command('listTransactions', btcConfig.listTransactions.desc)
    .action(async function(args,callback) {
        try{
            let records = ccUtil.getBtcWanTxHistory({});
            console.log(records);

        } catch (e) {
            print4log(btcConfig.listTransactions.error)
        }

        callback();
    });

/**
 * @method lockBtc
 * @param stroman, wanAddress, amount, passwd
 * @return txid
 */
vorpal
    .command('lockBtc', btcConfig.lockBtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
            // storeman
            let smgs = [];
            let wanAddressList = [];
            let wanAddressArray = {};
            let smgsArray = {};

            try {
                smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
                print4log(config.consoleColor.COLOR_FgRed, '====== stroman address list ====== ', '\x1b[0m');
                smgs.forEach(function (Array, index) {
                    print4log((index + 1) + ': ' + Array.wanAddress);
                    smgsArray[Array.wanAddress] = [Array.wanAddress, Array.txFeeRatio];
                    smgsArray[index + 1] = [Array.wanAddress, Array.txFeeRatio];
                });
                print4log('\n');

            } catch (e) {
                print4log(btcConfig.listStoreman.error);
            }

            // wan address list
            try {
                wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

                print4log(config.consoleColor.COLOR_FgRed, '====== wan address list ====== ', '\x1b[0m');
                print4log(sprintf("%2s %56s %26s", "WAN address", "balance", "wbtc balance"));

                wanAddressList.forEach(function(wanAddress, index){
                    let wanBalance = web3.fromWei(wanAddress.balance);
                    let wbtcBalance = web3.toBigNumber(wanAddress.wethBalance).div(100000000);
                    wanAddressArray[wanAddress.address] = [wanBalance, wbtcBalance,  wanAddress.address];
                    wanAddressArray[index +1] = [wanBalance, wbtcBalance, wanAddress.address];

                    print4log(sprintf("%2s %26s %26s",(index + 1) + ': ' + wanAddress.address,  wanBalance, wbtcBalance));
                });
                print4log('\n');

            }catch(err) {
                print4log(btcConfig.wanBalance.error);
            }


            self.prompt([
                { type: btcConfig.StoremanGroup.type, name: btcConfig.StoremanGroup.name, message: btcConfig.StoremanGroup.message},
                { type: btcConfig.wanAddress.type, name: btcConfig.wanAddress.name, message: btcConfig.wanAddress.message},
                { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message},
                { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message},
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
                        print4log(btcConfig.btcBalance.error);

                        callback();
                        return;
                    }
                } else {

                    callback();
                    return;
                }

                if (! btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) ||
                    ! answers[btcConfig.wanAddress.name].length >0 ||
                    ! btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                    callback();
                    return;
                }

                let [storeman, txRadio] = smgsArray[answers[btcConfig.StoremanGroup.name]];
                let [wanBalance, wbtcBalance, wanAddress] = wanAddressArray[answers[btcConfig.wanAddress.name]];

                print4log('lockBtc func here!');

                callback();
            });
        });
    });

/**
 * @method redeemBtc
 * @param btcRedeemHash, wanPasswd
 * @return txid
 */
vorpal
    .command('redeemBtc', btcConfig.redeemBtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
            // listTransaction
            let records;
            try{
                records = ccUtil.getBtcWanTxHistory({});
                console.log(records);

            } catch (e) {
                print4log(btcConfig.listTransactions.error);
            }

            if (records.length === 0) {
                print4log(btcConfig.listTransactions.error);

                callback();
                return;
            }

            self.prompt([
                { type: btcConfig.btcRedeemHash.type, name: btcConfig.btcRedeemHash.name, message: btcConfig.btcRedeemHash.message},
                { type: btcConfig.wanPasswd.type, name: btcConfig.wanPasswd.name, message: btcConfig.wanPasswd.message},
            ], async function (answers) {
                if (answers[btcConfig.btcRedeemHash.name].length >0 &&
                    btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                    print4log('redeemBtc func here!');
                }

                callback();
            })
        });
    });

/**
 * @method revokeBtc
 * @param revokeBtcHash, btcPasswd
 * @return txid
 */
vorpal
    .command('revokeBtc', btcConfig.revokeBtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
            // listTransaction
            let records;
            try{
                records = ccUtil.getBtcWanTxHistory({});
                console.log(records);

            } catch (e) {
                print4log(btcConfig.listTransactions.error);
            }

            if (records.length === 0) {
                print4log(btcConfig.listTransactions.error);

                callback();
                return;
            }

            self.prompt([
                { type: btcConfig.revokeBtcHash.type, name: btcConfig.revokeBtcHash.name, message: btcConfig.revokeBtcHash.message},
                { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message},
            ], async function (answers) {
                if (answers[btcConfig.btcRedeemHash.name].length >0 &&
                    btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                    print4log('redeemBtc func here!');

                }

                callback();
            })
        });
    });

/**
 * @method lockWbtc
 * @param storeman, wanAddress, btcAddress, amount, wanPasswd
 * @return txid
 */
vorpal
    .command('lockWbtc', btcConfig.lockWbtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
	        // storeman
            let smgs = [];
            let btcAddressList = [];
            let wanAddressList = [];
            let wanAddressArray = {};
            let smgsArray = {};
            let btcAddressArray = {};

            let SsmgsArray = "\n";
	        let SwanAddressList="\n";
	        let SbtcAddress = "\n";
            try {
		        smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
                print4log(config.consoleColor.COLOR_FgRed, '====== stroman address list ====== ', '\x1b[0m');
		        smgs.forEach(function (Array, index) {
			        print4log((index + 1) + ': ' + Array.wanAddress);
			        SsmgsArray += (index + 1) + ': ' + Array.wanAddress +'\n'
			        smgsArray[Array.wanAddress] = [Array.wanAddress, Array.txFeeRatio];
                    smgsArray[index + 1] = [Array.wanAddress, Array.txFeeRatio];
		        });
		        print4log('\n');

            } catch (e) {
		        print4log(btcConfig.listStoreman.error);
            }
            // wan address list
            try {
                wanAddressList = await ccUtil.getWanAccountsInfo(ccUtil.wanSender);

                print4log(config.consoleColor.COLOR_FgRed, '====== wan address list ====== ', '\x1b[0m');
                print4log(sprintf("%2s %56s %26s", "WAN address", "balance", "wbtc balance"));
				SwanAddressList = sprintf("%2s %56s %26s\r\n", "WAN address", "balance", "wbtc balance");
                wanAddressList.forEach(function(wanAddress, index){
                    let wanBalance = web3.fromWei(wanAddress.balance);
                    let wbtcBalance = web3.toBigNumber(wanAddress.wethBalance).div(100000000);
                    wanAddressArray[wanAddress.address] = [wanBalance, wbtcBalance,  wanAddress.address];
                    wanAddressArray[index +1] = [wanBalance, wbtcBalance, wanAddress.address];

                    print4log(sprintf("%2s %26s %26s",(index + 1) + ': ' + wanAddress.address,  wanBalance, wbtcBalance));
	                SwanAddressList += sprintf("%2s %26s %26s\r\n",(index + 1) + ': ' + wanAddress.address,  wanBalance, wbtcBalance)
                });
                print4log('\n');

            }catch(err) {
                print4log(btcConfig.wanBalance.error);
            }

	        console.log("##################2")

            // btc address list
            try {
                btcAddressList = await btcUtil.getAddressList();

                print4log(config.consoleColor.COLOR_FgRed, '====== btc address list ====== ', '\x1b[0m');
                btcAddressList.forEach(function (Array, index) {
                    btcAddressArray[Array.address] = Array.address;
                    btcAddressArray[index + 1] = Array.address;
                    print4log( (index + 1) + ': ' + Array.address);
	                SbtcAddress += (index + 1) + ': ' + Array.address+'\n'
                });
                print4log('\n');

            } catch (e) {
                print4log(btcConfig.addressList.error)
            }
	        console.log("##################3")

            if (smgs.length === 0 || btcAddressList.length ===0 || wanAddressList.length ===0) {
	            callback();
	            return;
            }

	        console.log("##################4");
	        self.prompt([
                { type: btcConfig.StoremanGroup.type, name: btcConfig.StoremanGroup.name, message: SsmgsArray+btcConfig.StoremanGroup.message },
                { type: btcConfig.wanAddress.type, name: btcConfig.wanAddress.name, message: SwanAddressList+btcConfig.wanAddress.message },
                { type: btcConfig.btcAddress.type, name: btcConfig.btcAddress.name, message: SbtcAddress+btcConfig.btcAddress.message },
                { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message },
                { type: btcConfig.wanPasswd.type, name: btcConfig.wanPasswd.name, message: btcConfig.wanPasswd.message },
		        { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message },
	        ], async function (answers) {

		        console.log("##################5")
		        let [wanBalance, wbtcBalance, wanAddress] = wanAddressArray[answers[btcConfig.wanAddress.name]];

                if (wanBalance === 0 || wbtcBalance === 0 ||
                    ! btcScripts.checkBalance(answers[btcConfig.amount.name], wbtcBalance) ||
                    ! answers[btcConfig.StoremanGroup.name].length > 0 ||
                    ! answers[btcConfig.wanAddress.name].length > 0 ||
                    ! answers[btcConfig.btcAddress.name].length > 0 ||
	                ! btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name]) ||
                    ! btcScripts.checkPasswd(answers[btcConfig.wanPasswd.name])) {

                    callback();
                    return;

                }

                let wdTx = {};
                let txFeeRatio;

                wdTx.gas = config.gasLimit;
                wdTx.gasPrice = config.gasPrice;
                wdTx.passwd = answers[btcConfig.wanPasswd.name];
                wdTx.cross = '0x' + btcUtil.btcAddrToH160(btcAddressArray[answers[btcConfig.btcAddress.name]]);
                wdTx.from = wanAddress;
                wdTx.amount = Number(answers[btcConfig.amount.name]) * 100000000;
                [wdTx.storemanGroup, txFeeRatio] = smgsArray[answers[btcConfig.StoremanGroup.name]];

                // console.log("wdTx:", wdTx);
                // console.log("txFeeRatio:", txFeeRatio);

                wdTx.value = ccUtil.calculateLocWanFee(wdTx.amount, ccUtil.c2wRatio, txFeeRatio);
                console.log("wdTx.value: ", wdTx.value);
                let x = btcUtil.generatePrivateKey().slice(2); // hex string without 0x
                let hashx = bitcoin.crypto.sha256(Buffer.from(x, 'hex')).toString('hex');
                wdTx.x = x;
                console.log("wdTx:", wdTx);
                console.log("wdtx hashx:", hashx);
                let wdHash = await ccUtil.sendWanHash(ccUtil.wanSender, wdTx);
                console.log("wdHash: ", wdHash);

                // wait wallet tx confirm
                // await waitEventbyHashx('WBTC2BTCLock', config.HTLCWBTCInstAbi, '0x'+hashx);

                callback();
            });
        });
    });

/**
 * @method redeemWbtc
 * @param btcRedeemHash, btcPasswd
 * @return txid
 */
vorpal
    .command('redeemWbtc', btcConfig.redeemWbtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
            // listTransaction
            let records;
            try{
                records = ccUtil.getBtcWanTxHistory({});
                console.log(records);

            } catch (e) {
                print4log(btcConfig.listTransactions.error);
            }

            if (records.length === 0) {
                print4log(btcConfig.listTransactions.error);

                callback();
                return;
            }

            self.prompt([
                { type: btcConfig.btcRedeemHash.type, name: btcConfig.btcRedeemHash.name, message: btcConfig.btcRedeemHash.message},
                { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message},
            ], async function (answers) {
                if (answers[btcConfig.btcRedeemHash.name].length >0 &&
                    btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                    print4log('redeemWbtc func here!');

                }

                callback();
            })
        });
    });

/**
 * @method revokeWbtc
 * @param revokeBtcHash, wanPasswd
 * @return txid
 */
vorpal
    .command('revokeWbtc', btcConfig.revokeWbtc.desc)
    .cancel(() => {
        process.exit(0);
    })
    .action(function(args,callback){
        let self = this;

        return new Promise(async function(resolve, reject) {
            // listTransaction
            let records;
            try{
                records = ccUtil.getBtcWanTxHistory({});
                console.log(records);

            } catch (e) {
                print4log(btcConfig.listTransactions.error);
            }

            if (records.length === 0) {
                print4log(btcConfig.listTransactions.error);

                callback();
                return;
            }

            self.prompt([
                { type: btcConfig.revokeBtcHash.type, name: btcConfig.revokeBtcHash.name, message: btcConfig.revokeBtcHash.message},
                { type: btcConfig.wanPasswd.type, name: btcConfig.wanPasswd.name, message: btcConfig.wanPasswd.message},
            ], async function (answers) {
                if (answers[btcConfig.btcRedeemHash.name].length >0 &&
                    btcScripts.checkPasswd(answers[btcConfig.wanPasswd.name])) {

                    print4log('redeemBtc func here!');

                }

                callback();
            })
        });
    });

async function main(){
    wanchainCore = new WanchainCore(config);
    ccUtil = wanchainCore.be;
    btcUtil = wanchainCore.btcUtil;
    await wanchainCore.init(config);

    print4log('\n');
    print4log(config.consoleColor.COLOR_FgGreen, btcConfig.help, '\x1b[0m');
    print4log('\n');

    vorpal
        .delimiter('wanWallet$')
        .show();
}

main();

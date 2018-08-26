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
 * @method createBtcAddress
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
                    print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

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
    .command('listBtcAddress', btcConfig.addressList.desc)
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
 * @method getBtcBalance
 * @return balance
 */
vorpal
    .command('getBtcBalance', btcConfig.btcBalance.desc)
    .action(async function(args,callback) {
        let addressList;

        try{
            print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');
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
    .command('listWbtcBalance', btcConfig.wbtcBalance.desc)
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

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
 * @method listWanBalance
 * @return balance
 */
vorpal
    .command('listWanBalance', btcConfig.wanBalance.desc)
    .action(async function(args,callback) {

        // wan address list
        let wanAddressList = [];
        try {
            print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

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
 * @method listStoremanGroups
 * @return list
 */
vorpal
    .command('listStoremanGroups', btcConfig.listStoreman.desc)
    .action(async function(args,callback) {

        try{
            print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

            let smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);
            smgs.forEach(function(Array, index){
                print4log(config.consoleColor.COLOR_FgRed, '====== storeman ' + (index + 1) + ' ======', '\x1b[0m');
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
 * @method sendBtcToAddress
 * @param amount, to, passwd
 * @return txid
 */
vorpal
	.command('sendBtcToAddress', btcConfig.normalTransaction.desc)
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
		    if (! btcScripts.checkBalance(answers[btcConfig.amount.name], null) ||
                ! answers[btcConfig.to.name].length >0 ||
                ! btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

		        callback();
                return;
            }

            let btcBalance = 0;
            let addressList;
            let utxos;
            // btc balance
            try{
                addressList = await btcUtil.getAddressList();
                let aliceAddr = [];
                for (let i=0;i<addressList.length; i++) {
                    aliceAddr.push(addressList[i].address)
                }

                utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, config.MIN_CONFIRM_BLKS, config.MAX_CONFIRM_BLKS, aliceAddr);
                let result = await ccUtil.getUTXOSBalance(utxos);

                btcBalance = web3.toBigNumber(result).div(100000000);

            } catch (e) {
                print4log(btcConfig.btcBalance.error);

                callback();
                return;
            }

            if (! btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) ) {

                callback();
                return;
            }

            let keyPairArray = [];

            try {
                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

                keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.type]);

                if (keyPairArray.length === 0) {
                    print4log('no bitcoin keyPairs!');

                    callback();
                    return;
                }

                let target = {
                    address: answers.to,
                    value: web3.toBigNumber(answers.amount).mul(100000000)
                };


                const {rawTx, fee} = await ccUtil.btcBuildTransaction(utxos, keyPairArray, target, config.feeRate);
                if (!rawTx) {

                    callback();
                    return;
                }
                print4log("###############rawTx: ", rawTx);

                let result = await ccUtil.sendRawTransaction(ccUtil.btcSender, rawTx);
                print4log('result hash:', result);


            } catch (e) {
                print4log(btcConfig.normalTransaction.error, e);

                callback();
                return;
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

            let SsmgsArray = "";
            let SwanAddressList="";


            // storeman list
            try {
                smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);

                SsmgsArray += sprintf("%2s\r\n", "stroeman address");
                smgs.forEach(function (Array, index) {
                    SsmgsArray += (index + 1) + ': ' + Array.wanAddress +'\n';
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
                SwanAddressList += sprintf("%2s %56s %26s\r\n", "WAN address", "balance", "wbtc balance");
                wanAddressList.forEach(function(wanAddress, index){
                    let wanBalance = web3.fromWei(wanAddress.balance);
                    let wbtcBalance = web3.toBigNumber(wanAddress.wethBalance).div(100000000);
                    wanAddressArray[wanAddress.address] = [wanBalance, wbtcBalance,  wanAddress.address];
                    wanAddressArray[index +1] = [wanBalance, wbtcBalance, wanAddress.address];

                    SwanAddressList += sprintf("%2s %26s %26s\r\n",(index + 1) + ': ' + wanAddress.address,  wanBalance, wbtcBalance);
                });

                print4log('\n');

            }catch(err) {
                print4log(btcConfig.wanBalance.error);
            }


            self.prompt([
                { type: btcConfig.StoremanGroup.type, name: btcConfig.StoremanGroup.name, message: SsmgsArray+btcConfig.StoremanGroup.message },
                { type: btcConfig.wanAddress.type, name: btcConfig.wanAddress.name, message: SwanAddressList+btcConfig.wanAddress.message },
                { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message},
	            { type: btcConfig.wanPasswd.type, name: btcConfig.wanPasswd.name, message: btcConfig.wanPasswd.message},
	            { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message},
            ], async function (answers) {

                if (! btcScripts.checkBalance(answers[btcConfig.amount.name], null) ||
                    ! answers[btcConfig.wanAddress.name].length >0 ||
                    ! btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                    callback();
                    return;
                }

                let addressList;
                let btcBalance;

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

                if (! btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) ) {
                    callback();
                    return;
                }

                let [storeman, txRadio] = smgsArray[answers[btcConfig.StoremanGroup.name]];
                let [wanBalance, wbtcBalance, wanAddress] = wanAddressArray[answers[btcConfig.wanAddress.name]];

                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

                print4log('lockBtc func here!');
	            let record;
	            let keyPairArray;
	            try{
		            keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.name]);
		            let smgBtcAddr = smgs[Number(answers[btcConfig.StoremanGroup.name])-1].ethAddress;
		            console.log("smgBtcAddr:", smgBtcAddr);
		            record = await ccUtil.fund(keyPairArray, smgBtcAddr, answers[btcConfig.amount.name]*100000000);
	            }catch(err){
		            console.log("fund error: ", err);
		            return;
	            }

	            // let checkres = ccUtil.getBtcWanTxHistory({'HashX':record.hashx})
	            // console.log(checkres);

	            // notice wan.
	            const tx = {};
	            tx.storeman = smgs[Number(answers[btcConfig.StoremanGroup.name])-1].wanAddress;
	            tx.from = wanAddress;
	            tx.userH160 = '0x'+bitcoin.crypto.hash160(keyPairArray[0].publicKey).toString('hex');
	            tx.hashx = '0x'+record.hashx;
	            tx.txHash = '0x'+record.txhash;
	            tx.lockedTimestamp = record.redeemLockTimeStamp;
	            tx.gas = config.gasLimit;
	            tx.gasPrice = config.gasPrice;
	            tx.passwd=answers[btcConfig.wanPasswd.name];
	            console.log("######## tx: ", tx);
	            let txHash = await ccUtil.sendWanNotice(ccUtil.wanSender, tx);
	            console.log("sendWanNotice txHash:", txHash);

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

            let SsmgsArray = "";
	        let SwanAddressList="";
	        let SbtcAddress = "";
            try {
		        smgs = await ccUtil.getBtcSmgList(ccUtil.btcSender);

                SsmgsArray += sprintf("%2s\r\n", "stroeman address");
		        smgs.forEach(function (Array, index) {
			        SsmgsArray += (index + 1) + ': ' + Array.wanAddress +'\n';
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
				SwanAddressList += sprintf("%2s %56s %26s\r\n", "WAN address", "balance", "wbtc balance");
                wanAddressList.forEach(function(wanAddress, index){
                    let wanBalance = web3.fromWei(wanAddress.balance);
                    let wbtcBalance = web3.toBigNumber(wanAddress.wethBalance).div(100000000);
                    wanAddressArray[wanAddress.address] = [wanBalance, wbtcBalance,  wanAddress.address];
                    wanAddressArray[index +1] = [wanBalance, wbtcBalance, wanAddress.address];

	                SwanAddressList += sprintf("%2s %26s %26s\r\n",(index + 1) + ': ' + wanAddress.address,  wanBalance, wbtcBalance)
                });
                print4log('\n');

            }catch(err) {
                print4log(btcConfig.wanBalance.error);
            }

            // btc address list
            try {
                btcAddressList = await btcUtil.getAddressList();

                SbtcAddress += sprintf("%2s\r\n", "btc address");
                btcAddressList.forEach(function (Array, index) {
                    btcAddressArray[Array.address] = Array.address;
                    btcAddressArray[index + 1] = Array.address;
	                SbtcAddress += (index + 1) + ': ' + Array.address+'\n'
                });
                print4log('\n');

            } catch (e) {
                print4log(btcConfig.addressList.error)
            }

            if (smgs.length === 0 || btcAddressList.length ===0 || wanAddressList.length ===0) {
	            callback();
	            return;
            }

	        self.prompt([
                { type: btcConfig.StoremanGroup.type, name: btcConfig.StoremanGroup.name, message: SsmgsArray+btcConfig.StoremanGroup.message },
                { type: btcConfig.wanAddress.type, name: btcConfig.wanAddress.name, message: SwanAddressList+btcConfig.wanAddress.message },
                { type: btcConfig.btcAddress.type, name: btcConfig.btcAddress.name, message: SbtcAddress+btcConfig.btcAddress.message },
                { type: btcConfig.amount.type, name: btcConfig.amount.name, message: btcConfig.amount.message },
                { type: btcConfig.wanPasswd.type, name: btcConfig.wanPasswd.name, message: btcConfig.wanPasswd.message },
		        { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message },
	        ], async function (answers) {

                let [wanBalance, wbtcBalance, wanAddress] = wanAddressArray[answers[btcConfig.wanAddress.name]];

                if (wanBalance === 0 || wbtcBalance === 0 ||
                    ! btcScripts.checkBalance(answers[btcConfig.amount.name], wbtcBalance) ||
                    ! answers[btcConfig.StoremanGroup.name].length > 0 ||
                    ! answers[btcConfig.wanAddress.name].length > 0 ||
                    ! answers[btcConfig.btcAddress.name].length > 0 ) {

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

                // print4log("wdTx:", wdTx);

                wdTx.value = ccUtil.calculateLocWanFee(wdTx.amount, ccUtil.c2wRatio, txFeeRatio);
                console.log("wdTx.value: ", wdTx.value);

                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

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
                if (answers[btcConfig.revokeBtcHash.name].length >0 ) {

                    print4log('revokeW func here!');
                    console.log(answers);
                    let record = records[Number(answers[btcConfig.revokeBtcHash.name])-1];
                    console.log(record);
	                //sendWanCancel(sender, from, gas, gasPrice, hashx, passwd, nonce)
                    let revokeWbtcHash = ccUtil.sendWanCancel(ccUtil.wanSender, record.from,
                        config.gasLimit, config.gasPrice, record.HashX, answers[btcConfig.wanPasswd.name]);
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

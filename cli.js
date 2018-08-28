let WanchainCore = require('wanchain-crosschain');
let config = require('./config.js');
let vorpal = require('vorpal')();
let sprintf=require("sprintf-js").sprintf;
let btcConfig = require('./btcUtils/btcConfig');
let btcScripts = require('./btcUtils/btcScripts');
const bitcoin  = require('bitcoinjs-lib');

let print4log = console.log;
let ccUtil;
let wanchainCore;
let btcUtil;
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

        let promise = this.prompt([
            { type: btcConfig.btcPasswd.type, name: btcConfig.btcPasswd.name, message: btcConfig.btcPasswd.message}
        ]);

        promise.then(async function(answers) {
            if (! btcScripts.checkPasswd(answers[btcConfig.btcPasswd.name])) {

                callback();
                return;
            }

            let newAddress;
            try{
                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');
                newAddress = await btcUtil.createAddress(answers[btcConfig.btcPasswd.name]);
                await ccUtil.btcImportAddress(ccUtil.btcSender, newAddress.address);
                print4log(config.consoleColor.COLOR_FgYellow, newAddress.address, '\x1b[0m');
            } catch (e) {
                print4log(btcConfig.createNewAddress.error, e);

                callback();
                return;
            }

            callback();
        })
    });

/**
 * @method listBtcAddress
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
            print4log(btcConfig.addressList.error, e.message);

            callback();
            return;
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
        let addressList = await btcUtil.getAddressList();
        let aliceList = [];

        if (addressList.length === 0) {
            print4log("no btc address");

            callback();
            return;
        }

        try{
            print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

            for (let i=0;i<addressList.length; i++) {
                aliceList.push(addressList[i].address)
            }

            let utxos = await ccUtil.getBtcUtxo(ccUtil.btcSender, config.MIN_CONFIRM_BLKS, config.MAX_CONFIRM_BLKS, aliceList);
            let result = await ccUtil.getUTXOSBalance(utxos);

            print4log(config.consoleColor.COLOR_FgYellow, web3.toBigNumber(result).div(100000000).toString(), '\x1b[0m');
        } catch (e) {
            print4log(btcConfig.btcBalance.error, e.message);

            callback();
            return;
        }

        callback();
    });

/**
 * @method listWbtcBalance
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

        }catch(e) {
            print4log(btcConfig.wbtcBalance.error, e.message);

            callback();
            return;
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

        }catch(e) {
            print4log(btcConfig.wanBalance.error, e.message);

            callback();
            return;
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

            print4log(sprintf("%1s %46s", "wanAddress", "btcAddress"));
            smgs.forEach(function(array){
                print4log(sprintf("%26s %46s", array.wanAddress,  array.ethAddress));
            });

        } catch (e) {
            print4log(btcConfig.listStoreman.error, e.message);

            callback();
            return;
        }

        callback();
    });

/**
 * @method listTransactions
 * @return list
 */
vorpal
    .command('listTransactions', btcConfig.listTransactions.desc)
    .action(async function(args,callback) {
        try{
            let records = ccUtil.getBtcWanTxHistory({});
            // print4log('records: ', records);
            btcScripts.checkTransaction(records, web3, btcUtil.hash160ToAddress);
        } catch (e) {
            print4log(btcConfig.listTransactions.error, e.message);

            callback();
            return;
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
                print4log(btcConfig.btcBalance.error, e.message);

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

                keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.name]);

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

                let result = await ccUtil.sendRawTransaction(ccUtil.btcSender, rawTx);
                print4log('hash: ', result);


            } catch (e) {
                print4log(btcConfig.normalTransaction.error, e.message);

                callback();
                return;
            }


            callback();
		});
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
                    SsmgsArray += (index + 1) + ': ' + Array.ethAddress +'\n';
                    smgsArray[Array.wanAddress] = [Array.wanAddress, Array.ethAddress];
                    smgsArray[index + 1] = [Array.wanAddress, Array.ethAddress];
                });
                print4log('\n');

            } catch (e) {
                print4log(btcConfig.listStoreman.error, e.message);

                callback();
                return;
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

            }catch(e) {
                print4log(btcConfig.wanBalance.error, e.message);

                callback();
                return;
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
                    print4log(btcConfig.btcBalance.error, e.message);

                    callback();
                    return;
                }

                if (! btcScripts.checkBalance(answers[btcConfig.amount.name], btcBalance) ) {

                    callback();
                    return;
                }

                let [storeman, smgBtcAddr] = smgsArray[answers[btcConfig.StoremanGroup.name]];
                let [wanBalance, wbtcBalance, wanAddress] = wanAddressArray[answers[btcConfig.wanAddress.name]];

                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

	            let record;
	            let keyPairArray;
	            try{
		            keyPairArray = await btcUtil.getECPairs(answers[btcConfig.btcPasswd.name]);
		            let value = Number(web3.toBigNumber(answers[btcConfig.amount.name]).mul(100000000));

		            record = await ccUtil.fund(keyPairArray, smgBtcAddr, value);
	            }catch(err){
		            console.log("lockBtc error: ", e.message);

		            callback();
		            return;
	            }

	            // notice wan.
	            const tx = {};
	            tx.storeman = storeman;
	            tx.from = wanAddress;
	            tx.userH160 = '0x'+bitcoin.crypto.hash160(keyPairArray[0].publicKey).toString('hex');
	            tx.hashx = '0x'+record.hashx;
	            tx.txHash = '0x'+record.txhash;
	            tx.lockedTimestamp = record.redeemLockTimeStamp;
	            tx.gas = config.gasLimit;
	            tx.gasPrice = config.gasPrice;
	            tx.passwd=answers[btcConfig.wanPasswd.name];

	            let txHash;
	            try {
                    txHash = await ccUtil.sendWanNotice(ccUtil.wanSender, tx);

                    print4log("sendWanNotice txHash:", txHash);
                } catch (e) {
                    console.log("get sendWanNotice error: ", e.message);

                    callback();
                    return;
                }

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
            let records = [];
            let showArray = [];
            try{
                records = await ccUtil.getBtcWanTxHistory({status: 'waitingX', chain: 'BTC'});
                showArray = btcScripts.checkTransaction(records, web3, btcUtil.hash160ToAddress);

            } catch (e) {
                print4log(btcConfig.listTransactions.error, e.message);

                callback();
                return;
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
                let patten = /^\d+$/ ;

                if (! patten.test(answers[btcConfig.btcRedeemHash.name]) ||
                    answers[btcConfig.btcRedeemHash.name] > showArray.length ||
                    !showArray[answers[btcConfig.btcRedeemHash.name] -1]) {

                    callback();
                    return;
                }

                let record = showArray[answers[btcConfig.btcRedeemHash.name] -1];
                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

                try {
                    let redeemHash = await ccUtil.sendDepositX(ccUtil.wanSender, '0x'+record.crossAdress,
                        config.gasLimit, config.gasPrice,'0x'+record.x, answers[btcConfig.wanPasswd.name]);

                    print4log("redeemHash: ", redeemHash);
                } catch (e) {
                    print4log('redeemBtc error: ', e.message);

                    callback();
                    return;
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
            let records = [];
            let showArray = [];
            try{
                records = await ccUtil.getBtcWanTxHistory({status: 'waitingRevoke', chain: 'BTC'});
                showArray = btcScripts.checkTransaction(records, web3, btcUtil.hash160ToAddress);

            } catch (e) {
                print4log(btcConfig.listTransactions.error, e.message);

                callback();
                return;
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
                let patten = /^\d+$/ ;

                if (! patten.test(answers[btcConfig.revokeBtcHash.name]) ||
                    answers[btcConfig.revokeBtcHash.name] > showArray.length ||
                    !showArray[answers[btcConfig.revokeBtcHash.name] -1]) {

                    callback();
                    return;
                }

                print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

	            let record = showArray[answers[btcConfig.revokeBtcHash.name] -1];

	            let walletRevoke;
	            try {
                    let alice = await btcUtil.getECPairsbyAddr(answers[btcConfig.btcPasswd.name], record.from);
                    walletRevoke = await ccUtil.revokeWithHashX(record.HashX,alice);

                    print4log("revokeBtc:", walletRevoke);
                } catch (e) {
                    print4log('revokeBtc error: ', e);

                    callback();
                    return;
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
		        print4log(btcConfig.listStoreman.error, e.message);

                callback();
                return;
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

            }catch(e) {
                print4log(btcConfig.wanBalance.error, e.message);

                callback();
                return;
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
                print4log(btcConfig.addressList.error, e.message);

                callback();
                return;
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
                let btcAddr = btcAddressArray[answers[btcConfig.btcAddress.name]];
                wdTx.cross = '0x' + btcUtil.addressToHash160(btcAddr, 'pubkeyhash','testnet');
                wdTx.from = wanAddress;
                wdTx.amount = Number(web3.toBigNumber(answers[btcConfig.amount.name]).mul(100000000));
                [wdTx.storemanGroup, txFeeRatio] = smgsArray[answers[btcConfig.StoremanGroup.name]];

                wdTx.value = ccUtil.calculateLocWanFee(wdTx.amount, ccUtil.c2wRatio, txFeeRatio);

                try {
                    let x = btcUtil.generatePrivateKey().slice(2);
                    wdTx.x = x;

                    print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');
                    let wdHash = await ccUtil.sendWanHash(ccUtil.wanSender, wdTx);
                    console.log("wdHash: ", wdHash);

                } catch (e) {
                    print4log('lockWbtc error: ', e.message);

                    callback();
                    return;
                }

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
            let records = [];
            let showArray = [];
            try{
                records = await ccUtil.getBtcWanTxHistory({status: 'waitingX', chain: 'WAN'});
                showArray = btcScripts.checkTransaction(records, web3, btcUtil.hash160ToAddress);

            } catch (e) {
                print4log(btcConfig.listTransactions.error, e.message);

                callback();
                return;
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
                let patten = /^\d+$/ ;

                if (! patten.test(answers[btcConfig.btcRedeemHash.name]) ||
                    answers[btcConfig.btcRedeemHash.name] > showArray.length ||
                    !showArray[answers[btcConfig.btcRedeemHash.name] -1]) {

                    callback();
                    return;
                }

	            let record = showArray[answers[btcConfig.btcRedeemHash.name] -1];

	            try {

                    print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');
		            let aliceAddr = btcUtil.hash160ToAddress(record.crossAdress,'pubkeyhash','testnet');
		            let alice = await btcUtil.getECPairsbyAddr(answers[btcConfig.btcPasswd.name],  aliceAddr);
                    let walletRedeem = await ccUtil.redeemWithHashX(record.HashX, alice);
                    console.log('walletRedeem: ', walletRedeem);
                } catch (e) {
                    print4log('redeemWbtc error: ', e.message);

                    callback();
                    return;
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
            let records = [];
            let showArray = [];
            try{
                records = await ccUtil.getBtcWanTxHistory({status: 'waitingRevoke', chain: 'WAN'});
                showArray = btcScripts.checkTransaction(records, web3, btcUtil.hash160ToAddress);

            } catch (e) {
                print4log(btcConfig.listTransactions.error, e.message);

                callback();
                return;
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
                let patten = /^\d+$/ ;

                if (! patten.test(answers[btcConfig.revokeBtcHash.name]) ||
                    answers[btcConfig.revokeBtcHash.name] > showArray.length ||
                    !showArray[answers[btcConfig.revokeBtcHash.name] -1]) {

                    callback();
                    return;
                }

                let record = showArray[answers[btcConfig.revokeBtcHash.name] -1];

                try {
                    print4log(config.consoleColor.COLOR_FgGreen, btcConfig.waiting, '\x1b[0m');

                    let revokeWbtcHash = await ccUtil.sendWanCancel(ccUtil.wanSender, record.from,
                        config.gasLimit, config.gasPrice, '0x'+record.HashX, answers[btcConfig.wanPasswd.name]);

                    print4log('revokeWbtcHash: ', revokeWbtcHash);
                } catch (e) {
                    print4log('revokeWbtc error: ', e.message);

                    callback();
                    return;
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

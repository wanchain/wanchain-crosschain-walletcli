module.exports = async function (invoke,chainType,protocol="",opt="") {
    let config = require('../../config.js');
    let WalletCore = require('wanchain-crosschain');
    let walletCore = new WalletCore(config);
    // walletCore.init(config,function () {
    //     invoke(walletCore.createSendTransaction(chainType));
    // })
    global.walletCore = walletCore;
    try {
        await walletCore.init(config);
    }catch(error){
        console.log("Wallet initiate failed.");
        process.exit(0);
    }
    invoke(walletCore.createSendTransaction(chainType,protocol,opt));
}

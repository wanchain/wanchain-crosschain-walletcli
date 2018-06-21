module.exports = async function (invoke,chainType) {
    let config = require('../../config.js');
    let WalletCore = require('wanchainwalletcore');
    let walletCore = new WalletCore(config);
    // walletCore.init(config,function () {
    //     invoke(walletCore.createSendTransaction(chainType));
    // })
    global.walletCore = walletCore;
    await walletCore.init(config);
    invoke(walletCore.createSendTransaction(chainType));
}
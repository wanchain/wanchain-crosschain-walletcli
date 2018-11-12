const config = {};

if(global.isTestnet){
    config.network = 'testnet';
    config.networkPath = 'testnet';
    console.log("This is testnet");
}else {
    config.network = 'mainnet';
    config.networkPath = '';
    console.log("This is mainnet");
}
const path=require('path');
const bitcoin = require('bitcoinjs-lib');
const Logger = require('./logger/logger.js');
config.ccLog = path.join('logs', 'crossChainLog.log');
config.ccErr = path.join('logs', 'crossChainErr.log');
config.logger = new Logger('CrossChain',config.ccLog, config.ccErr,config.loglevel);
config.getLogger = function(name){
    return new Logger(name,config.ccLog, config.ccErr,config.loglevel);
}

config.gasLimit = 1000000;
config.gasPrice = 200000000000;


if (process.platform === 'darwin') {
    config.rpcIpcPath = path.join(process.env.HOME, '/Library/Wanchain',config.networkPath,'gwan.ipc');
    config.keyStorePath = path.join(process.env.HOME, '/Library/Wanchain/',config.networkPath,'keystore');
    config.ethkeyStorePath = path.join(process.env.HOME, '/Library/ethereum/',config.networkPath,'keystore/');
    config.databasePath = path.join(process.env.HOME,'Library/LocalDb');
} else if (process.platform === 'freebsd' || process.platform === 'linux' || process.platform === 'sunos') {
    config.rpcIpcPath = path.join(process.env.HOME, '.wanchain',config.networkPath,'gwan.ipc');
    config.keyStorePath = path.join(process.env.HOME, '.wanchain',config.networkPath,'keystore');
    config.ethkeyStorePath = path.join(process.env.HOME, '.ethereum',config.networkPath,'keystore');
    config.databasePath = path.join(process.env.HOME,'LocalDb');
} else if (process.platform === 'win32') {
    config.rpcIpcPath = '\\\\.\\pipe\\gwan.ipc';
    config.keyStorePath = path.join(process.env.APPDATA, 'wanchain', config.networkPath, 'keystore');
    config.ethkeyStorePath = path.join(process.env.APPDATA, 'ethereum', config.networkPath, 'keystore');
    config.databasePath = path.join(process.env.APPDATA,'LocalDb');
}

config.port = 8545;
config.useLocalNode = false;
config.loglevel = 'info';
//config.loglevel = 'debug';

config.MAX_CONFIRM_BLKS = 100000000;
config.MIN_CONFIRM_BLKS = 0;
config.listOption = true;
if(config.network == 'testnet'){
    config.bitcoinNetwork = bitcoin.networks.testnet;
    config.feeRate = 300;
    config.feeHard = 100000;
    config.confirmBlocks = 3;
    config.btcConfirmBlocks = 1;
    config.wanchainHtlcAddr = "0xd2f14b0067f6fc0d99311c055491b29f01b72004";
    config.WBTCToken = "0xa3158cdcb24702e5612d20275745901fbc69331e";
    config.socketUrl = 'wss://apitest.wanchain.info';
    config.btcWallet = path.join(config.databasePath, 'btcWallet.db');
    config.crossDbname = path.join(config.databasePath, 'crossTransDbBtc');
    config.defaultAmount = 0.002;
} else {
    config.bitcoinNetwork = bitcoin.networks.bitcoin;
    config.feeRate = 30;
    config.feeHard = 10000;
    config.confirmBlocks = 12;
    config.btcConfirmBlocks = 3;
    config.wanchainHtlcAddr = "0x802894ef36050c9b8e94f8d0979c75512491b7d5";
    config.WBTCToken = "0xfa4b6988e8cb90bb25e51ea80257ffcdd8ebdd24";
    config.socketUrl = 'wss://api.wanchain.info';
    config.btcWallet = path.join(config.databasePath, 'main_btcWallet.db');
    config.crossDbname = path.join(config.databasePath, 'main_crossTransDbBtc');
    config.defaultAmount = 0.0002;
}

config.wanKeyStorePath = config.keyStorePath;
config.ethKeyStorePath = config.ethkeyStorePath;


config.consoleColor = {
    'COLOR_FgRed': '\x1b[31m',
    'COLOR_FgYellow': '\x1b[33m',
    'COLOR_FgGreen': "\x1b[32m"
};


module.exports = config;

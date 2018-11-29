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
    config.wanchainHtlcAddr = "0xb248ed04e1f1bbb661b56f210e4b0399b2899d16";
    config.WBTCToken = "0x89a3e1494bc3db81dadc893ded7476d33d47dcbd";
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
    config.wanchainHtlcAddr = "0x50c53a4f6702c2713b3535fc896bc21597534906";
    config.WBTCToken = "0xd15e200060fc17ef90546ad93c1c61bfefdc89c7";
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

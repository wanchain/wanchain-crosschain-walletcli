const config = {};
var wanchainNet = 'testnet';
config.network = wanchainNet;
var ethereumNet = 'testnet';
const path=require('path');
const Logger = require('./logger/logger.js');
config.ccLog = path.join('logs', 'crossChainLog.log');
config.ccErr = path.join('logs', 'crossChainErr.log');
config.logger = new Logger('CrossChain',config.ccLog, config.ccErr,config.loglevel);
config.getLogger = function(name){
    return new Logger(name,config.ccLog, config.ccErr,config.loglevel);
}

config.gasLimit = 1000000;
config.gasPrice = 200000000000;
config.dataName = wanchainNet;


if (process.platform === 'darwin') {
    config.rpcIpcPath = path.join(process.env.HOME, '/Library/Wanchain',wanchainNet,'gwan.ipc');
    config.keyStorePath = path.join(process.env.HOME, '/Library/Wanchain/',wanchainNet,'keystore');
    config.ethkeyStorePath = path.join(process.env.HOME, '/Library/ethereum/',ethereumNet,'keystore/');
    config.databasePath = path.join(process.env.HOME,'Library/LocalDb');
} else if (process.platform === 'freebsd' || process.platform === 'linux' || process.platform === 'sunos') {
    config.rpcIpcPath = path.join(process.env.HOME, '.wanchain',wanchainNet,'gwan.ipc');
    config.keyStorePath = path.join(process.env.HOME, '.wanchain',wanchainNet,'keystore');
    config.ethkeyStorePath = path.join(process.env.HOME, '.ethereum',ethereumNet,'keystore');
    config.databasePath = path.join(process.env.HOME,'LocalDb');
} else if (process.platform === 'win32') {
    config.rpcIpcPath = '\\\\.\\pipe\\gwan.ipc';
    config.keyStorePath = path.join(process.env.APPDATA, 'wanchain', wanchainNet, 'keystore');
    config.ethkeyStorePath = path.join(process.env.APPDATA, 'ethereum', ethereumNet, 'keystore');
    config.databasePath = path.join(process.env.APPDATA,'LocalDb');
}

config.port = 8545;
config.useLocalNode = false;
config.loglevel = 'info';
//config.loglevel = 'debug';

config.MAX_CONFIRM_BLKS = 100000000;
config.MIN_CONFIRM_BLKS = 0;
config.listOption = true;
if(wanchainNet == 'testnet'){
    config.feeRate = 300;
    config.feeHard = 100000;
    config.confirmBlocks = 3;
    config.btcConfirmBlocks = 1;
    config.wanchainHtlcAddr = "0xef1b0855787dc964dda78db9551a2f8732b05ccf";
    config.WBTCToken = "0x6a40a70a0bd72de24918e6eec3cdc5e131e6b1cf";
    config.socketUrl = 'wss://apitest.wanchain.info';
    config.btcWallet = path.join(config.databasePath, 'btcWallet.db');
    config.crossDbname = path.join(config.databasePath, 'crossTransDbBtc');
} else {
    config.feeRate = 30;
    config.feeHard = 10000;
    config.confirmBlocks = 12;
    config.btcConfirmBlocks = 3;
    config.wanchainHtlcAddr = "0x4b11ae8ea012d8bb1e81410c02aa020e10b3871f";
    config.WBTCToken = "0x377f1a186ffce3a8b5d1662f8a7636c417721289";
    config.socketUrl = 'wss://api.wanchain.info';
    config.btcWallet = path.join(config.databasePath, 'main_btcWallet.db');
    config.crossDbname = path.join(config.databasePath, 'main_crossTransDbBtc');
}

config.wanKeyStorePath = config.keyStorePath;
config.ethKeyStorePath = config.ethkeyStorePath;


config.consoleColor = {
    'COLOR_FgRed': '\x1b[31m',
    'COLOR_FgYellow': '\x1b[33m',
    'COLOR_FgGreen': "\x1b[32m"
};


module.exports = config;

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
config.rpcIpcPath = process.env.HOME;
config.keyStorePath = process.env.HOME;
config.ethkeyStorePath = process.env.HOME;
if (process.platform === 'darwin') {
    config.rpcIpcPath += '/Library/Wanchain/'+'gwan.ipc';
    config.keyStorePath = path.join(config.keyStorePath, '/Library/wanchain/', wanchainNet, 'keystore/');
    config.ethkeyStorePath = path.join(config.ethkeyStorePath, '/Library/ethereum/',ethereumNet,'keystore/');
}

if (process.platform === 'freebsd' ||
    process.platform === 'linux' ||
    process.platform === 'sunos') {
    config.rpcIpcPath += '/.wanchain/'+'gwan.ipc';
    config.keyStorePath = path.join(config.keyStorePath, '.wanchain',wanchainNet,'keystore/');
    //config.btckeyStorePath = path.join(config.keyStorePath, '.bitcoin',wanchainNet,'keystore/');
    config.ethkeyStorePath = path.join(config.ethkeyStorePath, '.ethereum',ethereumNet,'keystore/');
}

if (process.platform === 'win32') {
    config.rpcIpcPath = '\\\\.\\pipe\\gwan.ipc';
    config.keyStorePath = path.join(process.env.APPDATA, 'wanchain', wanchainNet,'keystore\\');
    config.ethkeyStorePath = path.join(process.env.APPDATA, 'ethereum', ethereumNet,'keystore\\');
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
    config.confirmHeight = 1;
    config.wanchainHtlcAddr = "0xef1b0855787dc964dda78db9551a2f8732b05ccf";
    config.WBTCToken = "0x6a40a70a0bd72de24918e6eec3cdc5e131e6b1cf";
    config.socketUrl = 'wss://apitest.wanchain.info';
} else {
    config.feeRate = 30;
    config.feeHard = 10000;
    config.confirmHeight = 3;
    config.wanchainHtlcAddr = "0x4b11ae8ea012d8bb1e81410c02aa020e10b3871f";
    config.WBTCToken = "0x377f1a186ffce3a8b5d1662f8a7636c417721289";
    config.socketUrl = 'wss://api.wanchain.info';
}

config.wanKeyStorePath = config.keyStorePath;
config.ethKeyStorePath = config.ethkeyStorePath;


config.consoleColor = {
    'COLOR_FgRed': '\x1b[31m',
    'COLOR_FgYellow': '\x1b[33m',
    'COLOR_FgGreen': "\x1b[32m"
};


module.exports = config;

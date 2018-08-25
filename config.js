const config = {};
// config.socketUrl = 'ws://192.168.1.77:8080/';
config.socketUrl = 'wss://18.237.186.227/';
var wanchainNet = 'testnet';
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
config.feeRate = 55;

config.databasePath = process.env.HOME;
if (process.platform === 'win32') {
    config.databasePath = process.env.APPDATA;
}
config.databasePath =  path.join(config.databasePath, 'LocalDb');

config.wanKeyStorePath = config.keyStorePath;
config.ethKeyStorePath = config.ethkeyStorePath;



config.crossDbname = 'crossTransDb';
config.crossCollection = 'crossTransaction';
config.confirmBlocks = 1;

config.consoleColor = {
    'COLOR_FgRed': '\x1b[31m',
    'COLOR_FgYellow': '\x1b[33m',
    'COLOR_FgGreen': "\x1b[32m"
};


module.exports = config;

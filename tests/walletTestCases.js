const assert = require('chai').assert;
const expect = require("chai").expect;

let testCore = require('./comm/testCore.js');
const config = require('../config.js');

const fs = require('fs');

const password = "wanglu";
const sleepTime = 90000;

const stateDict = {
sentHashPending: 1,
sentHashConfirming:2,
waitingCross:3,
waitingCrossConfirming:4,
waitingX:5,
sentXPending:6,
sentXConfirming:7,
refundFinished:8,
waitingRevoke:9,
sentRevokePending:10,
sentRevokeConfirming:11,
revokeFinished:12
}

var ethAccounts = {}
var wanAccounts = {}
function initAccounts(keyStorePath) {
  let files = fs.readdirSync(keyStorePath);
  let index = 1;
  let accounts = {};
  for (var i in files) {
    var item = files[i];
    let filename = keyStorePath + item;
    var stat = fs.lstatSync(filename);
    if (!stat.isDirectory()) {
      accounts[index] = '0x' + filename.split('--')[2]
    }
  }
  return accounts;
}

function listAccounts() {
  ethAccounts = initAccounts(config.ethKeyStorePath);
  wanAccounts = initAccounts(config.wanKeyStorePath);
  console.log("ethAccounts are", ethAccounts);
  console.log("wanAccounts are", wanAccounts);
}

function getEthAccounts(index) {
  if(ethAccounts.hasOwnProperty(index)) {
    return ethAccounts[index];
  } else {
    return index;
  }
}

function getWanAccounts(index) {
  if(wanAccounts.hasOwnProperty(index)) {
    return wanAccounts[index];
  } else {
    return index;
  }
}

const templateCommand = require("./comm/templateCmd.js").templateCommand;

describe.only('New Command Wallet test cases', () => {
  let exception;
  let testcore;
  let option;
  let record;

  before(async function() {
    listAccounts();
    testcore = new testCore(config);
  });

  after(function() {
    testcore.close();
  });

  it.only('TC1001: ETH-WETH Trans normal case.', async () => {
    let lockETHCmd = new templateCommand("LockETH");
    let lockETHCmdOptions = {
      from: '1',
      storemanGroup: '1',
      cross: getWanAccounts(1),
      amount: '0.01',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };
    let refundWANCmd = new templateCommand("RefundWAN");
    let refundWANCmdOptions = {
      lockTxHash: '1',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };

    let result;
    let waitBlocks = config.confirmBlocks;

    let lockTxHash = await lockETHCmd.runProc(lockETHCmdOptions);
    console.log("LockETH successfully with result-lockTxHash", lockTxHash);

    await testcore.init();
    lockTxHash = lockTxHash.replace(/[\r\n]/g, "");
    option = {
      'lockTxHash': lockTxHash
    };

    refundWANCmdOptions.lockTxHash = lockTxHash;
    record = await testcore.getRecord(option);
    assert.equal(record.lockTxHash, lockTxHash);
    assert.equal(record.status, 'sentHashPending', "record.status is wrong");

    while(stateDict[record.status] < stateDict['waitingX']) {
        record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingX', "record.status is wrong");

    await testcore.close();
    let refundTxHash = await refundWANCmd.runProc(refundWANCmdOptions);
    refundTxHash = refundTxHash.replace(/[\r\n]/g, "");
    await testcore.init();

    while(stateDict[record.status] < stateDict['refundFinished']) {
        record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    result = await testcore.checkXConfirm(record, waitBlocks);
    assert.equal(record.refundTxHash, refundTxHash);
    assert.equal(record.status, 'refundFinished', "record.status is wrong");
  });
});
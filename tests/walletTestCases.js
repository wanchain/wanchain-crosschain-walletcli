'use strict';

const assert = require('chai').assert;
const expect = require("chai").expect;

let testCore = require('./comm/testCore.js');
const config = require('../config.js');

const fs = require('fs');

const password = "wanglu";
let sleepTime;

const stateDict = {
  sentHashPending: 1,
  sentHashConfirming: 2,
  waitingCross: 3,
  waitingCrossConfirming: 4,
  waitingX: 5,
  sentXPending: 6,
  sentXConfirming: 7,
  refundFinished: 8,
  waitingRevoke: 9,
  sentRevokePending: 10,
  sentRevokeConfirming: 11,
  revokeFinished: 12
};

var ethAccounts = {};
var wanAccounts = {};

function initAccounts(keyStorePath) {
  let files = fs.readdirSync(keyStorePath);
  let index = 1;
  let accounts = {};
  for (var i in files) {
    var item = files[i];
    let filename = keyStorePath + item;
    var stat = fs.lstatSync(filename);
    if (!stat.isDirectory()) {
      accounts[index] = '0x' + filename.split('--')[2];
      index++;
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
  if (ethAccounts.hasOwnProperty(index)) {
    return ethAccounts[index];
  } else {
    return index;
  }
}

function getWanAccounts(index) {
  if (wanAccounts.hasOwnProperty(index)) {
    return wanAccounts[index];
  } else {
    return index;
  }
}

function checkHash(hash) {
  let thash = hash.replace(/[\r\n]/g, "");
  return (/^(0x)?[0-9a-fA-F]{64}$/i.test(thash));
}

const templateCommand = require("./comm/templateCmd.js").templateCommand;

describe('New Command Wallet test cases', () => {
  let testcore;
  let option;
  let record;

  before(async function() {
    listAccounts();
    testcore = new testCore(config);
  });

  after(function() {
    if (!testcore.isClose) {
      testcore.close();
    }
  });

  it('TC0001: ETH-WETH Trans normal case.', async () => {
    sleepTime = 90000;
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

    let isHash = checkHash(lockTxHash);
    assert.equal(isHash, true);

    lockTxHash = lockTxHash.replace(/[\r\n]/g, "");
    option = {
      'lockTxHash': lockTxHash
    };

    refundWANCmdOptions.lockTxHash = lockTxHash;
    record = await testcore.getRecord(option);
    assert.equal(record.lockTxHash, lockTxHash);
    assert.equal(record.status, 'sentHashPending', "record.status is wrong");

    while (stateDict[record.status] < stateDict['waitingX']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingX', "record.status is wrong");

    await testcore.close();
    let refundTxHash = await refundWANCmd.runProc(refundWANCmdOptions);
    refundTxHash = refundTxHash.replace(/[\r\n]/g, "");

    isHash = checkHash(refundTxHash);
    assert.equal(isHash, true);

    await testcore.init();

    while (stateDict[record.status] < stateDict['refundFinished']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    result = await testcore.checkXConfirm(record, waitBlocks);
    assert.equal(record.refundTxHash, refundTxHash);
    assert.equal(record.status, 'refundFinished', "record.status is wrong");

    await testcore.close();
  });

  it('TC0002: ETH-WETH Trans normal case status check.', async () => {
    sleepTime = 3000;
    let lockETHCmd = new templateCommand("LockETH");
    let lockETHCmdOptions = {
      from: '1',
      storemanGroup: '1',
      cross: '0x6A8299deccd420d5b6970d611AFB25Cc8e910220',
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

    let isHash = checkHash(lockTxHash);
    assert.equal(isHash, true);

    lockTxHash = lockTxHash.replace(/[\r\n]/g, "");
    option = {
      'lockTxHash': lockTxHash
    };

    refundWANCmdOptions.lockTxHash = lockTxHash;
    record = await testcore.getRecord(option);
    assert.equal(record.lockTxHash, lockTxHash);
    assert.equal(record.status, 'sentHashPending', "record.status is wrong");

    while (stateDict[record.status] === stateDict['sentHashPending']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'sentHashConfirming', "record.status is wrong");
    // result = await testcore.checkOriginLockOnline(record);

    while (stateDict[record.status] === stateDict['sentHashConfirming']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingCross', "record.status is wrong");
    // result = await testcore.checkHashConfirm(record, waitBlocks);

    while (stateDict[record.status] === stateDict['waitingCross']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingCrossConfirming', "record.status is wrong");
    // result = await testcore.checkCrossHashOnline(record);

    while (stateDict[record.status] === stateDict['waitingCrossConfirming']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingX', "record.status is wrong");
    // result = await testcore.checkCrossHashConfirm(record, waitBlocks);

    await testcore.close();
    let refundTxHash = await refundWANCmd.runProc(refundWANCmdOptions);
    console.log("refundWAN successfully with result-refundTxHash", refundTxHash);
    refundTxHash = refundTxHash.replace(/[\r\n]/g, "");

    isHash = checkHash(refundTxHash);
    assert.equal(isHash, true);

    await testcore.init();

    while (stateDict[record.status] === stateDict['waitingX']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.refundTxHash, refundTxHash);
    assert.equal(record.status, 'sentXPending', "record.status is wrong");

    while (stateDict[record.status] === stateDict['sentXPending']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'sentXConfirming', "record.status is wrong");
    // result = await testcore.checkXOnline(record);

    while (stateDict[record.status] === stateDict['sentXConfirming']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.refundTxHash, refundTxHash);
    assert.equal(record.status, 'refundFinished', "record.status is wrong");
    // result = await testcore.checkXConfirm(record, waitBlocks);

    await testcore.close();
  });

  it('TC0003: ETH-WETH LockETH wrong from case.', async () => {
    let lockETHCmd = new templateCommand("LockETH");
    let lockETHCmdOptions = {
      from: '10',
      storemanGroup: '1',
      cross: getWanAccounts(1),
      amount: '0.01',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };

    let result = await lockETHCmd.runProc(lockETHCmdOptions);
    assert.equal(result, 'You entered the wrong number.');
  });

  it('TC0004: ETH-WETH RevokeETHTrans normal case.', async () => {
    sleepTime = 40000;
    option = {
      'to': config.originalChainHtlc,
      'status': 'waitingRevoke'
    };
    record = [];

    try {
      await testcore.init();
      record = await testcore.getRecord(option);
      await testcore.close();

      if (record.length !== 0) {
        assert.equal(record.status, 'waitingRevoke');

        let revokeETHCmd = new templateCommand("RevokeETH");
        let revokeCmdOptions = {
          gasPrice: '200',
          gas: '2000000',
          password: password
        };
        let lockTxHash = record.lockTxHash;
        revokeCmdOptions.lockTxHash = lockTxHash;

        let revokeTxHash = await revokeETHCmd.runProc(revokeCmdOptions);
        revokeTxHash = revokeTxHash.replace(/[\r\n]/g, "");

        let isHash = checkHash(revokeTxHash);
        assert.equal(isHash, true);

        await testcore.init();
        option = {
          'lockTxHash': lockTxHash
        };
        while (stateDict[record.status] < stateDict['revokeFinished']) {
          record = await testcore.sleepAndUpdateStatus(sleepTime, option);
        }
        await testcore.close();

        assert.equal(record.revokeTxHash, revokeTxHash);
        assert.equal(record.status, 'revokeFinished', "record.status is wrong");
      }
    } catch (err) {
      console.log(err, ", no local Trans need to revoke");
    }
  });

  it.skip('TC0005: WETH-ETH RevokeWANTrans normal case.', async () => {
    sleepTime = 40000;
    option = {
      'to': config.wanchainHtlcAddr,
      'status': 'waitingRevoke'
    };
    record = [];

    try {
      await testcore.init();
      record = await testcore.getRecord(option);
      await testcore.close();

      if (record.length !== 0) {
        assert.equal(record.status, 'waitingRevoke');

        let revokeWANCmd = new templateCommand("RevokeWAN");
        let revokeCmdOptions = {
          gasPrice: '200',
          gas: '2000000',
          password: password
        };
        let lockTxHash = record.lockTxHash;
        revokeCmdOptions.lockTxHash = lockTxHash;

        let revokeTxHash = await revokeWANCmd.runProc(revokeCmdOptions);
        revokeTxHash = revokeTxHash.replace(/[\r\n]/g, "");

        let isHash = checkHash(revokeTxHash);
        assert.equal(isHash, true);

        await testcore.init();
        option = {
          'lockTxHash': lockTxHash
        };
        while (stateDict[record.status] < stateDict['revokeFinished']) {
          record = await testcore.sleepAndUpdateStatus(sleepTime, option);
        }
        await testcore.close();

        assert.equal(record.revokeTxHash, revokeTxHash);
        assert.equal(record.status, 'revokeFinished', "record.status is wrong");
      }
    } catch (err) {
      console.log(err, ", no local Trans need to revoke");
    }
  });
});
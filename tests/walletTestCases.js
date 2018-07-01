'use strict';

const assert = require('chai').assert;
const expect = require("chai").expect;

let testCore = require('./comm/testCore.js');
const config = require('../config.js');

const fs = require('fs');
var BigNumber = require('bignumber.js');
const gWei = 1000000000;

const password = "wanglu";
let sleepTime;
let needClose = false;

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
  revokeFinished: 12,
  sentHashFailed: 13
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

describe.only('New Command Wallet test cases', () => {
  let testcore;
  let option;
  let record;

  before(async function() {
    listAccounts();
    testcore = new testCore(config);
  });

  afterEach(function() {
    if (needClose && (!testcore.isClose)) {
      testcore.close();
    }
  });

  it('TC0001: ETH-WETH Trans normal case.', async () => {
    sleepTime = 90000;
    needClose = true;
    let lockETHCmd = new templateCommand("LockETH");
    let lockETHCmdOptions = {
      from: '1',
      storemanGroup: '1',
      cross: getWanAccounts(1),
      amount: '0.5',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };
    let refundWANCmd = new templateCommand("RefundWAN");
    let refundWANCmdOptions = {
      lockTxHash: '1',
      gasPrice: '300',
      gas: '2000000',
      password: password
    };

    let result;
    let waitBlocks = config.confirmBlocks;

    await testcore.init();
    let beforeETHBalance = new BigNumber((await testcore.getEthAccountsInfo(getEthAccounts(lockETHCmdOptions.from))).balance);
    let beforeWanAccountInfo = await testcore.getWanAccountsInfo(lockETHCmdOptions.cross);
    let beforeWETHBalance = new BigNumber(beforeWanAccountInfo.wethBalance);
    let beforeWANBalance = new BigNumber(beforeWanAccountInfo.balance);

    await testcore.close();

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

    while (stateDict[record.status] < stateDict['waitingCross']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }

    let receipt = await testcore.getTxReceipt('ETH', lockTxHash);
    assert.equal(receipt.status, "0x1");

    let gasUsed = new BigNumber(receipt.gasUsed);
    let gasPrice = new BigNumber(lockETHCmdOptions.gasPrice);
    let afterStep1ETHBalance = new BigNumber((await testcore.getEthAccountsInfo(getEthAccounts(lockETHCmdOptions.from))).balance);

    assert.equal(afterStep1ETHBalance.toString(), beforeETHBalance.sub(testcore.web3.toWei(lockETHCmdOptions.amount)).sub(gasPrice.mul(gasUsed).mul(gWei)).toString());

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

    assert.equal(result.status, "0x1");
    assert.equal(result.from, lockETHCmdOptions.cross.toLowerCase());
    let gasUsed2 = new BigNumber(result.gasUsed);
    let gasPrice2 = new BigNumber(refundWANCmdOptions.gasPrice);
    let afterStep2ETHBalance = new BigNumber((await testcore.getEthAccountsInfo(getEthAccounts(lockETHCmdOptions.from))).balance);
    let afterStep2WanAccountInfo = await testcore.getWanAccountsInfo(lockETHCmdOptions.cross);
    let afterStep2WETHBalance = new BigNumber(afterStep2WanAccountInfo.wethBalance);
    let afterStep2WANBalance = new BigNumber(afterStep2WanAccountInfo.balance);

    assert.equal(afterStep2ETHBalance.toString(), afterStep1ETHBalance.toString());
    assert.equal(afterStep2WETHBalance.toString(), beforeWETHBalance.add(testcore.web3.toWei(lockETHCmdOptions.amount)).toString());
    assert.equal(afterStep2WANBalance.toString(), beforeWANBalance.sub(gasPrice2.mul(gasUsed2).mul(gWei)).toString());

    await testcore.close();
  });

  it('TC0002: ETH-WETH Trans normal case status check.', async () => {
    sleepTime = 4000;
    needClose = true;
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
    needClose = false;
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
    needClose = true;
    option = {
      'to': config.originalChainHtlc,
      'status': 'waitingRevoke'
    };
    record = [];
    let beforeETHBalance;
    let beforeWanAccountInfo;

    try {
      await testcore.init();
      record = await testcore.getRecord(option);

      if (record.length !== 0) {
        let receipt = await testcore.getTxReceipt('ETH', record.lockTxHash);
        assert.equal(receipt.status, "0x1");

        beforeETHBalance = new BigNumber((await testcore.getEthAccountsInfo(record.from)).balance);
        beforeWanAccountInfo = await testcore.getWanAccountsInfo(record.crossAdress);
      }

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

        let revokeReceipt = await testcore.getTxReceipt('ETH', revokeTxHash);
        assert.equal(revokeReceipt.status, "0x1");
        assert.equal(revokeReceipt.from, record.from);

        let beforeWETHBalance = new BigNumber(beforeWanAccountInfo.wethBalance);
        let beforeWANBalance = new BigNumber(beforeWanAccountInfo.balance);

        let amount = record.value;
        let gasUsed = new BigNumber(revokeReceipt.gasUsed);
        let gasPrice = new BigNumber(revokeCmdOptions.gasPrice);
        let afterETHBalance = new BigNumber((await testcore.getEthAccountsInfo(record.from)).balance);
        let afterWanAccountInfo = await testcore.getWanAccountsInfo(record.crossAdress);
        let afterWETHBalance = new BigNumber(afterWanAccountInfo.wethBalance);
        let afterWANBalance = new BigNumber(afterWanAccountInfo.balance);

        await testcore.close();

        assert.equal(record.revokeTxHash, revokeTxHash);
        assert.equal(record.status, 'revokeFinished', "record.status is wrong");

        assert.equal(afterETHBalance.toString(), beforeETHBalance.add(testcore.web3.toWei(amount)).sub(gasPrice.mul(gasUsed).mul(gWei)).toString());
        assert.equal(beforeWETHBalance.toString(), afterWETHBalance.toString());
        assert.equal(beforeWANBalance.toString(), afterWANBalance.toString());
      }
    } catch (err) {
      assert.equal(err, "Record was not found");
      console.log(err, ", no local Trans need to revoke");
    }
  });

  it('TC0005: WETH-ETH Trans normal case.', async () => {
    sleepTime = 90000;
    needClose = true;
    let lockWANCmd = new templateCommand("LockWAN");
    let lockWANCmdOptions = {
      from: '1',
      storemanGroup: '1',
      cross: getEthAccounts(1),
      amount: '0.5',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };
    let refundETHCmd = new templateCommand("RefundETH");
    let refundETHCmdOptions = {
      lockTxHash: '1',
      gasPrice: '300',
      gas: '2000000',
      password: password
    };

    let result;
    let waitBlocks = config.confirmBlocks;

    await testcore.init();

    let beforeETHBalance = new BigNumber((await testcore.getEthAccountsInfo(lockWANCmdOptions.cross)).balance);
    let beforeWanAccountInfo = await testcore.getWanAccountsInfo(getWanAccounts(lockWANCmdOptions.from));
    let beforeWETHBalance = new BigNumber(beforeWanAccountInfo.wethBalance);
    let beforeWANBalance = new BigNumber(beforeWanAccountInfo.balance);

    await testcore.close();

    let lockTxHash = await lockWANCmd.runProc(lockWANCmdOptions);
    console.log("LockWAN successfully with result-lockTxHash", lockTxHash);

    await testcore.init();

    let isHash = checkHash(lockTxHash);
    assert.equal(isHash, true);

    lockTxHash = lockTxHash.replace(/[\r\n]/g, "");
    option = {
      'lockTxHash': lockTxHash
    };

    refundETHCmdOptions.lockTxHash = lockTxHash;
    record = await testcore.getRecord(option);
    assert.equal(record.lockTxHash, lockTxHash);
    assert.equal(record.status, 'sentHashPending', "record.status is wrong");

    while (stateDict[record.status] < stateDict['waitingCross']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }

    let receipt = await testcore.getTxReceipt('WAN', lockTxHash);
    assert.equal(receipt.status, "0x1");

    let gasUsed = new BigNumber(receipt.gasUsed);
    let gasPrice = new BigNumber(lockWANCmdOptions.gasPrice);
    let c2wRatio = await testcore.getEthC2wRatio();
    let txFeeRatio = (await testcore.getEthStoremanInfo(lockWANCmdOptions.storemanGroup)).txFeeRatio;
    let fee = testcore.backend.calculateLocWanFee(lockWANCmdOptions.amount, c2wRatio, txFeeRatio);

    let afterStep1ETHBalance = new BigNumber((await testcore.getEthAccountsInfo(lockWANCmdOptions.cross)).balance);
    let afterStep1WanAccountInfo = await testcore.getWanAccountsInfo(getWanAccounts(lockWANCmdOptions.from));
    let afterStep1WETHBalance = new BigNumber(afterStep1WanAccountInfo.wethBalance);
    let afterStep1WANBalance = new BigNumber(afterStep1WanAccountInfo.balance);

    assert.equal(afterStep1ETHBalance.toString(), beforeETHBalance.toString());
    assert.equal(afterStep1WETHBalance.toString(), beforeWETHBalance.sub(testcore.web3.toWei(lockWANCmdOptions.amount)).toString());
    assert.equal(afterStep1WANBalance.toString(), beforeWANBalance.sub(gasPrice.mul(gasUsed).mul(gWei)).sub(fee).toString());

    while (stateDict[record.status] < stateDict['waitingX']) {
      record = await testcore.sleepAndUpdateStatus(sleepTime, option);
    }
    assert.equal(record.status, 'waitingX', "record.status is wrong");

    await testcore.close();
    let refundTxHash = await refundETHCmd.runProc(refundETHCmdOptions);
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

    assert.equal(result.status, "0x1");
    assert.equal(result.from, lockWANCmdOptions.cross.toLowerCase());
    let gasUsed2 = new BigNumber(result.gasUsed);
    let gasPrice2 = new BigNumber(refundETHCmdOptions.gasPrice);
    let afterStep2ETHBalance = new BigNumber((await testcore.getEthAccountsInfo(lockWANCmdOptions.cross)).balance);

    assert.equal(afterStep2ETHBalance.toString(), beforeETHBalance.add(testcore.web3.toWei(lockWANCmdOptions.amount)).sub(gasPrice2.mul(gasUsed2).mul(gWei)).toString());

    await testcore.close();
  });

  it('TC0006: WETH-ETH Trans normal case status check.', async () => {
    sleepTime = 4000;
    needClose = true;
    let lockWANCmd = new templateCommand("LockWAN");
    let lockWANCmdOptions = {
      from: '1',
      storemanGroup: '1',
      cross: getEthAccounts(1),
      amount: '0.01',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };
    let refundETHCmd = new templateCommand("RefundETH");
    let refundETHCmdOptions = {
      lockTxHash: '1',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };

    let result;
    let waitBlocks = config.confirmBlocks;

    let lockTxHash = await lockWANCmd.runProc(lockWANCmdOptions);
    console.log("LockWAN successfully with result-lockTxHash", lockTxHash);

    await testcore.init();

    let isHash = checkHash(lockTxHash);
    assert.equal(isHash, true);

    lockTxHash = lockTxHash.replace(/[\r\n]/g, "");
    option = {
      'lockTxHash': lockTxHash
    };

    refundETHCmdOptions.lockTxHash = lockTxHash;
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
    let refundTxHash = await refundETHCmd.runProc(refundETHCmdOptions);
    console.log("refundETH successfully with result-refundTxHash", refundTxHash);
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

  it('TC0007: WETH-ETH LockWAN wrong from case.', async () => {
    needClose = false;
    let lockWANCmd = new templateCommand("LockWAN");
    let lockWANCmdOptions = {
      from: '10',
      storemanGroup: '1',
      cross: getWanAccounts(1),
      amount: '0.01',
      gasPrice: '200',
      gas: '2000000',
      password: password
    };

    let result = await lockWANCmd.runProc(lockWANCmdOptions);
    assert.equal(result, 'You entered the wrong number.');
  });

  it('TC0008: WETH-ETH RevokeWANTrans normal case.', async () => {
    sleepTime = 40000;
    needClose = true;
    option = {
      'to': config.wanchainHtlcAddr,
      // 'lockTxHash': '0x9bf26086940010d95fc3c228089a230f8ebf90d0303b92450e9106b189edc4be',
      'status': 'waitingRevoke'
    };
    record = [];
    let beforeETHBalance;
    let beforeWanAccountInfo;

    try {
      await testcore.init();
      record = await testcore.getRecord(option);

      if (record.length !== 0) {
        let receipt = await testcore.getTxReceipt('WAN', record.lockTxHash);
        assert.equal(receipt.status, "0x1");

        beforeETHBalance = new BigNumber((await testcore.getEthAccountsInfo(record.crossAdress)).balance);
        beforeWanAccountInfo = await testcore.getWanAccountsInfo(record.from);
      }

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

        let beforeWETHBalance = new BigNumber(beforeWanAccountInfo.wethBalance);
        let beforeWANBalance = new BigNumber(beforeWanAccountInfo.balance);

        let revokeReceipt = await testcore.getTxReceipt('WAN', revokeTxHash);
        assert.equal(revokeReceipt.status, "0x1");
        assert.equal(revokeReceipt.from, record.from);

        let amount = record.value;
        let gasUsed = new BigNumber(revokeReceipt.gasUsed);
        let gasPrice = new BigNumber(revokeCmdOptions.gasPrice);

        let afterETHBalance = new BigNumber((await testcore.getEthAccountsInfo(record.crossAdress)).balance);
        let afterWanAccountInfo = await testcore.getWanAccountsInfo(record.from);
        let afterWETHBalance = new BigNumber(afterWanAccountInfo.wethBalance);
        let afterWANBalance = new BigNumber(afterWanAccountInfo.balance);

        let c2wRatio = await testcore.getEthC2wRatio();
        let txFeeRatio = (await testcore.getEthStoremanInfo(record.storeman)).txFeeRatio;
        let fee = testcore.backend.calculateLocWanFee(amount, c2wRatio, txFeeRatio);

        await testcore.close();

        assert.equal(record.revokeTxHash, revokeTxHash);
        assert.equal(record.status, 'revokeFinished', "record.status is wrong");

        assert.equal(afterETHBalance.toString(), beforeETHBalance.toString());
        assert.equal(afterWETHBalance.toString(), beforeWETHBalance.add(testcore.web3.toWei(amount)).toString());
        assert.equal(afterWANBalance.toString(), beforeWANBalance.sub(gasPrice.mul(gasUsed).mul(gWei)).add(fee).toString());
      }
    } catch (err) {
      assert.equal(err, "Record was not found");
      console.log(err, ", no local Trans need to revoke");
    }
  });
});
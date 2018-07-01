'use strict';

const assert = require('chai').assert;
const xlsx = require('node-xlsx');
const fs = require('fs');

const testCore = require('./comm/testCore.js');
const templateCommand = require("./comm/templateCmd.js").templateCommand;
const config = require('../config.js');
const password = "wanglu";
const sleepTime = 90000;
const skipKeyword = 'skip';

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

const testCaseFile = __dirname + '/testcase/CommandWalletTestCase.xlsx';
const xlsxTestCaseIndex = 0;
const xlsxHeader = {
  tcId: "ID",
  summary: "Summary",
  type: "CaseType",
  operType: "OperationType",
  firstCMD: "First Command",
  secondCMD: "Second Command",
  firstOption: "First InputOption",
  secondOption: "Second InputOption",
  flag: "Flag",
  output: "Output",
  status: "Status"
};

const workSheet = xlsx.parse(testCaseFile);
let testData = workSheet[xlsxTestCaseIndex].data;

for (let i = testData.length - 1; i >= 0; i--) {
  if (testData[i].length === 0) {
    testData.splice(i);
  }
}

let xlsxHeaderPos = {};
let header = testData[0];

for (let i = 0; i < header.length; i++) {
  for (let key in xlsxHeader) {
    if (header[i] === xlsxHeader[key]) {
      xlsxHeaderPos[key] = i;
    }
  }
}

function checkHash(hash) {
  let thash = hash.replace(/[\r\n]/g, "");
  if (/^(0x)?[0-9a-fA-F]{64}$/i.test(thash)) {
    // check if it has the basic requirements of an hash
    return true;
  } else {
    return false;
  }
}

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

describe("Command Wallet Auto Test", function() {
  // let testcore;

  before(function() {
    console.log(testCaseFile);
    listAccounts();
    // testcore = new testCore(config);
  });

  after(function() {
    // if (!testcore.isClose) {
    //   testcore.close();
    // }
  });

  for (let i = 1; i < testData.length; i++) {
    if (testData[i].length !== 0 &&
      // testData[i][xlsxHeaderPos.tcId] === 'TC1007' &&
      // testData[i][xlsxHeaderPos.type] === 'Sunny' &&
      testData[i][xlsxHeaderPos.flag] !== skipKeyword) {
      let tcid = testData[i][xlsxHeaderPos.tcId];
      let summary = testData[i][xlsxHeaderPos.summary];
      let type = testData[i][xlsxHeaderPos.type];
      let operType = testData[i][xlsxHeaderPos.operType];
      let output = testData[i][xlsxHeaderPos.output];
      let status = testData[i][xlsxHeaderPos.status];
      let flag = testData[i][xlsxHeaderPos.flag];
      let record;
      let option;

      it(tcid + ':' + operType + '-->' + type + '-->' + summary, async () => {
        let command1 = testData[i][xlsxHeaderPos.firstCMD];
        let option1 = JSON.parse(testData[i][xlsxHeaderPos.firstOption]);

        if (option1.password == undefined) {
          option1.password = password;
        }
        
        if (!(/^(0x)?[0-9a-fA-F]{40}$/i.test(option1.cross))) {
          let cross = getWanAccounts(option1.cross);
          option1.cross = cross;
        }

        let firstCmd = new templateCommand(command1);
        let result = await firstCmd.runProc(option1);

        if ((flag === 1 && type === 'Rainy') || result === null || (!checkHash(result))) {
          assert.equal(result, output);
        } else {
          let testcore = new testCore(config);
          await testcore.init();
          // testcore.mrinit();

          let lockTxHash = result.replace(/[\r\n]/g, "");
          let isHash = checkHash(lockTxHash);
          assert.equal(isHash, true);
          option = {
            'lockTxHash': lockTxHash
          };

          record = await testcore.getRecord(option);
          assert.equal(record.lockTxHash, lockTxHash);

          if (flag === 1 && type === 'Sunny') {
            assert.equal(record.status, status, "record.status is wrong");
          } else {
            assert.equal(record.status, 'sentHashPending', "record.status is wrong");

            while (stateDict[record.status] < stateDict['waitingX']) {
              record = await testcore.sleepAndUpdateStatus(sleepTime, option);
            }
            assert.equal(record.status, 'waitingX', "record.status is wrong");

            await testcore.close();

            let command2 = testData[i][xlsxHeaderPos.secondCMD];
            let option2 = JSON.parse(testData[i][xlsxHeaderPos.secondOption]);
            option2.password = password;
            option2.lockTxHash = lockTxHash;
            let secondCmd = new templateCommand(command2);
            result = await secondCmd.runProc(option2);

            if (type === 'Sunny'|| result === null || (!checkHash(result))) {
              let resultTxHash = result.replace(/[\r\n]/g, "");
              let isHash = checkHash(resultTxHash);
              assert.equal(isHash, true);

              await testcore.init();
              // testcore.mrinit();

              if (command2 === 'RefundWAN' || command2 === 'RefundETH') {
                while (stateDict[record.status] < stateDict['refundFinished']) {
                  record = await testcore.sleepAndUpdateStatus(sleepTime, option);
                }
                assert.equal(record.refundTxHash, resultTxHash);
              }
              if (command2 === 'RevokeWAN' || command2 === 'RevokeETH') {
                while (stateDict[record.status] < stateDict['revokeFinished']) {
                  record = await testcore.sleepAndUpdateStatus(sleepTime, option);
                }
                assert.equal(record.revokeTxHash, resultTxHash);
              }
              assert.equal(record.status, status, "record.status is wrong");
            } else {
              assert.equal(result, output);
            }
          }
          await testcore.close();
        }
      });
    }
  }
});
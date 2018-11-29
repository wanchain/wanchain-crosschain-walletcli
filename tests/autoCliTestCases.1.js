'use strict';

const assert = require('chai').assert;
const xlsx = require('node-xlsx');
const child_process = require('child_process');

const testnet = true;
const skipKeyword = 'skip';
const password = process.env.KEYSTORE_PWD; //wanglu

const testCaseFile = __dirname + '/testcase/autoCliTestCase.xlsx';

const xlsxTestCaseIndex = 0;
const xlsxHeader = {
  tcId: "ID",
  type: "CaseType",
  operType: "OperationType",
  summary: "Summary",
  command: "Command",
  sourceChain: "sourceChain",
  source_storeman: "source_storeman",
  wan_storeman: "wan_storeman",
  from_account: "from_account",
  to_account: "to_account",
  tokenAddr: "tokenAddr",
  tokenSymbol: "tokenSymbol",
  amount: "amount",
  hashX: "hashX",
  flag: "flag",
  status: "status",
  comments: "Comments",
  priority: "priority"
};

const commandDict = {
  approve: "expect_approve.sh",
  balance: "expect_balance.sh",
  create: "expect_create.sh",
  list: "expect_list.sh",
  lock: "expect_lock.sh",
  redeem: "expect_redeem.sh",
  revoke: "expect_revoke.sh",
  transfer: "expect_transfer.sh"
}


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

function sleep(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, time);
  })
}

function execProc(command) {
	let cmd = command;
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, function(err, stdout, stderr) {
      if (err) {
        console.log('execProc error:' + cmd + stderr);
        reject(stderr);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  })
}

function buildCommand(testdata) {
  let command;
  command = __dirname + '/expect/' + commandDict[testdata.command];
  let testLabel = testdata.tcid + '_' + testdata.type + '_case';
  testLabel = '"' + testLabel + ' ' + testdata.summary + '"';
  switch (testdata.command) {
    case 'approve':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' '  + password + ' '  + testdata.sourceChain + ' '  + testdata.tokenAddr + ' '  + testdata.from_account + ' '  + testdata.amount;
        break;
      }
    case 'balance':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain + ' ' + testdata.tokenAddr + ' ' + testdata.from_account;
        break;
      }
    case 'create':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + password + ' ' + testdata.sourceChain;
        break;
      }
    case 'list':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain + ' ' + testdata.tokenAddr;
        break;
      }
    case 'lock':
      {
        let storeman;
        if (testdata.sourceChain === 'ETH' || testdata.sourceChain === 1) {
          storeman = testdata.source_storeman;
        } else {
          storeman = testdata.wan_storeman;
        }
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + password + ' ' + testdata.sourceChain + ' ' + storeman + ' ' + testdata.tokenAddr + ' ' + testdata.from_account + ' ' + testdata.to_account + ' ' + testdata.amount;
        break;
      }
    case 'redeem':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + password + ' ' + testdata.hashX;
        break;
      }
    case 'revoke':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + password + ' ' + testdata.hashX;
        break;
      }
    case 'transfer':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + password + ' ' + testdata.sourceChain + ' ' + testdata.tokenAddr + ' ' + testdata.from_account + ' ' + testdata.to_account + ' ' + testdata.amount;
        break;
      }
    default:
      break;
  }
  return command;
}

async function autoTest() {

  await execProc('echo "" > ./test_result');
  await execProc('echo "" > ./test_log');

  for (let i = 2; i < testData.length; i++) {
    if (testData[i].length !== 0 &&
    	// testData[i][xlsxHeaderPos.tcId] === 'TC0085' &&
      // testData[i][xlsxHeaderPos.command] === 'revoke' &&
      testData[i][xlsxHeaderPos.flag] !== skipKeyword) {
      let testdata = {};
      let exec_command;

      testdata.tcid = testData[i][xlsxHeaderPos.tcId];
      testdata.type = testData[i][xlsxHeaderPos.type];
      testdata.operType = testData[i][xlsxHeaderPos.operType];
      testdata.summary = testData[i][xlsxHeaderPos.summary];
      testdata.command = testData[i][xlsxHeaderPos.command];
      testdata.sourceChain = testData[i][xlsxHeaderPos.sourceChain];
      testdata.source_storeman = testData[i][xlsxHeaderPos.source_storeman];
      testdata.wan_storeman = testData[i][xlsxHeaderPos.wan_storeman];
      testdata.from_account = testData[i][xlsxHeaderPos.from_account];
      testdata.to_account = testData[i][xlsxHeaderPos.to_account];
      testdata.tokenAddr = testData[i][xlsxHeaderPos.tokenAddr];
      testdata.tokenSymbol = testData[i][xlsxHeaderPos.tokenSymbol];
      testdata.amount = testData[i][xlsxHeaderPos.amount];
      testdata.hashX = testData[i][xlsxHeaderPos.hashX];
      testdata.flag = testData[i][xlsxHeaderPos.flag];

      console.log(testdata);

      if (testdata.type === 'Sunny') {
        await sleep(12 * 1000);
      }

      try {
        exec_command = buildCommand(testdata);
        console.log(exec_command);
        await execProc(exec_command);
      } catch (err) {
        console.log(exec_command, err);
      }
    }
  }

  try {
    console.log("========================")
    await execProc('cat test_result | grep -e "successful" -e "failed" -e "txHash"');
    console.log("========================")

    console.log("========================")
    console.log("Successful case:");
    await execProc('cat test_result | grep -e ^.*Sunny.*successful.*$ -e ^.*Rainy.*failed.*$ | wc -l');

    console.log("Failed case:");
    await execProc('cat test_result | grep -e ^.*Sunny.*failed.*$ -e ^.*Rainy.*successful.*$ | wc -l');

    await execProc('cat test_result | grep -e ^.*Sunny.*failed.*$ -e ^.*Rainy.*successful.*$');

    console.log("CLI expect——test done");
    console.log("========================");
  } catch (err) {
    console.log(err);
  }
}

autoTest();
'use strict';

const assert = require('chai').assert;
const xlsx = require('node-xlsx');
const child_process = require('child_process');

const testnet = true;
const skipKeyword = 'skip';
// const password = process.env.KEYSTORE_PWD; //wanglu
const BtcPasswd = "1234567890";
const wanPasswd = "12345678";
const sendBtcAmount = 0.0002;
const sendBtcTo = "mtCotFuC1JP448Y3uhEbyPeP7UduYUn6Vb";
const lockBtcStroemanIndex = 1;
const lockBtcWanAddressIndex = 1;
const lockBtcAmount = 0.002;
const lockBtcWanAddressPasswd = 'astroastro';

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
  createBtcAddress: "expect_createBtcAddress.sh",
  createWanAddress: "expect_createWanAddress.sh",
  listBtcAddress: "expect_listBtcAddress.sh",
  getBtcBalance: "expect_getBtcBalance.sh",
  listWbtcBalance: "expect_listWbtcBalance.sh",
  listWanBalance: "expect_listWanBalance.sh",
  listStoremanGroups: "expect_listStoremanGroups.sh",
  listTransactions: "expect_listTransactions.sh",
  sendBtcToAddress: "expect_sendBtcToAddress.sh",
  lockBtc: 'expect_lockBtc.sh',

  approve: "expect_approve.sh",
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
    case 'createBtcAddress':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + BtcPasswd + ' ' + testdata.sourceChain;
        break;
      }
    case 'createWanAddress':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + wanPasswd + ' ' + testdata.sourceChain;
        break;
      }
      case 'listBtcAddress':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }
      case 'getBtcBalance':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }
      case 'listWbtcBalance':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }

      case 'listWanBalance':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }
      case 'listStoremanGroups':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }
      case 'listTransactions':
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + testdata.sourceChain;
        break;
      }
      case "sendBtcToAddress":
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + sendBtcAmount + ' ' + sendBtcTo + ' ' + BtcPasswd;
        break;
      }
      case "lockBtc":
      {
        command = command + ' ' + testLabel + ' ' + testnet + ' ' + lockBtcStroemanIndex + ' ' + lockBtcWanAddressIndex + ' ' + lockBtcAmount + ' ' + lockBtcWanAddressPasswd + ' ' + BtcPasswd;
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

      console.log('testdata: ', testdata);

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
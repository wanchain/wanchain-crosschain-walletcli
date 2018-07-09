'use strict'
const sprintf = require("sprintf-js").sprintf;
const Web3 = require('web3');
let databaseGroup = require('wanchain-crosschain/wanchaindb/index.js').databaseGroup;
const crosschain = require('wanchain-crosschain/dbDefine/crossTransDefine.js');
let backend = require('wanchain-crosschain/ccUtil.js').Backend;
const messageFactory = require('wanchain-crosschain/webSocket/messageFactory.js');
const socketServer = require("wanchain-crosschain/wanchainsender/index.js").socketServer;
let sendFromSocket = require("wanchain-crosschain/wanchainsender/index.js").SendFromSocket;
const mr = require('wanchain-crosschain/monitor.js').MonitorRecord;

const config = require('../../config.js');
let interval;

async function recordMonitor(config, ethSend, wanSend) {
  await mr.init(config, ethSend, wanSend);
  interval = setInterval(function() {
    mr.monitorTask();
  }, 6000);
}

function checkAddress(address) {
  return /^(0x)?[0-9a-fA-F]{40}$/i.test(address);
}

// const {
//   getLogger
// } = require('./logger.js');
const log = config.getLogger("Wallet_TC");

class testCore {
  constructor(config, callback = false) {
    this.socketUrl = config.socketUrl;
    global.getLogger = config.getLogger;
    this.wanSend = new sendFromSocket(null, 'WAN');
    this.ethSend = new sendFromSocket(null, 'ETH');
    this.databaseGroup = databaseGroup;
    this.databaseGroup.useDatabase(config.databasePath, [crosschain]);
    this.backend = backend;
    this.isClose = false;
    this.web3 = new Web3();
  }

  async init() {
    log.debug("testCore init");
    this.isClose = false;
    for  (var  key  in  this.databaseGroup.databaseAry)  {
      await this.databaseGroup.databaseAry[key].init();
    }
    let newWebSocket = new socketServer(config.socketUrl, messageFactory);
    this.wanSend.socket = newWebSocket;
    this.ethSend.socket = newWebSocket;
    let self = this;
    return new Promise(function(resolve, fail) {
      newWebSocket.connection.on('open', async function _cb() {
        recordMonitor(config, self.ethSend, self.wanSend);
        self.backend.init(config, self.ethSend, self.wanSend, function() {
          resolve();
        });
      })

      newWebSocket.connection.on('error', function() {
        log.error("error");
      });
    });
  }

  close() {
    this.isClose = true;
    clearInterval(interval);
    for  (var  key  in  databaseGroup.databaseAry)  {
      databaseGroup.databaseAry[key].db.close();
    }
    this.wanSend.socket.connection.close();
  }

  getSenderbyChain(chainType) {
    return chainType == "ETH" ? this.ethSend : this.wanSend;
  }

  async getRecord(option) {
    let backend = this.backend;

    return new Promise(function(resolve, reject) {
      try {
        let record = [];
        record = backend.getTxHistory(option);
        log.debug(record);

        if (record.length !== 0) {
          log.debug("getTxHistory in getRecord result is", record[0], "while option is", option);
          resolve(record[0]);
        } else {
          reject("Record was not found");
        }
      } catch (err) {
        log.error("Something is wrong", err);
        reject(err);
      }
    })
  }

  async sleepAndUpdateStatus(time, option) {
    let self = this;
    let temp_option = option;

    return new Promise(function(resolve, reject) {
      log.debug("sleepAndUpdateStatus with ", time / 1000, "seconds");
      if (self.isClose) {
        reject("TestCore closed");
      } else {
        setTimeout(async function() {
          let record = await self.getRecord(temp_option).catch(r => {
            reject(r)
          });
          resolve(record);
        }, time);
      }
    })
  };

  async getHashX(option) {
    let backend = this.backend;

    return new Promise(function(resolve, reject) {
      try {
        let record = backend.getTxHistory(option);
        if (record !== []) {
          log.debug("getTxHistory in getHashX result is", record[0], "while option is", option);
          resolve(record[0].HashX);
        } else {
          reject("HashX was not found");
        }
      } catch (err) {
        log.error("Something is wrong", err);
        reject(err);
      }
    })
  }

  async getEthAccountsInfo(address) {
    let backend = this.backend;
    let ethAddressList = [];
    let web3 = this.web3;
    let sender = this.ethSend;

    return new Promise(async function(resolve, reject) {
      try {
        ethAddressList = await backend.getEthAccountsInfo(sender);

        ethAddressList.forEach(function(ethAddress) {
          if (address === ethAddress.address) {
            log.debug(sprintf("%46s %26s", "ETH address", "balance"));
            log.debug(sprintf("%46s %26s", ethAddress.address, web3.fromWei(ethAddress.balance)));
            resolve(ethAddress);
          }
        });
        reject("getEthAccountsInfo error not found address");
      } catch (err) {
        reject((err.hasOwnProperty("message")) ? err.message : err);
      }
    });
  }

  async getWanAccountsInfo(address) {
    let backend = this.backend;
    let wanAddressList = [];
    let web3 = this.web3;
    let sender = this.wanSend;

    return new Promise(async function(resolve, reject) {
      try {
        wanAddressList = await backend.getWanAccountsInfo(sender);

        wanAddressList.forEach(function(wanAddress) {
          if (address.toLowerCase() === wanAddress.address) {
            log.debug(sprintf("%46s %26s %26s", "WAN address", "WAN balance", "WETH balance"));
            log.debug(sprintf("%46s %26s %26s", wanAddress.address, web3.fromWei(wanAddress.balance), web3.fromWei(wanAddress.wethBalance)));
            resolve(wanAddress);
          }
        });
        reject("getWanAccountsInfo error not found address");
      } catch (err) {
        reject((err.hasOwnProperty("message")) ? err.message : err);
      }
    });
  }

  async getEthC2wRatio() {
    let backend = this.backend;
    let sender = this.wanSend;

    return new Promise(async function(resolve, reject) {
      try {
        let c2wRatio = await backend.getEthC2wRatio(sender);
        resolve(c2wRatio);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getEthStoremanInfo(input) {
    let backend = this.backend;
    let sender = this.wanSend;

    return new Promise(async function(resolve, reject) {
      try {
        let smgList = await backend.getEthSmgList(sender);
        if (checkAddress(input)) {
          smgList.forEach(function(smg) {
            if (smg.wanAddress === input || smg.ethAddress === input) {
              resolve(smg);
            }
          })
        } else {
          resolve(smgList[input - 1]);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getTxInfo(chain, txhash) {
    let backend = this.backend;
    let sender = this.getSenderbyChain(chain);

    return new Promise(async function(resolve, reject) {
      try {
        let txInfo = await backend.getTxInfo(sender, txhash);
        resolve(txInfo);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getTxReceipt(chain, txhash) {
    let backend = this.backend;
    let sender = this.getSenderbyChain(chain);

    return new Promise(async function(resolve, reject) {
      try {
        let receipt = await backend.getTxReceipt(sender, txhash);
        resolve(receipt);
      } catch (err) {
        reject(err);
      }
    });
  }

  async caculateFee(storemanIndex, amount) {
    let storeman = await getEthStoremanInfo(storemanIndex);
    let c2wRatio = await getEthC2wRatio();

    return this.backend.calculateLocWanFee(amount, c2wRatio, storeman.txFeeRatio);
  }

  async checkOriginLockOnline(record) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender;
        let receipt;
        if (record.chain == "ETH") {
          sender = self.ethSend;
          receipt = await backend.getDepositOrigenLockEvent(sender, record.HashX);
        } else {
          sender = self.wanSend;
          receipt = await backend.getWithdrawOrigenLockEvent(sender, record.HashX);
        }
        log.debug("The receipt of checkOriginLockOnline is", receipt);
        if (receipt && receipt.length > 0) {
          log.debug("record.status is sentHashConfirming");
          resolve(receipt);
        }
      } catch (err) {
        log.error("checkOriginLockOnline:", err);
        reject(err);
      }
    })
  }

  async checkXOnline(record) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender;
        let receipt;
        if (record.chain == "ETH") {
          sender = self.wanSend;
          receipt = await backend.getDepositOriginRefundEvent(sender, record.HashX);
        } else {
          sender = self.ethSend;
          receipt = await backend.getWithdrawOriginRefundEvent(sender, record.HashX);
        }
        log.debug("The receipt of checkXOnline is", receipt);
        if (receipt && receipt.length > 0) {
          log.debug("record.status is sentXConfirming");
          resolve(receipt);
        }
      } catch (err) {
        log.error("checkTxOnline:", err);
        reject(err);
      }
    })
  }
  async checkRevokeOnline(chain, record) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender;
        let receipt;
        if (record.chain == "ETH") {
          sender = self.ethSend;
          receipt = await backend.getDepositRevokeEvent(sender, record.HashX);
        } else {
          sender = self.wanSend;
          receipt = await backend.getWithdrawRevokeEvent(sender, record.HashX);
        }
        log.debug("The receipt of checkRevokeOnline is", receipt);
        if (receipt && receipt.length > 0) {
          log.debug("record.status is sentRevokeConfirming");
          resolve(receipt);
        }
      } catch (err) {
        log.error("checkRevokeOnline:", err);
        reject(err);
      }
    })
  }
  async checkCrossHashOnline(record) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender;
        let receipt;
        if (record.chain == "ETH") {
          sender = self.wanSend;
          receipt = await backend.getDepositCrossLockEvent(sender, record.HashX);
        } else {
          sender = self.ethSend;
          receipt = await backend.getWithdrawCrossLockEvent(sender, record.HashX);
        }
        log.debug("The receipt of checkCrossHashOnline is", receipt);
        if (receipt && receipt.length > 0) {
          log.debug("record.status is waitingCrossConfirming");
          resolve(receipt);
        }
      } catch (err) {
        log.error("checkCrossHashOnline:", err);
        reject(err);
      }
    })
  }
  async checkHashConfirm(record, waitBlocks) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender = self.getSenderbyChain(record.chain);
        let receipt = await backend.monitorTxConfirm(sender, record.lockTxHash, waitBlocks);
        log.debug("The receipt of checkHashConfirm is", receipt);
        if (receipt) {
          record.lockConfirmed += 1;
          if (record.lockConfirmed >= config.confirmBlocks) {
            log.debug("record.status is waitingCross");
            resolve(receipt);
          }
        }
      } catch (err) {
        log.error("checkHashConfirm:", err);
        reject(err);
      }
    })
  }
  async checkXConfirm(record, waitBlocks) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let chain = record.chain == 'ETH' ? "WAN" : "ETH";
        let sender = self.getSenderbyChain(chain);
        let receipt = await backend.monitorTxConfirm(sender, record.refundTxHash, waitBlocks);
        log.debug("The receipt of checkXConfirm is", receipt);
        if (receipt) {
          record.refundConfirmed += 1;
          if (record.refundConfirmed >= config.confirmBlocks) {
            log.debug("record.status is refundFinished");
            resolve(receipt);
          }
        }
      } catch (err) {
        log.error("checkXConfirm:", err);
        reject(err);
      }
    })
  }
  async checkRevokeConfirm(chain, record, waitBlocks) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let sender = self.getSenderbyChain(chain);
        let receipt = await backend.monitorTxConfirm(sender, record.revokeTxHash, waitBlocks);
        log.debug("The receipt of checkRevokeConfirm is", receipt);
        if (receipt) {
          record.revokeConfirmed += 1;
          if (record.revokeConfirmed >= config.confirmBlocks) {
            log.debug("record.status is revokeFinished");
            resolve(receipt);
          }
        }
      } catch (err) {
        log.error("checkRevokeConfirm:", err);
        reject(err);
      }
    })
  }
  async checkCrossHashConfirm(record, waitBlocks) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let chain = record.chain == 'ETH' ? "WAN" : "ETH";
        let sender = self.getSenderbyChain(chain);
        let receipt = await backend.monitorTxConfirm(sender, record.crossLockHash, waitBlocks);
        log.debug("The receipt of checkCrossHashConfirm is", receipt);
        if (receipt) {
          if (!record.crossConfirmed) record.crossConfirmed = 0;
          record.crossConfirmed += 1;
          if (record.crossConfirmed >= config.confirmBlocks) {
            log.debug("record.status is waitingX");
            resolve(receipt);
          }
        }
      } catch (err) {
        log.error("checkCrossHashConfirm:", err);
        reject(err);
      }
    })
  }

  async checkHashTimeout(record) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      if (record.status == "waitingRevoke," ||
        record.status == "sentRevokePending" ||
        record.status == "sentRevokeConfirming") {
        return true;
      }
      try {
        let HTLCtime = Number(record.HTLCtime);
        if (HTLCtime <= Date.now()) {
          log.debug("record.status is waitingRevoke");
          resolve(record);
          return true;
        }
      } catch (err) {
        log.error("checkHashTimeout:", err);
        reject(err);
      }
      return false;
    })
  }

}

module.exports = global.testCore = testCore;
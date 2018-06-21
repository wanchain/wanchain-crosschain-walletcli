'use strict'

let databaseGroup = require('wanchaindb').databaseGroup;
const crosschain = require('wanchainwalletcore/dbDefine/crossTransDefine.js');
let backend = require('wanchainwalletcore/ccUtil.js').Backend;
const messageFactory = require('wanchainwalletcore/webSocket/messageFactory.js');
const socketServer = require("wanchainsender").socketServer;
let sendFromSocket = require("wanchainsender").SendFromSocket;
const mr = require('wanchainwalletcore/monitor.js').MonitorRecord;

const config = require('../../config.js');
let interval;

async function recordMonitor(config, ethSend, wanSend) {
  await mr.init(config, ethSend, wanSend);
  interval = setInterval(function() {
     mr.monitorTask();
  }, 6000);
}

const {
  getLogger
} = require('./logger.js');
const log = getLogger("Wallet_TC");

class testCore {
  constructor(config, callback = false) {
    this.socketUrl = config.socketUrl;
    this.wanSend = new sendFromSocket(null, 'WAN');
    this.ethSend = new sendFromSocket(null, 'ETH');
    this.databaseGroup = databaseGroup;
    this.databaseGroup.useDatabase(config.databasePath, [crosschain]);
    this.backend = backend;

  }

  async init() {
    log.info("testCore init");
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
    });
  }

  close() {
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
        let record = backend.getTxHistory(option);
        log.info(record);
        if (record !== []) {
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
      log.info("sleepAndUpdateStatus with ", time / 1000, "seconds");
      setTimeout(async function() {
        let record = await self.getRecord(temp_option);
        resolve(record);
      }, time);
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
          log.info("record.status is sentHashConfirming");
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
          log.info("record.status is sentXConfirming");
          resolve(receipt);
        }
      } catch (err) {
        console.log("checkTxOnline:", err);
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
          log.info("record.status is sentRevokeConfirming");
          resolve(receipt);
        }
      } catch (err) {
        console.log("checkRevokeOnline:", err);
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
          log.info("record.status is waitingCrossConfirming");
          resolve(receipt);
        }
      } catch (err) {
        console.log("checkCrossHashOnline:", err);
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
            log.info("record.status is waitingCross");
            resolve(receipt);
          }
        }
      } catch (err) {
        console.log("checkHashConfirm:", err);
        reject(err);
      }
    })
  }
  async checkXConfirm(record, waitBlocks) {
    let backend = this.backend;
    let self = this;

    return new Promise(async function(resolve, reject) {
      try {
        let chain = record.chain=='ETH'?"WAN":"ETH";
        let sender = self.getSenderbyChain(chain);
        let receipt = await backend.monitorTxConfirm(sender, record.refundTxHash, waitBlocks);
        log.debug("The receipt of checkXConfirm is", receipt);
        if (receipt) {
          record.refundConfirmed += 1;
          if (record.refundConfirmed >= config.confirmBlocks) {
            log.info("record.status is refundFinished");
            resolve(receipt);
          }
        }
      } catch (err) {
        console.log("checkXConfirm:", err);
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
            log.info("record.status is revokeFinished");
            resolve(receipt);
          }
        }
      } catch (err) {
        console.log("checkRevokeConfirm:", err);
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
            log.info("record.status is waitingX");
            resolve(receipt);
          }
        }
      } catch (err) {
        console.log("checkCrossHashConfirm:", err);
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
          log.info("record.status is waitingRevoke");
          resolve(record);
          return true;
        }
      } catch (err) {
        console.log("checkHashTimeout:", err);
        reject(err);
      }
      return false;
    })
  }

}

module.exports = global.testCore = testCore;
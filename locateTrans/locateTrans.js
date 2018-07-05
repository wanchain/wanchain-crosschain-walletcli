'use strict'

let config = require('../config.js');
let backend = require('wanchain-crosschain/ccUtil.js').Backend;
const socketServer = require("wanchain-crosschain/wanchainsender/index.js").socketServer;
let sendFromSocket = require("wanchain-crosschain/wanchainsender/index.js").SendFromSocket;
const messageFactory = require('wanchain-crosschain/webSocket/messageFactory.js');
let logger = config.logDebug.getLogger("LocateTrans");

function checkHash(hash) {
  let thash = hash.replace(/[\r\n]/g, "");
  return (/^(0x)?[0-9a-fA-F]{64}$/i.test(thash));
}

class locateCore {
  constructor(config, callback = false) {
    this.socketUrl = config.socketUrl;
    this.wanSend = new sendFromSocket(null, 'WAN');
    this.ethSend = new sendFromSocket(null, 'ETH');
    this.backend = backend;
    this.isClose = false;
  }

  async init() {
    logger.debug("locateCore init");
    this.isClose = false;
    let newWebSocket = new socketServer(config.socketUrl, messageFactory);
    this.wanSend.socket = newWebSocket;
    this.ethSend.socket = newWebSocket;
    let self = this;
    return new Promise(function(resolve, fail) {
      newWebSocket.connection.on('open', async function _cb() {
        self.backend.init(config, self.ethSend, self.wanSend, function() {
          resolve();
        });
      })

      newWebSocket.connection.on('error', function() {
        logger.error("error");
      });
    });
  }

  close() {
    this.isClose = true;
    this.wanSend.socket.connection.close();
  }

  async getTxReceipt(sender, txhash) {
    let backend = this.backend;

    return new Promise(async function(resolve, reject) {
      try {
        let receipt = await backend.getTxReceipt(sender, txhash);
        resolve(receipt);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getLockTxReceipt(transDir, txhash) {
    try {
      let receipt;
      let sender;

      if (transDir === '1') {
        sender = this.ethSend;
      } else if (transDir === '2') {
        sender = this.wanSend;
      }
      receipt = await backend.getTxReceipt(sender, txhash);
      return receipt;
    } catch (err) {
      logger.error("getLockTxReceipt:", err);
    }
  }

  async getRefundTxReceipt(transDir, txhash) {
    try {
      let sender;
      let receipt;

      if (transDir === '1') {
        sender = this.wanSend;
      } else if (transDir === '2') {
        sender = this.ethSend;
      }
      receipt = await backend.getTxReceipt(sender, txhash);
      return receipt;
    } catch (err) {
      logger.error("getRefundTxReceipt:", err);
    }
  }

  async getRevokeTxReceipt(transDir, txhash) {
    try {
      let sender;
      let receipt;

      if (transDir === '1') {
        sender = this.ethSend;
      } else if (transDir === '2') {
        sender = this.wanSend;
      }
      receipt = await backend.getTxReceipt(sender, txhash);
      return receipt;
    } catch (err) {
      logger.error("getRevokeTxReceipt:", err);
    }
  }

  async checkOriginLockOnline(transDir, hashX) {
    try {
      let sender;
      let receipt;

      if (transDir === '1') {
        sender = this.ethSend;
        receipt = await this.backend.getDepositOrigenLockEvent(sender, hashX);
      } else if (transDir === '2') {
        sender = this.wanSend;
        receipt = await this.backend.getWithdrawOrigenLockEvent(sender, hashX);
      }
      return receipt;
    } catch (err) {
      logger.error("checkOriginLockOnline:", err);
    }
  }

  async checkCrossHashOnline(transDir, hashX) {
    try {
      let receipt;
      let sender;

      if (transDir === '1') {
        sender = this.wanSend;
        receipt = await this.backend.getDepositCrossLockEvent(sender, hashX);

      } else if (transDir === '2') {
        sender = this.ethSend;
        receipt = await this.backend.getWithdrawCrossLockEvent(sender, hashX);
      }
      return receipt;
    } catch (err) {
      logger.error("checkCrossHashOnline:", err);
    }
  }

  async checkXOnline(transDir, hashX) {
    try {
      let sender;
      let receipt;

      if (transDir === '1') {
        sender = this.wanSend;
        receipt = await this.backend.getDepositOriginRefundEvent(sender, hashX);
      } else if (transDir === '2') {
        sender = this.ethSend;
        receipt = await this.backend.getWithdrawOriginRefundEvent(sender, hashX);
      }
      return receipt;
    } catch (err) {
      logger.error("checkTxOnline:", err);
    }
  }

  async checkRevokeOnline(transDir, hashX) {
    try {
      let sender;
      let receipt;

      if (transDir === '1') {
        sender = this.ethSend;
        receipt = await this.backend.getDepositRevokeEvent(sender, hashX);
      } else if (transDir === '2') {
        sender = this.wanSend;
        receipt = await this.backend.getWithdrawRevokeEvent(sender, hashX);
      }
      return receipt;
    } catch (err) {
      logger.error("checkRevokeOnline:", err);
    }
  }
}

async function main() {

  if (process.argv.length < 4) {
    logger.info("locateTrans help:");
    logger.info(" --- locateTrans transDir lockTxHash refundTxHash revokeTxHash");
    logger.info(" --- transDir: plz input the number. 1: ETH-WETH, 2: WETH-ETH");
    logger.info(" --- lockTxHash: must been input");
    logger.info(" --- refundTxHash: default null or plz input if you have");
    logger.info(" --- revokeTxHash: default null or plz input if you have");
    process.exit();
  }

  logger.debug("Ctrl C to exit.");
  let locateTransCore = new locateCore(config);
  await locateTransCore.init();

  let transDir;
  let lockTxHash;
  let refundTxHash = null;
  let revokeTxHash = null;
  let hashX;

  try {
    logger.error(process.argv);
    if (process.argv.length >= 3) {
      transDir = process.argv[2];
      if (transDir === '1') {
        logger.info("locateTrans transDir ETH-WETH");
      } else if (transDir === '2') {
        logger.info("locateTrans transDir WETH-ETH");
      } else {
        logger.error("input transDir error, 1: ETH-WETH, 2: WETH-ETH");
        process.exit();
      }
    }

    if (process.argv.length >= 4) {
      lockTxHash = process.argv[3];
      logger.info("input lockTxHash:", lockTxHash)
      if (lockTxHash !== null && checkHash(lockTxHash)) {
        // lockTxHash = "0x642bcb3bac424ed2dbc41d1405c729941b0574c5d694129a2d556cb19fb2b4b3"; //revoke hash
        // lockTxHash = "0x58302403286a9fdc1873751362d86e4469efeec8bdaedf5623b5c2167fe1d05c"; //eth-weth
        // lockTxHash = "0x455a55abed31d555910a7c408bff7a05b2aafb0fd400ff8f23ea1be6a4a8eb6f";
      } else {
        logger.error("lockTxHash must been input");
        process.exit();
      }
    }

    if (process.argv.length >= 5) {
      refundTxHash = process.argv[4];
      if (refundTxHash !== null && checkHash(refundTxHash)) {} else {
        refundTxHash = null
      }
    }
    if (process.argv.length >= 6) {
      revokeTxHash = process.argv[5];
      if (revokeTxHash !== null && checkHash(revokeTxHash)) {} else {
        revokeTxHash = null
      }
    }

    let receipt = await locateTransCore.getLockTxReceipt(transDir, lockTxHash);
    logger.debug("The receipt of the lockTrans is", receipt);

    if (receipt && receipt.status === "0x1" && receipt.logs.length > 0) {
      transDir = process.argv[2];
      if (transDir === '1') {
        hashX = receipt.logs[0].topics[3];
      } else if (transDir === '2' && receipt.logs.length > 1) {
        hashX = receipt.logs[1].topics[3];
      } else {
        logger.error("HashX is not obtained, plz besure you input the right lockTxHash");
        process.exit();
      }

      if (hashX === undefined) {
        logger.error("HashX is not obtained, plz besure you input the right lockTxHash");
        process.exit();
      }
      logger.info("LockTrans is successful");
      logger.info("HashX is", hashX);

      let crossevent1 = await locateTransCore.checkCrossHashOnline(transDir, hashX);
      if (crossevent1 && crossevent1.length > 0) {
        logger.debug("The CrossTrans event log is", crossevent1);

        let crossLockHash = crossevent1[0].transactionHash;
        logger.debug("The CrossTrans transHash is", crossLockHash);

        let refundEvent = await locateTransCore.checkXOnline(transDir, hashX);
        let revokeEvent = await locateTransCore.checkRevokeOnline(transDir, hashX);

        if (refundEvent && refundEvent.length > 0) {
          logger.debug("The CrossTrans refund receipt is", refundEvent);
          logger.info("RefundTrans is successful");
          logger.info("The CrossTrans refund hash is", refundEvent[0].transactionHash);

          if (refundTxHash !== null && refundTxHash !== refundEvent[0].transactionHash) {
            logger.error("Input refundTxHash:", refundTxHash, " not equal to exact refundTxHash", refundEvent[0].transactionHash);
          }
        } else if (revokeEvent && revokeEvent.length > 0) {
          logger.debug("The CrossTrans revoke receipt is", revokeEvent);
          logger.info("RevokeTrans is successful");
          logger.info("The CrossTrans revoke hash is", revokeEvent[0].transactionHash);

          if (revokeTxHash !== null && revokeTxHash !== revokeEvent[0].transactionHash) {
            logger.error("Input revokeTxHash:", revokeTxHash, " not equal to exact revokeTxHash", revokeEvent[0].transactionHash);
          }
        } else if (refundTxHash !== null) {
          let refundReceipt = await locateTransCore.getRefundTxReceipt(transDir, refundTxHash);
          logger.debug("The receipt of the refundTrans is", receipt);
          if (refundReceipt && refundReceipt.status === "0x1" && refundReceipt.logs.length > 0) {
            let refundHashX = refundReceipt.logs[0].topics[3];
            if (refundHashX !== hashX) {
              logger.error("RefundTrans not happened");
              logger.error("Input refundTxhash:", refundTxHash, ", it's hashX", refundHashX, "not equal to exact input lockTxHash include hashX", hashX);
            }
          } else {
            logger.error("RefundTrans failed");
          }
        } else if (revokeTxHash !== null) {
          let revokeReceipt = await locateTransCore.getRevokeTxReceipt(transDir, revokeTxHash);
          logger.debug("The receipt of the revokeTrans is", receipt);
          if (revokeReceipt && revokeReceipt.status === "0x1" && revokeReceipt.logs.length > 0) {
            let revokeHashX = revokeReceipt.logs[0].topics[2];
            if (revokeHashX !== hashX) {
              logger.error("RevokeTrans not happened");
              logger.error("Input revokeTxHash:", revokeTxHash, ", it's hashX", revokeHashX, "not equal to exact input lockTxHash include hashX", hashX);
            }
          } else {
            logger.error("RevokeTrans failed");
          }
        } else {
          logger.error("both refund and revoke not happened");
        }
      } else {
        logger.error("Storeman LockTrans failed");
        logger.error("something is wrong during storeman lockTx trans");
      }
    } else {
      logger.error("LockTrans failed");
      logger.error("something is wrong during lockTx trans");
    }
  } catch (err) {
    logger.error(err);
  }

  await locateTransCore.close();
  process.exit();

}

main();
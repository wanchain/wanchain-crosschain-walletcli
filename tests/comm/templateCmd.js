const spawn = require('child_process').spawn;
const Description = require('../../schema/DescAndMsg.js').Description;
const {
  getLogger
} = require('./logger.js');
const log = getLogger("Wallet_TC_CMD");

function getCmdFile(cmdName) {
  let cmdScript = null;
  switch (cmdName) {
    case "LockETH":
      cmdScript = "LockETHTrans.js";
      break;
    case "LockWAN":
      cmdScript = "LockWANTrans.js";
      break;
    case "RefundETH":
      cmdScript = "RefundETHTrans.js";
      break;
    case "RefundWAN":
      cmdScript = "RefundWANTrans.js";
      break;
    case "RevokeETH":
      cmdScript = "RevokeETHTrans.js";
      break;
    case "RevokeWAN":
      cmdScript = "RevokeWANTrans.js";
      break;
    default:
      log.error("Command input error!");
  }
  return cmdScript;
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

class templateDetailCommand {
  constructor(commandName) {
    this.options = {
      cwd: '../../command/'
    };
    this.cmdName = commandName;
    this.proc = null;
    log.info("TemplateDetailCommand constructor");
  }

  createProc() {
    let options = this.options;
    let cmdFile = getCmdFile(this.cmdName);
    this.proc = spawn('node', [options.cwd + cmdFile]);

    log.info('run', cmdFile);

    this.proc.stdout.on('data', (data) => {
      if (data.indexOf('Process is exited!') === -1) {
        log.info(`${data}`);
      }
    });
    // this.proc.stderr.on('data', (data) => {
    //   log.error('StdError:', `${data}`);
    //   this.proc.stdin.write('q\n');
    // });
    this.proc.on('close', (code) => {
      log.info(`Chile process quit code：${code}`);
    });
  };

  handleStdout(callback) {
    let options = this.options;
    let proc = this.proc;
    let input = null;
    proc.stdout.on('data', (data) => {
      if (data.indexOf("q to exit") != -1) {
        if (data.indexOf(Description.password) != -1) {
          input = options.password;
        } else if (data.indexOf(Description.repeatPassword) !== -1) {
          input = options.password;
        } else if (data.indexOf(Description.localWANAddress) !== -1) {
          input = options.from;
        } else if (data.indexOf(Description.localETHAddress) !== -1) {
          input = options.from;
        } else if (data.indexOf(Description.getStoremanGroup) !== -1) {
          input = options.storemanGroup;
        } else if (data.indexOf(Description.lockTxHash) !== -1) {
          input = options.lockTxHash;
        } else if (data.indexOf(Description.toAddress) !== -1) {
          input = options.cross;
        } else if (data.indexOf(Description.amount) !== -1) {
          input = options.amount;
        } else if (data.indexOf(Description.inputFee) !== -1) {
          input = options.fee;
        } else if (data.indexOf(Description.gasLimit) !== -1) {
          input = options.gas;
        } else if (data.indexOf(Description.gasPrice) !== -1) {
          input = options.gasPrice;
        } else if (data.indexOf(Description.submitSend) !== -1) {
          input = options.submit;
        } else if (data.indexOf(Description.tokenBalance) !== -1) {
          input = options.tokenBalance;
        }
        log.info(`stdin: >> `, input);
        proc.stdin.write(input + '\n');
      }
      if (data.indexOf("0x") != -1 && checkHash(`${data}`.toString())) {
        callback(`${data}`);
      }
    });
  }

  handleStderr(callback) {
    let proc = this.proc;

    proc.stderr.on('data', (data) => {
      log.error('StdError:', `${data}`);
      if (data.indexOf("IPC Connection Error") === -1) {
        callback(`${data}`);
        this.proc.stdin.write('q\n');
      }
    });
  }

  runProc(options) {
    let self = this;
    let result = null;
    return new Promise(function(resolve, reject) {
      try {
        self.options = Object.assign(self.options, options);
        self.createProc();
        self.handleStdout((out) => {
          log.info("result been caught", out);
          result = out;
        });
        self.handleStderr(reject);
        self.proc.on('close', (code) => {
          resolve(result);
        });
      } catch (err) {
        log.error("Something is wrong", err);
        reject(err);
      }
    })
  }
};

class templateScriptCommand {
  constructor(commandName) {
    this.options = {
      cwd: '../newCommandWallet/command/'
    };
    this.cmdName = commandName;
    this.proc = null;
    log.info("templateScriptCommand constructor");
  }

  createProc(callback) {
    let options = this.options;
    let cmdFile = getCmdFile(this.cmdName);

    this.proc = spawn('node', [
      options.cwd + cmdFile,
      '--from', options.from,
      '--storemanGroup', options.storemanGroup,
      '--cross', options.cross,
      '--amount', options.amount,
      '--gasPrice', options.gasPrice,
      '--gas', options.gas,
      '--password', options.password,
      '--lockTxHash', options.lockTxHash,
      '--Fee', options.fee,
      '--submit', options.submit
    ]);
    log.info('run', cmdFile);

    this.proc.stdout.on('data', (data) => {
      if (data.indexOf('Process is exited!') === -1) {
        log.info(`${data}`);
      }
      if (data.indexOf("0x") != -1 && checkHash(`${data}`.toString())) {
        callback(`${data}`);
      }
    });
    this.proc.on('close', (code) => {
      log.info(`Chile process quit code：${code}`);
    });
  };

  handleStderr(callback) {
    let proc = this.proc;

    proc.stderr.on('data', (data) => {
      log.error('StdError:', `${data}`);
      if (data.indexOf("IPC Connection Error") === -1) {
        callback(`${data}`);
        this.proc.stdin.write('q\n');
      }
    });
  }

  runProc(options) {
    let self = this;
    let result = null;
    return new Promise(function(resolve, reject) {
      try {
        self.options = Object.assign(self.options, options);
        self.createProc((out) => {
          log.info("result been caught", out);
          result = out;
        });
        self.handleStderr(reject);
        self.proc.on('close', (code) => {
          resolve(result);
        });

      } catch (err) {
        log.error("Something is wrong", err);
        reject(err);
      }
    })
  }
};

exports.templateCommand = templateDetailCommand;
// exports.templateCommand = templateScriptCommand;
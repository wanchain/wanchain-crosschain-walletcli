const log4js = require("log4js");
/**
 * logger support 4 level
 * @info
 * @debug 
 * @warn 
 * @error 
 */

const log4js_config = {
  "appenders": {
    "console": {
      "type": "console",
      "layout": {
        "type": "pattern",
        "pattern": "%[%d{yyyy-MM-dd hh:mm:ss,SSS} %5p %c%] %m"
      },
    },
    "trace": {
      "type": "file",
      "filename": "tests/log/testcase.log",
      "maxLogSize": 50000000,
      "backups": 10,
      "compress": true,
      "layout": {
        "type": "pattern",
        "pattern": "%d{yyyy-MM-dd hh:mm:ss,SSS} %5p %c - %m"
      },
    }
  },
  "categories": {
    "default": {
      "appenders": [
        "console",
        "trace"
      ],
      "level": "all"
    },
    "Wallet_TC": {
      "appenders": [
        "console",
        "trace"
      ],
      "replaceConsole": true,
      "level": "all"
    }
  }
};

log4js.configure(log4js_config);
exports.getLogger = function(name) {
  return log4js.getLogger(name || '')
};
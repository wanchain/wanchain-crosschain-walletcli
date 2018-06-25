let OptionalSchemaProperty = require('./OptionalSchemaProperty.js');
let pattern = require('./pattern.js');
let wanUtil = require('wanchain-util');
var util = require('ethereumjs-util');
module.exports = class keystoreAccountSchema extends OptionalSchemaProperty
{
    constructor(name,message,description,keyStoreDir,chainType){
        super(name,message,description,pattern.addressPattern,Object.keys(keyStoreDir.Accounts));
        this.beginCell.children[0].reset = function () {};
        if(chainType == "WAN"){
            this.checkInputValue = this.conformWan
        }else{
            this.checkInputValue = this.conformEth
        }
    }
    conformWan(value){
        pattern.ExitConform(value);
        if(pattern.patternCheck(value,pattern.lowerCasePattern))
            return true;
        if(pattern.patternCheck(value,pattern.upperCasePattern))
            return true;
        return wanUtil.toChecksumAddress(value) == value;
    }
    conformEth(value){
        pattern.ExitConform(value);
        if(pattern.patternCheck(value,pattern.lowerCasePattern))
            return true;
        if(pattern.patternCheck(value,pattern.upperCasePattern))
            return true;
        return util.isValidChecksumAddress(value)
    }
}

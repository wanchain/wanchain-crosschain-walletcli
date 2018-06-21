let SchemaProperty = require('./SchemaProperty.js');
let pattern = require('./pattern.js');
let wanUtil = require('wanchain-util');
var util = require('ethereumjs-util');
exports.InputSchemaProperty = class InputSchemaProperty extends SchemaProperty{
    constructor(name,description,message){
        super(name,description,message);
    }
}
exports.passwordProperty = class passwordProperty extends SchemaProperty{
    constructor(name,description,message,minLen){
        super(name,description,message,pattern.passwordPattern);
        this.hidden = true;
        this.replace = '*';
        this.minLen = minLen;
    }
    checkValue(value){
        var aaa = new String(value);
        if(aaa.length>=this.minLen)
            return value;
        return null;
    }
}
exports.addressProperty = class addressProperty extends SchemaProperty{
    constructor(name,description,message,chainType){
        super(name,description,message,pattern.addressPattern);
        if (chainType == "WAN") {
            this.conform = this.conformWan
        }else{
            this.conform = this.conformEth
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

exports.hashProperty = class hashProperty extends SchemaProperty{
    constructor(name,description,message){
        super(name,description,message,pattern.hashPattern);
    }
}
exports.waddressProperty = class waddressProperty extends SchemaProperty{
    constructor(name,description,message){
        super(name,description,message,pattern.waddressPattern);
    }
}
exports.YesNoProperty = class YesNoProperty extends SchemaProperty{
    constructor(name,description,message){
        super(name,description,message,pattern.YesNoPattern);
    }
}
exports.FloatProperty = class FloatProperty extends SchemaProperty{
    constructor(name,description,message,minValue,maxValue){
        super(name,description,message,pattern.floatPattern);
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
    checkValue(value){
        if(this.minValue && value<this.minValue)
            return null;
        if(this.maxValue && value>this.maxValue)
            return null;
        return value;
    }
}
exports.UintProperty = class UintProperty extends SchemaProperty{
    constructor(name,description,message,minValue,maxValue){
        super(name,description,message,pattern.UintPattern);
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
    checkValue(value){
        if(this.minValue && value<this.minValue)
            return null;
        if(this.maxValue && value>this.maxValue)
            return null;
        return value;
    }
}
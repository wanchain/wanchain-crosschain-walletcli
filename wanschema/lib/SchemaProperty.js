'use strict'

var colors = require("colors/safe");
function Qmsg(desc) {
    return colors.magenta(desc+'[Q\\q to exit]:');
};
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
let pattern = require('./pattern.js');
module.exports = class SchemaProperty
{
    constructor(name,description,message,pattern) {
        this.name = name;
        this.description = Qmsg(description);
        this.message = message;
        this.pattern = pattern;
        this.required = true;
    }
    conform(value){
        return pattern.ExitConform(value);
    }
    getSkippedCell(checkValue){
        return new FunctionCell(true,function(self,obj){
            if(checkValue(self.getRoot().param.line)){
                for(var i = 0;i < obj.SkippedPrompt.length; ++ i){
                    obj.SkippedPrompt[i].skipped = true;
                }
            }
            self.stepNext();
        },this);
    }
}

const prompt = require('prompt');
let IntervalRoot = require('../stepcell/index.js').IntervalRoot;
let FunctionCell = require('../stepcell/index.js').FunctionCell;
let CellGroup = require('../stepcell/index.js').CellGroup;
let mapCell = require('../stepcell/index.js').MapCell;

//let walletCore = require('wanchainwalletcore');
const colors = require("colors/safe");
var optimist = require('optimist')
    .string(['password', 'repeatPass','from', 'to' ,'waddress','OTAaddress', 'tokenAddress','transHash','contractAddress',
        'OTAAddress','stampOTA','cross','lockTxHash','account']);
prompt.on('stepNext',(obj) => {
    obj.callFunc();
});
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");
prompt.override = optimist.argv;
prompt.BeginCell = new CellGroup();
prompt.EndCell = new CellGroup();
let promptGet = prompt.get;

function initDatabaseCell(promptCell){
        return new mapCell(false,function (self,cell) {
            cell[1].init().then(function () {
                self.stepNext();
            })
        },global.walletCore.databaseGroup.databaseAry,promptCell);
}
function closeDatabaseCell(promptCell){
        return new mapCell(false,function (self,cell) {
            cell[1].close().then(function () {
                self.stepNext();
            })
        },global.walletCore.databaseGroup.databaseAry,promptCell);
}

prompt.get = function (schema, callback) {
    let promptCell = new IntervalRoot();
    if(global.walletCore.databaseGroup.size()){
        promptCell.addChild(initDatabaseCell());
    }
    if(this.BeginCell.size())
    {
        promptCell.addChild(this.BeginCell);
    }

    let getFuncCell = new FunctionCell(false,function(self,param){
        promptGet(param[0],function (err, result) {
            param[1](err,result,self);
            //self.stepNext();
        });
    },[schema,callback]);
    promptCell.addChild(getFuncCell);
    if(this.EndCell.size())
    {
        promptCell.addChild(this.EndCell);
    }
    if(global.walletCore.databaseGroup.size()){
        promptCell.addChild(closeDatabaseCell());
    }
    promptCell.addChild(new FunctionCell(true,function() {
        process.exit();
    }));
    promptCell.callFunc();
}
let inputFunc = prompt.getInput;
prompt.getInput = function(prop, callback){
    var schema = prop.schema || prop;
    if(schema.skipped){
        callback(null,'');
        return;
    }
    let inputCell = new IntervalRoot();
    if(schema.beginCell)
    {
        schema.beginCell.reset();
        inputCell.addChild(schema.beginCell);
    }
    let inputFuncCell = new FunctionCell(false,function(self,param){
        inputFunc(prop,function (err, line) {
            param.error = err;
            param.line = line;
            if(!err)
            {
                if(schema.checkValue){
                    param.line = schema.checkValue(line);
                    if(param.line == null) {
                        console.log(schema.message);
                        let propName = prop.path && prop.path.join(':') || prop;
                        delete prompt.override[propName];
                        return prompt.getInput(prop, callback);
                    }
                }
                self.stepNext();
            }
            else
            {
                self.stepNext();
            }
        });
    },inputCell.param);
    inputCell.addChild(inputFuncCell);
    if(!inputCell.param.error && schema.endCell)
    {
        inputCell.addChild(schema.endCell);
    }
    let callCell = new FunctionCell(true,function(self,param){
        setTimeout(function(){
            callback(param.error,param.line);
        },0);
//        callback(param.error,param.line);
    },inputCell.param);
    inputCell.addChild(callCell);

    inputCell.callFunc();

}
let processExit = false;
process.on('exit', function () {
    //handle your on exit code
    if(!processExit)
    {
        if(prompt.EndCell.size())
        {
            let promptCell = new IntervalRoot();
            promptCell.addChild(prompt.EndCell);
            promptCell.callFunc();
        }
        console.log('Process is exited!');

        processExit = true;
    }
});
module.exports = prompt;

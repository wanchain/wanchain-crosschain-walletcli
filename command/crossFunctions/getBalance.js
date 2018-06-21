let prompt = require('../../Prompt/newPrompt.js');
let SchemaFactory = require('../../schema/SchemaFactory.js');
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
let DebugLog = require('../../logger/DebugLog.js');
let getBalanceSend = function (sendTransaction) {

    let sendSchema = [
        SchemaFactory.account()
    ]
    prompt.get(sendSchema, function (err, result,self) {
        if(!err)
        {
            DebugLog.debug(result);
            let index = self.parent.index;
            let account = result.account;

            self.parent.insertChild(index,new FunctionCell(false,function(self){
                sendTransaction.sendServer.sendMessage('getBalance', account, function (err,result) {

                    if(!err){
                        console.log("getBalance:",result);
                    }
                    self.stepNext();
                });

            }));

            self.stepNext();

        }
    });


}

module.exports = getBalanceSend;


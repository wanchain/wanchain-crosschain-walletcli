let prompt = require('../../Prompt/newPrompt.js');
let SchemaFactory = require('../../schema/SchemaFactory.js');
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
let DebugLog = require('../../logger/DebugLog.js');
let lockHashXSend = function (sendTransaction) {
    let crossType = (sendTransaction.sendServer.chainType == 'ETH') ? 'ETH2WETH' : 'WETH2ETH';
    let crossAccount = (sendTransaction.sendServer.chainType == 'ETH') ? 'WAN' : 'ETH';
    let FeeGroup = SchemaFactory.FeeGroup();
    let submitSendGroup = SchemaFactory.submitSendGroup();
    let sendSchema = [
        SchemaFactory.fromKeystoreAccount(sendTransaction.sendServer.chainType),
        SchemaFactory.getStoremanGroup(sendTransaction.sendServer),
        SchemaFactory.crossAccount(crossAccount),
        SchemaFactory.Amount(),
        //FeeGroup[0],
        FeeGroup[1],
        FeeGroup[2],
        //submitSendGroup[0],
        submitSendGroup[1]
    ]
    prompt.get(sendSchema, function (err, result,self) {
        if(!err)
        {
            DebugLog.debug(result);
            let index = self.parent.index;
            let transResult = result;
            self.parent.insertChild(index,new FunctionCell(false,function(self){
                sendTransaction.sendServer.sendMessage('getCrossEthScAddress',function (err,result) {
                        if(!err){
                            transResult.tokenAddress = result;
                        }
                        self.stepNext();
                    });

            }));
            index++;
            self.parent.insertChild(index,new FunctionCell(false,function(self){
                sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroup,
                    transResult.cross,transResult.gas,transResult.gasPrice,crossType);
                sendTransaction.sendLockTrans(transResult.password,function (err,result) {
                    if(!err){
                        console.log(result);
                    }
                    else {
                        console.error(err);
                    }
                    self.stepNext();
                });
            }));
            //waiting for event
            self.stepNext();

        }
    });

}

module.exports = lockHashXSend;
/*
let sendTrans = require('../crossSend/sendTransaction.js');
let sendGroup = require('../crossSend/sendGroup/sendGroup.js').wanSend;
let newTrans = new sendTrans(sendGroup);
lockHashXSend(newTrans,wanHashXSend);
*/

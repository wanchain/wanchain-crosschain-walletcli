let prompt = require('../../Prompt/newPrompt.js');
let SchemaFactory = require('../../schema/SchemaFactory.js');
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
let DebugLog = require('../../logger/DebugLog.js');
const be =  require('wanchain-crosschain/ccUtil.js').Backend;
let   config = require('../../config');
async function sendTransAndSetValue(self,sendTransaction,transResult){
    let coin2WanRatio;
    let fee;
    let txFeeRatio;
    try{
        //coin2WanRatio = await be.getEthW2cRatio(sendTransaction.sendServer);
        coin2WanRatio   = await be.getEthC2wRatio(sendTransaction.sendServer);
    }catch(err){
        DebugLog.error("Error in sendTransAndSetValue:",err);
        process.exit();
    }
    txFeeRatio    = transResult.storemanGroup[0].txFeeRatio;
    fee = be.calculateLocWanFee(transResult.amount,coin2WanRatio,txFeeRatio);
    DebugLog.debug("amount:coin2WanRatio:txFeeRatio:Fee",transResult.amount,coin2WanRatio,txFeeRatio,fee);
    sendTransaction.trans.setValue(fee);
    sendTransaction.sendLockTrans(transResult.password,function (err,result) {
        if(!err){
            console.log(result);
        }
        else {
            console.error(err);
        }
        self.stepNext();
    });
};
let lockHashXSend = function (sendTransaction) {
    let crossType = (sendTransaction.sendServer.chainType === 'ETH') ? 'ETH2WETH' : 'WETH2ETH';
    let crossAccount = (sendTransaction.sendServer.chainType === 'ETH') ? 'WAN' : 'ETH';
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

            if (crossType === 'ETH2WETH') {
                transResult.tokenAddress = config.originalChainHtlc;
            } else if (crossType === 'WETH2ETH') {
                transResult.tokenAddress = config.wanchainHtlcAddr;
            }
            if(crossType === 'WETH2ETH'){
                transResult.storemanGroupAdd = transResult.storemanGroup[0].wanAddress;
            }else{
                transResult.storemanGroupAdd = transResult.storemanGroup[0].ethAddress;
            }
            self.parent.insertChild(index,new FunctionCell(false,function(self){

                sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroupAdd,
                    transResult.cross,transResult.gas,transResult.gasPrice,crossType);

                if (crossType === 'WETH2ETH') {
                    sendTransAndSetValue(self,sendTransaction,transResult);
                } else {
                    sendTransaction.sendLockTrans(transResult.password,function (err,result) {
                        if(!err){
                            console.log(result);
                        }
                        else {
                            console.error(err);
                        }
                        self.stepNext();
                    });
                }
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

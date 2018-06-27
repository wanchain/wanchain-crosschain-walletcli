let prompt = require('../../Prompt/newPrompt.js');
let SchemaFactory = require('../../schema/SchemaFactory.js');
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
let DebugLog = require('../../logger/DebugLog.js');
let config = require('../../config');

const BigNumber = require('bignumber.js');
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
            let index = self.parent.index;
            let transResult = result;

            if (crossType === 'ETH2WETH') {
                transResult.tokenAddress = config.originalChainHtlc;
            } else if (crossType === 'WETH2ETH') {
                transResult.tokenAddress = config.wanchainHtlcAddr;
            }
            DebugLog.debug(transResult);



            self.parent.insertChild(index,new FunctionCell(false,function(self){
                sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroup,
                    transResult.cross,transResult.gas,transResult.gasPrice,crossType);
                if (crossType === 'WETH2ETH') {
                    function caculateLocWanFee(value, coin2WanRatio, txFreeRatio) {
                        let exp = new BigNumber(10);
                        let v = new BigNumber(value);
                        let wei = v.mul(exp.pow(18));

                        const DEFAULT_PRECISE = 1000;
                        let fee = wei * coin2WanRatio * txFreeRatio / DEFAULT_PRECISE / DEFAULT_PRECISE;
                        return fee;
                    }
                    let fee = caculateLocWanFee(transResult.amount, 20, 1);
                    sendTransaction.trans.setValue(fee);

                }
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

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

    let protocol    = sendTransaction.protocol;
    let opt         = sendTransaction.opt;

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

  let sendSchemaApprove = [
    SchemaFactory.fromKeystoreAccount(sendTransaction.sendServer.chainType),
    SchemaFactory.Amount(),
    //FeeGroup[0],
    FeeGroup[1],
    FeeGroup[2],
    //submitSendGroup[0],
    submitSendGroup[1]
  ]

  let sendSchemaHardCodeStoreman = [
    SchemaFactory.fromKeystoreAccount(sendTransaction.sendServer.chainType),
    SchemaFactory.crossAccount(crossAccount),
    SchemaFactory.Amount(),
    //FeeGroup[0],
    FeeGroup[1],
    FeeGroup[2],
    //submitSendGroup[0],
    submitSendGroup[1]
  ]
  console.log("OPT:",opt,"protocol:",protocol);
  if (opt === 'APPROVE'){
        console.log("use new schema for Approve");
       sendSchema =  sendSchemaApprove;
  }
  if(protocol = 'E20'){
    console.log("use new schema for storeman hard code");
    sendSchema = sendSchemaHardCodeStoreman;
  }
    prompt.get(sendSchema, function (err, result,self) {
      console.log("prompt.get OPT:",opt,"protocol:",protocol);
        if(!err)
        {
            DebugLog.debug(result);
            let index = self.parent.index;
            let transResult = result;

            if (crossType === 'ETH2WETH') {
                //transResult.tokenAddress = config.originalChainHtlc;
                if (protocol === 'E20' && opt === 'APPROVE'){
                  transResult.tokenAddress = config.orgChainAddrE20;
                }else{
                        if(protocol === 'E20'){
                          transResult.tokenAddress = config.originalChainHtlcE20;
                        }else{
                          transResult.tokenAddress = config.originalChainHtlc;
                        }
                }
            } else if (crossType === 'WETH2ETH') {
                //transResult.tokenAddress = config.wanchainHtlcAddr;
                if(protocol === 'E20'){
                  transResult.tokenAddress = config.wanchainHtlcAddrE20;
                }else{
                  transResult.tokenAddress = config.wanchainHtlcAddr;
                }
            }
          //   // add by Jacob for opc begin
          // transResult.storemanGroup[0].wanAddress='0xcd5a7fcc744481d75ab3251545befb282e785882';
          // transResult.storemanGroup[0].ethAddress='0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8';
          //   // Add by Jacob for opc end


            if(opt !== 'APPROVE'){
              if(crossType === 'WETH2ETH'){
                //transResult.storemanGroupAdd = transResult.storemanGroup[0].wanAddress;
                //transResult.storemanGroupAdd = '0xef50b30960d6ddad9b5808092e4a53ca0797fc16';
                transResult.storemanGroupAdd = config.storemanAddWanE20;
              }else{
                //transResult.storemanGroupAdd = transResult.storemanGroup[0].ethAddress;
                //transResult.storemanGroupAdd = '0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8';
                transResult.storemanGroupAdd = config.storemanAddEthE20;
              }
            }



            self.parent.insertChild(index,new FunctionCell(false,function(self){

                // sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroupAdd,
                //     transResult.cross,transResult.gas,transResult.gasPrice,crossType);
              console.log("sendTransaction.createTransaction OPT:",opt,"protocol:",protocol);
              // sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroupAdd,
              //   transResult.cross,transResult.gas,transResult.gasPrice,crossType,protocol,opt);

              sendTransaction.createTransaction(transResult.from,transResult.tokenAddress,transResult.amount,transResult.storemanGroupAdd,
                transResult.cross,transResult.gas,transResult.gasPrice,crossType,0,protocol,opt);

                if (crossType === 'WETH2ETH') {
                    sendTransAndSetValue(self,sendTransaction,transResult);
                } else {
                    sendTransaction.sendLockTrans(transResult.password,function (err,result) {
                        if(!err){
                            console.log(result);
                        }
                        else {
                            console.log("sendTransaction.sendLockTrans error: ",err);
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

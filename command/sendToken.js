let databaseGroup = require('../database/databaseGroup.js');
let wanchain = require('../database/wanDbDefine.js');
databaseGroup.useDatabase([wanchain]);
let prompt = require('../Prompt/newPrompt.js');
let SchemaFactory = require('../Schema/SchemaFactory.js');
let web3 = require('../web3/initweb3.js');
let NormalSend = require('../interface/transaction.js').NormalSend;
let FeeGroup = SchemaFactory.FeeGroup();
let submitSendGroup = SchemaFactory.submitSendGroup();
let CoinAmount = require('../interface/Amount.js').CoinAmount;
let GWeiAmount = require("../interface/Amount.js").GWeiAmount;
let sendSchema = [
    SchemaFactory.fromAccount(web3),
    SchemaFactory.toAccount(),
    SchemaFactory.Amount(),
    FeeGroup[0],
    FeeGroup[1],
    FeeGroup[2],
    submitSendGroup[0],
    submitSendGroup[1]
]
prompt.get(sendSchema, function (err, result) {
    console.log(result);
    let send = new NormalSend(result.from,result.to,new CoinAmount(result.amount),result.gas,new GWeiAmount(result.gasPrice));
    send.send(web3,result.password,function (err, result) {
        if(!err){
            console.log(result);
        }else
        {
            console.log(err);
        }
        process.exit();
    })
});

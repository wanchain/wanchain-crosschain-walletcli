// Start the prompt
let prompt = require('../Prompt/newPrompt.js');
let SchemaFactory = require('../Schema/SchemaFactory.js');
let web3 = require('../web3/initweb3.js');
let keyStore = require('../keystore/keyStore.js');
let wanUtil = require('wanchain-util');
let keystoreSchema = [
    SchemaFactory.password(),
    SchemaFactory.repeatPass()
]
prompt.get(keystoreSchema, function (err, result) {
    console.log(result);
    if(result.password != result.repeatPass)
    {
        console.log("Password is wrong!");
    }
    else
    {
        web3.personal.newAccount(String(result.password),function (err,result) {
            if(!err)
            {
                console.log('address: ' + wanUtil.toChecksumAddress(result));
                console.log('waddress: ' + keyStore.getWAddress(result));
            }
            process.exit();
        })
    }
});
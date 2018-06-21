let passwordProperty = require('../wanschema/index.js').passwordProperty;
let addressProperty = require('../wanschema/index.js').addressProperty;
let UintProperty= require('../wanschema/index.js').UintProperty;
let FloatProperty= require('../wanschema/index.js').FloatProperty;
let YesNoProperty= require('../wanschema/index.js').YesNoProperty;
//let TokencollectionSchama = require('./TokencollectionSchama.js');
//let localAccountProperty = require('./localAccountSchema.js');
let getStoremanGroup = require('./getStoremanGroup.js');
let keystoreAccountSchema= require('../wanschema/index.js').keystoreAccountSchema;
let EnumSchemaProperty = require('../wanschema/index.js').EnumSchemaProperty;
let crossTransOptionalSchama = require('./crossTransOptionalSchama.js');
let walletCore = require('wanchainwalletcore');
let Descript= require('./DescAndMsg.js');
module.exports = {
    password() {
        return new passwordProperty('password',Descript.Description.password,Descript.Message.errPassword,5);
    },
    repeatPass() {
        return new passwordProperty('repeatPass',Descript.Description.repeatPassword,Descript.Message.errRepeatPass,5);
    },
    /*
    fromAccount(web3){
        return new localAccountProperty('from',Descript.Description.localAddress,Descript.Message.errOptionNum,web3);
    },
    */
    fromKeystoreAccount(lockTxchainType) {
        if(lockTxchainType == 'WAN')
            return new keystoreAccountSchema('from', Descript.Description.localWANAddress, Descript.Message.errOptionNum, global.WanKeyStoreDir,lockTxchainType);
            //return new keystoreAccountSchema('from', Descript.Description.localWANAddress, Descript.Message.errOptionNum, walletCore.WanKeyStoreDir,lockTxchainType);
        else
            return new keystoreAccountSchema('from', Descript.Description.localETHAddress, Descript.Message.errOptionNum, global.EthKeyStoreDir,lockTxchainType);
//            return new keystoreAccountSchema('from', Descript.Description.localETHAddress, Descript.Message.errOptionNum, walletCore.EthKeyStoreDir,lockTxchainType);
    },
    getStoremanGroup(sendServer) {
        return new getStoremanGroup('storemanGroup',Descript.Description.getStoremanGroup,Descript.Message.errOptionNum,sendServer);
    },
    crossTransOptionalSchama(lockTxchainType){
        return new crossTransOptionalSchama('lockTxHash',Descript.Description.lockTxHash,Descript.Message.errOptionNum,lockTxchainType);
    },
    toAccount(chainType){
        return new addressProperty('to',Descript.Description.toAddress,Descript.Message.errAddress,chainType);
    },
    crossAccount(chainType){
        return new addressProperty('cross',Descript.Description.toAddress,Descript.Message.errAddress,chainType);
    },
    account(chainType){
        return new addressProperty('account',Descript.Description.address,Descript.Message.errAddress,chainType);
    },
    Amount(){
        return new FloatProperty('amount',Descript.Description.amount,Descript.Message.errAmount,1e-18);
    },
    FeeGroup(){
        let Fee = this.Fee();
        let gasPrice = this.gasPrice();
        let gasLimit = this.gasLimit();
        Fee.SkippedPrompt = [gasPrice,gasLimit];
        return [Fee,gasPrice,gasLimit];
    },
    Fee(){
        let fee = new EnumSchemaProperty('Fee',Descript.Description.inputFee,Descript.Message.errInput,['Default', 'Advanced option']);
        fee.endCell = fee.getSkippedCell(function (value) {
            return value == 1;
        });
        return fee;
    },
    gasPrice(){
        return new UintProperty('gasPrice',Descript.Description.gasPrice,Descript.Message.gasPrice,10,600);
    },
    gasLimit(){
        return new UintProperty('gas',Descript.Description.gasLimit,Descript.Message.gasLimit,21000,4700000);
    },
    submitSend(){
        let submit = new YesNoProperty('submit',Descript.Description.submitSend,Descript.Message.errSubmit);
        submit.endCell = submit.getSkippedCell(function (value) {
            return value == 'N' || value == 'n';
        });
        return submit;
    },
    submitSendGroup(){
        let submit = this.submitSend();
        let password = this.password();
        submit.SkippedPrompt = [password];
        return [submit,password];
    },
    // localTokenBalance(collections,collectionName){
    //     return new TokencollectionSchama('tokenAddress',Descript.Description.tokenBalance,Descript.Message.errOptionNum,collections,collectionName);
    // }
}

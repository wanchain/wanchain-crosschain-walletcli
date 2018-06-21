let OptionalSchemaProperty = require('../wanschema/index.js').OptionalSchemaProperty;
let pattern = require('../wanschema/index.js').pattern;
let FunctionCell = require('../stepcell/index.js').FunctionCell;
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

module.exports = class getStoremanGroup extends OptionalSchemaProperty
{
    constructor(name,message,description,sendServer){
        super(name,message,description,pattern.addressPattern,[]);
        this.sendServer = sendServer;
        let getStoremanGroup = new FunctionCell(false,function(self,param){
            sendServer.sendMessage('syncStoremanGroups',function (err,value) {
                if(!err){
                    value.map((value, index) => {
                        param.push(value);
                    });
                    self.stepNext();
                }
            })

        },this.options);
        getStoremanGroup.reset = function () {};
        this.beginCell.insertChild(0,getStoremanGroup);
        this.beginCell.children[1] = new FunctionCell(true,function(self,obj){
            for(var i = 0;i<obj.options.length;++i){
                let smg = obj.generateStoremanGroup(obj.options[i]);
                console.log(i+1,smg);
            }
        },this)
        // this.beginCell.children[1].reset = function () {};
    }
    generateStoremanGroup(obj){
        let smg = {};
        smg.wanAddress = obj.wanAddress;
        smg.ethAddress = obj.ethAddress;
        smg.deposit = web3.fromWei(obj.deposit);
        smg.inboundQuota = web3.fromWei(obj.inboundQuota);
        smg.outboundQuota = web3.fromWei(obj.outboundQuota);
        return smg;
    }
    getValue(item){
        if(this.sendServer.chainType == 'WAN')
            return item.wanAddress;
        else
            return item.ethAddress;
    }
};

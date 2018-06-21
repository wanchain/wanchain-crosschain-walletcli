let OptionalSchemaProperty = require('../wanschema/index.js').OptionalSchemaProperty;
let pattern = require('../wanschema/index.js').pattern;
let FunctionCell = require('../stepcell/index.js').FunctionCell;
let dbname = 'crossTransDb';
let walletCore = require('wanchainwalletcore');
module.exports = class crossTransOptionalSchama extends OptionalSchemaProperty
{
    constructor(name,message,description,lockTxchainType){
        super(name,message,description,pattern.hashPattern,[]);
        this.chainType = lockTxchainType;

        let select = new FunctionCell(true,function(self,param){
            let collection = global.getCollection(dbname,'crossTransaction');
            let Data = collection.find({refundTxHash : '',revokeTxHash : '',chain:param.chainType});
            for(var i=0;i<Data.length;++i){
                let Item = Data[i];
                if(param.checkItem(Item)){
                    param.options.push({lockTxHash:Item.lockTxHash,from:Item.from,value:Item.value,storeman:Item.storeman,crossAdress:Item.crossAdress});
                }
            }
        },this);
        select.reset = function () {};
        this.beginCell.insertChild(0,select);
    }
    checkItem(item){
        return true;
    }
    getValue(item){
        return item.lockTxHash;
    }
}

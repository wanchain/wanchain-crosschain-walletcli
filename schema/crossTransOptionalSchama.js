let OptionalSchemaProperty = require('../wanschema/index.js').OptionalSchemaProperty;
let pattern = require('../wanschema/index.js').pattern;
let FunctionCell = require('../stepcell/index.js').FunctionCell;
let dbname = 'crossTransDb';
let walletCore = require('wanchain-crosschain');
module.exports = class crossTransOptionalSchama extends OptionalSchemaProperty
{
    constructor(name,description,message,lockTxchainType){
        super(name,description,message,pattern.hashPattern,[]);
        this.chainType = lockTxchainType;

        let select = new FunctionCell(true,function(self,param){
            let collection = global.getCollection(dbname,'crossTransaction');
            //let Data = collection.find({refundTxHash : '',revokeTxHash : '',chain:param.chainType});
            let Data = collection.find({chain:param.chainType}); // only For OPC
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

let OptionalSchemaProperty = require('./OptionalSchemaProperty.js');
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
module.exports = class collectionOptionalSchama extends OptionalSchemaProperty
{
    constructor(name,message,description,pattern,collections,collectionName){
        super(name,message,description,pattern,[]);
        this.collections = collections;
        this.collectionName = collectionName;
        this.select = {};


        let select = new FunctionCell(true,function(self,param){
            let Data = param.getSelect();
            for(var i=0;i<Data.length;++i){
                param.options.push(collection.cloneItem(data[i]));
            }
        },this);
        this.beginCell.insertChild(0,select);
    }
    getCollection(){
        return this.collections.getCollection(this.collectionName);
    }
    getSelect(){
        return this.getCollection().find(this.select);
    }
}

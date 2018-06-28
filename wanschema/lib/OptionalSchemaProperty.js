let SchemaProperty = require('./SchemaProperty.js');
let pattern = require('./pattern.js');
let CellGroup = require('../../stepcell/index.js').CellGroup;
let FunctionCell = require('../../stepcell/index.js').FunctionCell;
module.exports = class OptionalSchemaProperty extends SchemaProperty
{
    constructor(name,description,message,pattern,options){
        super(name,description,message);
        this.options = options;
        this.inputPattern = pattern;
        this.checkOption = true;
        this.beginCell = new CellGroup();
        this.beginCell.addChild(new FunctionCell(true,function(self,obj){
            for(var i = 0;i<obj.length;++i){
                console.log(i+1,obj[i]);
            }
        },this.options));
    }
    getValue(item){
        return item;
    }
    checkInputValue(value){
        return pattern.patternCheck(value,this.inputPattern)
    }
    checkValue(value){
        if(typeof value === 'number' || pattern.UintPattern.test(value))
        {
            if(value>0 && value<=this.options.length) {
                return this.getValue(this.options[value-1]);
            }
        }
        if(this.checkInputValue(value)){
            if(this.checkOption){
                for(var i=0;i<this.options.length;++i){
                    if(this.getValue(this.options[i]) == value.toLowerCase())
                        return value;
                }
                return null;
            }
            return value;
        }
        else{
            return null;
        }
    }

}

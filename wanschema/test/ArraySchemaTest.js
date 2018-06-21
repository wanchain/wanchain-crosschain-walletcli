// Start the prompt
let prompt = require('../../Prompt/newPrompt.js');
const colors = require("colors/safe");
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");
let InputSchemaProperty = require('../NormalSchemaProperty.js').InputSchemaProperty;
let passwordProperty = require('../NormalSchemaProperty.js').passwordProperty;
let addressProperty = require('../NormalSchemaProperty.js').addressProperty;
let UintProperty= require('../NormalSchemaProperty.js').UintProperty;
let testSchemaProperty = require('./testSchemaProperty');
let OptionalSchemaProperty = require('../OptionalSchemaProperty.js');
let FunctionCell = require('../../Algorithm/cell/FunctionCell.js');
let pattern = require('../pattern.js');
let options = ["1000", "2000", "3000", "4000"];
class skipSchemaProperty extends InputSchemaProperty {
    constructor(name,message, description,param) {
        super(name,message, description);
        this.endCell = new FunctionCell(true,function(self,param){
            param.skipped = true;
        },param);
    }
}
let input1 = new InputSchemaProperty('input1','test input 111:','input error');
let password1 = new passwordProperty('password1','test password 222:','password error',10);
let testsc = new testSchemaProperty('testsc','test testSchema 222:','testSchema error');
let skipParam = new skipSchemaProperty('skipaaa','input skip>>:','input error',password1);
let testSchema = [
    input1,skipParam,password1,testsc
]
prompt.get(testSchema, function (err, result) {
    console.log(result);
});
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
let pattern = require('../pattern.js');
let options = ["1000", "2000", "3000", "4000"];
let testSchema = {
    properties:{
        input1 : new InputSchemaProperty('input1','test input 111:','input error'),
        password1 : new passwordProperty('password1','test password 222:','password error',10),
        testsc: new testSchemaProperty('testsc','test testSchema 222:','testSchema error'),
//        uint1 : new UintProperty('uint1','test uint2:','value error!',10,1000),
//        addr : new addressProperty('addr','test address:','address value error!'),
//        dataInput : new OptionalSchemaProperty('dataInput','test options value:','options value error!',pattern.UintPattern,options),
    }
}
prompt.get(testSchema, function (err, result) {
    console.log(result);
});
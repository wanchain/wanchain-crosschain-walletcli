let addressProperty = require('../NormalSchemaProperty.js').addressProperty;
let ArrayCell = require('../../Algorithm/cell/ArrayCell.js');
let MapCell = require('../../Algorithm/cell/MapCell.js');

module.exports = class testSchemaProperty extends addressProperty {
    constructor(name,message, description) {
        super(name,message, description);
        this.beginCell = new ArrayCell(true,function(self,cell,param){
            console.log(cell,param);
        },{name:'testArray',index:1},[0,1,2,3,4,5,6,7,8,9,10]);
        this.endCell = new MapCell(true,function(self,cell,param){
            console.log(cell,param);
            console.log(self.getRoot().param);
        },{name:'testArray',index:1},{a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9,k:10});
    }
}
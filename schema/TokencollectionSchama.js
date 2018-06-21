// let collectionOptionalSchama = require('wanschema').collectionOptionalSchama;
// let pattern = require('wanschema').pattern;
// let CellGroup = require('stepcell').CellGroup;
// let FunctionCell = require('stepcell').FunctionCell;
// let ArrayCell = require('stepcell').ArrayCell;
// let tokenContract = require('wanchaintrans').tokenContract;

// module.exports = class TokencollectionSchama extends collectionOptionalSchama
// {
//     constructor(name,message,description,collections,collectionName,web3){
//         super(name,message,description,pattern.addressPattern,collections,collectionName);
//         let update = new CellGroup();
//         let getData = new FunctionCell(true,function(self,param){
//             self.parent.Data = param.getSelect();
//         },this);
//         update.addChild(getData);
//         let updateItem = new ArrayCell(false,function(self,cell,param){
//             let collection = param.getCollection();
//             let contract = new tokenContract(web3,cell.tokenAddress);
//             contract.balanceOf(cell.address, function (err, result) {
//                 if (!err) {
//                     if (result > 0) {
//                         cell.value = result;
//                         collection.update(cell);
//                     }
//                     else {
//                         collection.remove(cell);
//                     }
//                 }
//                 self.stepNext();
//             });
//         },update.Data,this);
//         update.addChild(updateItem);
//         this.beginCell.insertChild(0,update);
//     }
// }

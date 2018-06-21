let rootCell = require('./rootCell.js');
module.exports = class IntervalRoot extends rootCell
{
    constructor() {
        super();
    }
    eventFunc(obj){
        this.timeInv = setTimeout(function(){
                obj.callFunc();
        },0);
    }
}

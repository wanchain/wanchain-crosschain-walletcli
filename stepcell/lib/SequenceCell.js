let ILoopCell = require('./ILoopCell.js');
module.exports = class SequenceCell extends ILoopCell
{
    constructor(isSync,EachFunc,param) {
        super(isSync);
        this.EachFunc = EachFunc;
        this.param = param;
        this.index = 0;
    }
    reset(){
        super.reset();
        this.index = 0;
    }
    invokeCell(cell){
        this.EachFunc(this,cell,this.param);
    }
    isCellSync(cell){
        return this.isSync();
    }
}

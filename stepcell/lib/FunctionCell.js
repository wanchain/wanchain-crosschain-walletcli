let ILoopCell = require('./ILoopCell.js');
module.exports = class FunctionCell extends ILoopCell
{
    constructor(isSync,func,param) {
        super(isSync);
        this.func = func;
        this.param = param;
    }
    nextCell(){
        return null;
    }
    stepNext(){
        this.Done = true;
        super.stepNext();
    }
    callFunc(bInvoke){
        if(!this.Done){
            this.func(this,this.param);
            if(this.Sync){
                this.Done = true;
            }
        }else if(!bInvoke){
            this.loopEnd();
        }
    }
}

let SequenceCell = require('./SequenceCell.js');
module.exports = class numberCell extends SequenceCell
{
    constructor(isSync,EachFunc,begin,end,param) {
        super(isSync,EachFunc,param);
        this.begin = begin;
        this.end = end;
    }
    nextCell(){
        if(this.begin+this.index<=this.end){
            this.index++;
            return this.begin+this.index-1;
        } else {
            this.Done = true;
            return null;
        }
    }
}

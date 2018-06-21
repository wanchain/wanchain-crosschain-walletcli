let SequenceCell = require('./SequenceCell.js');
module.exports = class ArrayCell extends SequenceCell
{
    constructor(isSync,EachFunc,Array,param) {
        super(isSync,EachFunc,param);
        this.Array = Array;

    }
    nextCell(){
        if(this.index<this.Array.length){
            let item = this.Array[this.index];
            ++this.index;
            return [item,this.index-1];
        } else {
            this.Done = true;
            return null;
        }
    }
}

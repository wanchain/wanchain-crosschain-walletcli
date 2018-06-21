let SequenceCell = require('./SequenceCell.js');
module.exports = class MapCell extends SequenceCell
{
    constructor(isSync,EachFunc,Array,param) {
        super(isSync,EachFunc,param);
        this.Array = Array;
    }
    nextCell(){
        if(this.index<Object.keys(this.Array).length){
            let key = Object.keys(this.Array)[this.index];
            let item = this.Array[key];
            ++this.index;
            return [key,item];
        } else {
            this.Done = true;
            return null;
        }
    }
}

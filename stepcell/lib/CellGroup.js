let ILoopCell = require('./ILoopCell.js');
module.exports = class CellGroup extends ILoopCell
{
    constructor() {
        super(true);
        this.children = [];
        this.index = 0;
    }
    reset(){
        super.reset();
        this.index = 0;
        for(var i=0;i<this.children.length;++i){
            this.children[i].reset();
        }
    }
    size(){
        return this.children.length;
    }
    addChild(child){
        this.children.push(child);
        child.parent = this;
    }
    insertChild(index,child){
        this.children.splice(index,0,child);
        child.parent = this;
    }
    deleteChild(index){
        this.children.splice(index,1);
    }

    nextCell(){
        if(this.index<this.children.length){
            let item = this.children[this.index];
            ++this.index;
            return item;
        } else {
            this.Done = true;
            return null;
        }
    }
    invokeCell(cell){
        cell.callFunc(true);
    }
    isSync(){
        return this.isCellSync(this.children[this.index-1]);
    }
    isCellSync(cell){
        return cell.isSync();
    }
}

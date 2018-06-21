
module.exports = class ILoopCell
{
    constructor(isSync) {
        this.parent = null;
        this.Sync = isSync;
        this.Done = false;
    }
    reset(){
        this.Done = false;
    }
    getRoot(){
        let root = this;
        while(root.parent){
            root = root.parent;
        }
        return root;
    }
    stepNext(){
        if(!this.Sync){
            this.getRoot().stepNextEvent(this);
        }
    }
    loopEnd(){
        if(this.parent){
            this.parent.callFunc();
        }
    }
    nextCell(){}
    callFunc(bInvoke){
        let cell = null;
        do{
            cell = this.nextCell();
            if(cell){
                this.invokeCell(cell);
            }
        } while (cell && this.isCellSync(cell))
        if(!cell && !bInvoke){
            this.loopEnd();
        }
    }
    invokeCell(cell){
        return cell.callFunc(true);
    }
    isCellSync(cell){
        return cell.isSync();
    }
    isSync(){
        return this.Sync || this.Done;
    }
}

let CellGroup = require('./CellGroup.js');
module.exports = class rootCell extends CellGroup
{
    constructor(eventFunc) {
        super();
        if(eventFunc)
            this.eventFunc = eventFunc;
        this.param = {};
    }
    stepNextEvent(obj){
        this.eventFunc(obj);
    }
}

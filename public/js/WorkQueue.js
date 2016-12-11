class WorkQueue{
    constructor(){
        this._queue = [];
    }
    add(workFunc, parameters=[]){
        this._queue.push([workFunc, parameters]);
    }
    execute(){
        var temp = this._queue.shift();
        var workFunc = temp[0];
        var parameters = temp[1];
        workFunc.apply(null, parameters);
        return temp;
    }
    get length(){
        return this._queue.length;
    }
}
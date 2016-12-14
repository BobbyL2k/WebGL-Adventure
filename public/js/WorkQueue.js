/* jshint esversion:6 */

class WorkQueue{
    constructor(){
        this._queue = [];
        this.setCounter = 0;
    }
    add(workFunc, parameters=[]){
        this._queue.push([workFunc, parameters]);
    }
    execute(){
        var work = this._queue.shift();
        work[0].apply(null, work[1]);
        return work;
    }
    get length(){
        return this._queue.length;
    }
    isOverflow(){
        return this.setCounter > 1;
    }
    setComplete(){
        this.setCounter++;
        this.add(function(self){
            self.setCounter--;
        }, [this]);
    }
}
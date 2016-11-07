/* jshint esversion: 6 */

class Pair{
    constructor(first, second){
        this.first = first;
        this.second = second;
    }
}

class RenderSpace{
    constructor(fromVec4, toVec4){ // Range is inclusive (ex for size of 100 range is [0, 99] )
        this._fromVec4 = fromVec4;
        this._toVec4 = toVec4;
        this._dimension = undefined;
    }
    getDimension(){
        if(this._dimension === undefined){
            this._dimension = new THREE.Vector4();
            this._dimension.subVector(this._toVec4, this._fromVec4);
            this._dimension.add(new THREE.Vector4(1, 1, 1, 1));
        }
        return this._dimension;
    }
}

class IsoCamera{
    constructor(rotationMat4, renderSpace){
        this._rotationMat4 = rotationMat4;
        this._renderSpace = renderSpace;
        this._bufferDimension = undefined;
    }
    getBufferDimension(){
        if(this._bufferDimension === undefined){
            var dimension = this._renderSpace.getDimension();
            dimension.applyMatrix4(this._rotationMat4);
            dimension.x = abs(dimension.x);
            dimension.y = abs(dimension.y);
            dimension.z = abs(dimension.z);
            this._bufferDimension = dimension;
        }
        return this._bufferDimension;
    }
}

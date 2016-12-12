/* jshint esversion:6 */


var DynamicObject;
{
    class cl_DynamicObject{
        constructor(object3d, boundArea){
            this._real_object3d = object3d;
            this._boundSize = boundSize;
            this._sxRenderer = new SxRenderer(object3d, boundArea);
        }
    }
    DynamicObject = cl_DynamicObject;
}

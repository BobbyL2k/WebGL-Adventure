/* jshint esversion:6 */


var DynamicObject;
{
    class cl_DynamicObject{
        constructor(object3d, boundArea){
            this.position = {
                x: object3d.position.x,
                y: object3d.position.y,
                z: object3d.position.z,
            };
            this.rotation = {
                x: 0,
                y: 0,
                z: 0,
            };
            this._real_object3d = object3d;
            this.sxRenderer = new SxRenderer(object3d, boundArea);
            this.voxelScene = [new VoxelScene(), new VoxelScene()];
            this.voxelObject = [
                this.voxelScene[0].getThreeJsObject3D(), 
                this.voxelScene[1].getThreeJsObject3D()];
            this._size = boundArea.size/2;                  /// TODO remove size after transfor to voxel of size 1
        }
        sampleObjectState(){
            this._real_object3d.rotation.x = this.rotation.x;
            this._real_object3d.rotation.y = this.rotation.y;
            this._real_object3d.rotation.z = this.rotation.z;

            this._real_object3d.position.x = this.position.x;
            this._real_object3d.position.y = this.position.y;
            this._real_object3d.position.z = this.position.z;
            this.voxelCenter = {
                x: Math.round(this._size*this.position.x)/this._size,
                y: Math.round(this._size*this.position.y)/this._size,
                z: Math.round(this._size*this.position.z)/this._size,
            };
            this.sxRenderer.updateRenderingArea( { center:this.voxelCenter } );
        }
        clearVoxelFromBuffer(voxelBufferIndex){
            this.voxelScene[voxelBufferIndex].clear();
        }
        projectObjectToBuffer(angle){
            this.sxRenderer.renderAngle(angle);
        }
        convertBufferToVoxel(angle, voxelBufferIndex, materialHolder){
            this.voxelScene[voxelBufferIndex].addVoxel(this.sxRenderer.floatBuffer[angle], angle, materialHolder);
        }
        packageVoxel(voxelBufferIndex){
            this.voxelObject[voxelBufferIndex].position.x = this.voxelCenter.x;
            this.voxelObject[voxelBufferIndex].position.y = this.voxelCenter.y;
            this.voxelObject[voxelBufferIndex].position.z = this.voxelCenter.z;
        }
    }
    DynamicObject = cl_DynamicObject;
}

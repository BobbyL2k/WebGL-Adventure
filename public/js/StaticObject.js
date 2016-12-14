/* jshint esversion:6 */

var StaticObject;
{
    class cl_StaticObject{
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
            this.renderer = new SliceRenderer(this._real_object3d, boundArea);
            // this.renderer = new SxRenderer(this._real_object3d, boundArea);
            this.voxelScene = new VoxelScene();
            this.voxelObject = this.voxelScene.getThreeJsObject3D();
        }
        projectObjectToVoxel(materialsHolder){
            // console.log(materialsHolder);

            this.renderer.renderAll();
            this.voxelScene.addSliceVoxelGroup(this.renderer.floatBuffer, materialsHolder)

            // this.renderer.renderAll(false);
            // this.voxelScene.addSXVoxelGroup(this.renderer.floatBuffer, materialsHolder)
        }
    }
    StaticObject = cl_StaticObject;
}
/* jshint esversion:6 */

var VoxelSceneManager;
{
    class cl_VoxelSceneManager{
        constructor(){
            this.voxelSceneArray = [];
            this.scene = new THREE.Scene();
        }
        clear(){
            for(var c=0; c<this.voxelSceneArray.length; c++){
                this.voxelSceneArray[c].clear();
            }
        }
        getThreeJsScene(){
            return this.scene;
        }
        getThreeJsObject3D(objIndex){
            this.ensureCapacity(objIndex);
            return this.voxelSceneArray[objIndex].scene;
        }
        addSliceVoxelGroup(objIndex, voxelGroup){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addSXVoxelGroup(voxelGroup);
        }
        addSXVoxelGroup(objIndex, voxelGroup){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addSXVoxelGroup(voxelGroup);
        }
        addVoxel(objIndex, voxels, direction){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addVoxel(voxels, direction);
        }
        ensureCapacity(index){
            while( this.voxelSceneArray.length <= index ){
                var voxelScene = new VoxelScene();
                this.scene.add(voxelScene.getThreeJsObject3D());
                this.voxelSceneArray.push(voxelScene);
            }
        }
    }
    VoxelSceneManager = cl_VoxelSceneManager;
}
/* jshint esversion:6 */

/// UNUSED

var VoxelSceneManager;
{
    class cl_VoxelSceneManager{
        constructor(){
            this.voxelSceneArray = [];
            this.scene = new THREE.Object3D();
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
        addSliceVoxelGroup(objIndex, voxelGroup, materialsHolder){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addSXVoxelGroup(voxelGroup, materialsHolder);
        }
        addSXVoxelGroup(objIndex, voxelGroup, materialsHolder){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addSXVoxelGroup(voxelGroup, materialsHolder);
        }
        addVoxel(objIndex, voxels, direction, materialsHolder){
            this.ensureCapacity(objIndex);
            this.voxelSceneArray[objIndex].addVoxel(voxels, direction, materialsHolder);
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
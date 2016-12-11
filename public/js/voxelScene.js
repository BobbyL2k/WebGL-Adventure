/* jshint esversion:6 */

var VoxelScene;
{
    function recursiveDisposeAll(object){
        if(object.children){
            object.children.forEach(recursiveDisposeAll);
        }
        if(object.geometry){
            object.geometry.dispose();
            // console.log(object, 'has geometry');
        }
        if(object.material){
            object.material.dispose();
            // console.log(object, 'has material');
        }
        if(object instanceof THREE.Mesh){
            // console.log(object);
            // object.dispose();
        }
    }

    class cl_VoxelScene{
        constructor(){
            this.scene = new THREE.Object3D();
            this.voxelAdded = [];
        }
        clear(){
            recursiveDisposeAll(this.scene);
            for(var c=0; c<this.voxelAdded.length; c++){
                this.scene.remove(this.voxelAdded[c]);
            }
            this.voxelAdded = [];
        }
        getThreeJsObject3D(){
            return this.scene;
        }
        addSliceVoxelGroup(voxelGroup){
            for(var c=0; c<voxelGroup.length; c++){
                this.addVoxel(voxelGroup[c], 0);
            }
        }
        addSXVoxelGroup(voxelGroup){
            var length = Math.min(6, voxelGroup.length);
            for(var c=0; c<length; c++){
                this.addVoxel(voxelGroup[c], c);
            }
        }
        addVoxel(voxels, direction){
            // Add voxels to object
            var di = Math.sqrt(voxels.length/4);
            var aPlane = new THREE.Object3D();
            var geometry = new THREE.BoxGeometry( 2/di, 2/di, 2/di );
            for(var index=0; index<voxels.length; index+=4){
                if(voxels[index+1] != 0){
                    var color = Math.floor(Math.random()*255*255*255);
                    var material = new THREE.MeshBasicMaterial( {color: color} );
                    var voxel = new THREE.Mesh( geometry, material );
                    var corX = (index / 4) % di;
                    var corY = Math.floor((index / (4 * di)));
                    voxel.position.x = (corX*2/di-1 + (1/di));
                    voxel.position.y = -(corY*2/di-1 + (1/di));
                    voxel.position.z = -(Math.round(voxels[index] -1)/(di/2) + 1/di);
                    aPlane.add(voxel);
                }
            }
            //rotate object
            if(direction < 4){
                aPlane.rotation.y = (Math.PI/2) * direction;
            }else if(direction == 4){
                aPlane.rotation.x = -Math.PI/2;
            }else{
                aPlane.rotation.x = Math.PI/2;
            }
            //add object
            this.scene.add(aPlane);
            this.voxelAdded.push(aPlane);
        }
    }
    VoxelScene = cl_VoxelScene;
}
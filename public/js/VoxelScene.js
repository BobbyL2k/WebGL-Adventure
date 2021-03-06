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
    }

    var color = Math.floor(Math.random()*255*255*255);
    var MAT = new THREE.MeshBasicMaterial( {color: color} );

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
        addSliceVoxelGroup(voxelGroup, materialsHolder){
            for(var c=0; c<voxelGroup.length; c++){
                this.addVoxel(voxelGroup[c], 0, materialsHolder);
            }
        }
        addSXVoxelGroup(voxelGroup, materialsHolder){
            var length = Math.min(6, voxelGroup.length);
            for(var c=0; c<length; c++){
                this.addVoxel(voxelGroup[c], c, materialsHolder);
            }
        }
        addVoxel(voxels, direction, materialsHolder){
            var ignore = [];
            if(ignore.indexOf(direction) != -1){
                return;
            }
            // Add voxels to object
            var di = Math.sqrt(voxels.length/4);
            var aPlane = new THREE.Object3D();
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
            for(var index=0; index<voxels.length; index+=4){
                if(voxels[index] !== 0){
                    //var color = Math.floor(Math.random()*255*255*255);
                    //if(direction == 4)
                    //    material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
                    var voxel = new THREE.Mesh( geometry, materialsHolder.getMaterial(voxels[index]));
                    // var voxel = new THREE.Mesh( geometry, material);
                    // var corX = (index / 4) % di;
                    // var corY = Math.floor((index / (4 * di)));
                    // var corZ = -(Math.round(voxels[index+2] -1));
                    var pixelX = (index / 4) % di;
                    var pixelY = di -1 -Math.floor((index / (4 * di)));
                    // pixelY = (Math.random() > 0.5?di-1:pixelY);
                    // pixelY = (Math.random() > 0.5?0:pixelY);
                    // var corX = (Math.random() > 0.5?di/2:-di/2);
                    var corX = pixelX - di/2 + 0.5;
                    var corY = -(pixelY - di/2 + 0.5);
                    var corZ = Math.round(voxels[index+3]) - 0.5; 
                    voxel.position.x = corX;
                    voxel.position.y = corY;
                    voxel.position.z = corZ;
                    voxel.castShadow = true;
                    voxel.receiveShadow = true;
                    aPlane.add(voxel);
                }
            }
            // rotate object
            if(direction < 4){
                aPlane.rotation.y = -(Math.PI/2) * direction;
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
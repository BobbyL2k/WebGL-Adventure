class CreateScene{
    constructor(){ 
        this.scene = new THREE.Object3D();
    }
    getObject(){
        return this.scene;
    }
    addVoxel(voxels,direction){
        // Add voxels to object
        var di = Math.sqrt(voxels.length/4);
        var aPlane = new THREE.Object3D();
        var geometry = new THREE.BoxGeometry( 2/di, 2/di, 2/di );
        for(var index=0; index<voxels.length; index+=4){
            if(voxels[index+1] != 0){
                var color = Math.floor(Math.random()*16777215);
                var material = new THREE.MeshBasicMaterial( {color: color} );
                var voxel = new THREE.Mesh( geometry, material );
                var corX = (index / 4) % di;
                var corY = Math.floor((index / (4 * di)));
                console.log(corX + " " + corY);
                voxel.position.x = corX*2/di-1 + (1/di);
                voxel.position.y = corY*2/di-1 + (1/di);
                voxel.position.z = Math.floor(voxels[index])/(di/2) + 1/di;
                console.log(voxels[index]);
                console.log(voxel.position.z);
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
    }
}
/* jshint esversion:6 */

class MaterialsHolder{
    constructor(){
        this.materials = [];
        this.voxelMaterials = [];
        // TODO load material from json file

        this._vertexShader = document.querySelector('#post-vert').textContent.trim();
        this._fragmentShader = document.querySelector('#post-frag').textContent.trim();

        var material = new THREE.MeshPhongMaterial( { color: 0xe39f1b, combine: THREE.MixOperation, reflectivity: 0.3,shininess:100 } );
        this.addMaterial(1, material);
        material = new THREE.MeshPhongMaterial( { color: 0x00ff66, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.addMaterial(2, material);
        material = new THREE.MeshPhongMaterial( { color: 0x000066, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.addMaterial(3, material);
        material = new THREE.MeshPhongMaterial( { color: 0xff0000, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.addMaterial(4, material);
    }
    
    addMaterial(materialId, material){
        if(this.materials[materialId]){
            throw "material with ID exist!";
        }else{
            this.materials[materialId] = material;
            this.voxelMaterials[materialId] = new THREE.ShaderMaterial({
                uniforms: {
                    materialId: { value: materialId },
                },
                vertexShader: this._vertexShader,
                fragmentShader: this._fragmentShader,
            });
        }
    }
    getMaterial(materialId){
        if(this.materials[materialId] == undefined){
            console.log("no material with ID " + materialId);
            return this.materials[1];
            //throw "no material with ID " + materialId;
        }else{
            return this.materials[materialId];
        }
    }
}
/* jshint esversion:6 */

class MaterialsHolder{
    constructor(){
        this.materials = [];
        this.Voxelmaterials = [];
        // TODO load material from json file

        this._vertexShader = document.querySelector('#post-vert').textContent.trim();
        this._fragmentShader = document.querySelector('#post-frag').textContent.trim();

        var material = new THREE.MeshPhongMaterial( { color: 0xff6600, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.addMaterail(1, material);
        material = new THREE.MeshPhongMaterial( { color: 0x00ff66, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.addMaterail(2, material);
    }
    addMaterail(materialId, material){
        if(this.materials[materialId]){
            throw "material with ID exist!";
        }else{
            this.materials[materialId] = material;
            this.Voxelmaterials[materialId] = new THREE.ShaderMaterial({
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
            return this.materials[1000];
            //throw "no material with ID " + materialId;
        }else{
            return this.materials[materialId];
        }
    }
}
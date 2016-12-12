/* jshint esversion:6 */

class MaterialsHolder{
    constructor(){
        this.materials = [];
        // TODO load material from json file
        var material = new THREE.MeshPhongMaterial( { color: 0xff6600, combine: THREE.MixOperation, reflectivity: 0.3,shininess:25 } );
        this.materials[1] = material;   
    }
    addMaterail(materialID,material){
        if(this.materials[materialID]){
            throw "material with ID exist!";
        }else{
            this.materials[materialID] = material;
        }
    }
    getMaterial(materialID){
        if(this.materials[materialID] == undefined){
            console.log("no material with ID " + materialID);
            return this.materials[1000];
            //throw "no material with ID " + materialID;
        }else{
            return this.materials[materialID];
        }
    }   
}
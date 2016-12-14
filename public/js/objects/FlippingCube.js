/* jshint esversion:6 */

class FlippingCube extends DynamicObject{
    constructor(cubeSize, flips=4){
        var material = new THREE.ShaderMaterial({
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
        var geometry = new THREE.BoxBufferGeometry(cubeSize,cubeSize,cubeSize);
        cube = new THREE.Mesh(geometry,material);
        // cube.position.x = -cubeSize/2;
        // cube.position.y = +cubeSize/2;
        cubeObj = new THREE.Object3D();
        cubeObj.add(cube);
        super( cubeObj ,{size:Math.ceil(cubeSize*3)});
        // this.direction = 0; // +x -z -x +z
        // this.moveDistance = 3; // before changing direction
        this.flips = flips;
        // this.time = 0;
        // this.timePerFlip = 1000;
        this.timeFactor = 1000;
    }
    animate( time ){
        var stime = time / this.timeFactor;
        const stimePerSide = (Math.PI /2) * this.flips;
        var m = Math.floor((stime / stimePerSide) % 4);
        stime = stime % stimePerSide;
        // console.log(m);
        if(m == 0){
            this.position.x = Math.sin((stime % (Math.PI/2)) - (Math.PI/4)) * cubeSize / Math.sqrt(2) +
                          cubeSize*Math.floor( stime/(Math.PI/2));
            this.rotation.z = -stime;
        }else if(m == 2){
            this.position.x = -((Math.sin((stime % (Math.PI/2)) - (Math.PI/4)) * cubeSize / Math.sqrt(2) +
                          cubeSize*Math.floor( stime/(Math.PI/2)))) + cubeSize * (this.flips-1);
            this.rotation.z = stime;
        }else if(m == 1){
            this.position.z = ((Math.sin((stime % (Math.PI/2)) - (Math.PI/4)) * cubeSize / Math.sqrt(2) +
                          cubeSize*Math.floor( stime/(Math.PI/2)))) + cubeSize/2;
            this.rotation.x = stime;
        }else{
            this.position.z = -((Math.sin((stime % (Math.PI/2)) - (Math.PI/4)) * cubeSize / Math.sqrt(2) +
                          cubeSize*Math.floor( stime/(Math.PI/2)))) + cubeSize * (this.flips-0.5);
            this.rotation.x = -stime;
        }
        this.position.y = Math.cos((stime % (Math.PI/2)) - (Math.PI/4)) * cubeSize / Math.sqrt(2);
    }
}
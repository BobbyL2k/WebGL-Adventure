var scene = new THREE.Scene();
var bufferScene = new THREE.Scene();
var GLDom = document.getElementById("GL");
var width = 30;
var height = 30;
var viewportWidth = GLDom.offsetWidth;
var viewportHeight = GLDom.offsetHeight;
var aspect = width / height;
var camera = new THREE.OrthographicCamera(-1,1,-1,1,-10,10);
var renderer = new THREE.WebGLRenderer();
var dbCanvasDom = document.getElementById("debugCanvas");
var dbCanvasCtx = dbCanvasDom.getContext("2d");
var pixels = new Uint8Array(width * height * 4);
var float_pixels = new Float32Array(width * height * 4);
var gl;
var cubes = new Uint8Array(10 * 10 * 4);
renderer.setSize( viewportWidth, viewportHeight );
dbCanvasDom.width = width;
dbCanvasDom.height = height;
GLDom.appendChild( renderer.domElement );
renderer.domElement.style.width = "";
renderer.domElement.style.height = "";
var bufferTexture = new THREE.WebGLRenderTarget( 
    width, 
    height, 
    { 
        minFilter: THREE.NearestFilter, 
        magFilter: THREE.NearestFilter, 
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    } );

bufferTexture.texture.generateMipmaps = false;
bufferTexture.stencilBuffer = false;
bufferTexture.depthBuffer = true;
bufferTexture.depthTexture = new THREE.DepthTexture();
bufferTexture.depthTexture.type = THREE.UnsignedShortType;


var geometry = new THREE.SphereGeometry( 1, 10, 10 );
// var material = new THREE.MeshNormalMaterial();
var material = new THREE.ShaderMaterial({
          vertexShader: document.querySelector('#post-vert').textContent.trim(),
          fragmentShader: document.querySelector('#post-frag').textContent.trim(),
          uniforms: {
            cameraNear: { value: -1 },
            cameraFar:  { value: 1 },
            //tDiffuse:   { value: bufferTexture.texture },
            tDepth:     { value: bufferTexture.depthTexture }
          }
        });

var cube = new THREE.Mesh( geometry, material );
//cube.position.y-=1;
bufferScene.add( cube );
camera.position.z = 1;
camera.lookAt(scene.position);

//var bufferScene = new THREE.Scene();

var bufferGeometry = new THREE.PlaneBufferGeometry(1,1);
var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: bufferTexture.texture } );
var plane = new THREE.Mesh(bufferGeometry,material2);

scene.add(plane);

var prevFrameTime = 0;
var coreRender = function (time) {
    requestAnimationFrame( coreRender );
    render(time - prevFrameTime, time);
    prevFrameTime = time;
};

coreRender(0);

function render(frameTime, time) {
    //cube.rotation.y += 0.001 * frameTime;
    // camera.position.y = cameraDefault.position.y + Math.sin(time / 1000);
    // camera.position.x = cameraDefault.position.y + Math.cos(time / 1000);
    //plane.rotation.x += 0.01;
    
    for(var i =0; i<cubes.length;i++)
        cubes[i]=1;
    var s = getScene(cubes);
    renderer.render( bufferScene, camera, bufferTexture );
    renderer.render( s, camera );
    // renderer.render( scene, camera );
    renderer.readRenderTargetPixels(bufferTexture,0 ,0,width,height,float_pixels);
    //var canvas = document.querySelector('canvas');
    //renderer.readRenderTargetDepthPixels(canvas.getContext('webgl2'),bufferTexture,0 ,0,width,height,float_pixels);
    //console.log(float_pixels);
    //console.log(pixels.filter(function(x){return x!=0 && x!=255}));
    /// Canvas Code
    var counter = 0;
    dbCanvasCtx.clearRect(0, 0, dbCanvasDom.width, dbCanvasDom.height);
    dbCanvasCtx.beginPath();
    dbCanvasCtx.moveTo(0, 0);
    for(var index=0; index<height*width*4; index+=4){
//         if(counter++ > 2) break;
        if(pixels[index] !== 0){
            var corX = (index / 4) % width;
            var corY = (index / (4 * width));
            dbCanvasCtx.lineTo(corX, corY);
        }
    }
    dbCanvasCtx.closePath();
    dbCanvasCtx.stroke();
    /// END Canvas Code

}

function getScene(cubes) {
    var scene = new THREE.Scene();
    var di = Math.sqrt(cubes.length/4);

    var geometry = new THREE.BoxGeometry( 2/di, 2/di, 2/di );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    for(var index=0; index<cubes.length; index+=4){
        if(cubes[index+1] != 0){
            var color = Math.floor(Math.random()*16777215);
            var material = new THREE.MeshBasicMaterial( {color: color} );
            var cube = new THREE.Mesh( geometry, material );
            var corX = (index / 4) % di;
            var corY = Math.floor((index / (4 * di)));
            console.log(corX + " " + corY);
            cube.position.x = corX*2/di-1+1/di;
            cube.position.y = corY*2/di-1+1/di;
            scene.add(cube);
        }
    }
    return scene;
}
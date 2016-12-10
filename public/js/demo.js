var renderer;
var renderingArea;
var scene;

init();
//startProgramLoop();
var cs = new CreateScene();
for(var i=0;i<6;i++)
    cs.addVoxel(renderer.floatBuffer[i],i);
scene = cs.getObject();
var s = new THREE.Scene();
s.add(scene);
var camera = new THREE.OrthographicCamera(-1,1,-1,1,-10,10);
var renderer2 = new THREE.WebGLRenderer();
var dbCanvasDom = document.getElementById("debugCanvas");
var GLDom = document.getElementById("GL");
renderer2.setSize( 500, 500 );
GLDom.appendChild( renderer2.domElement );
camera.position.z = 1;
camera.lookAt(scene.position);

var prevFrameTime = 0;
var coreRender = function (time) {
    requestAnimationFrame( coreRender );
    render(time - prevFrameTime, time);
    prevFrameTime = time;
};

coreRender(0);

function render(frameTime, time) {
     scene.rotation.x += 0.01;
     scene.rotation.y += 0.01;
    
    renderer2.render( s, camera );
}

// code execution is finished
// bellow are function definition

function init(){
    "use strict";
    renderingArea = {
        center: {
            x:0, y:0, z:0,
        },
        size: 30,
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels

    setUpGlCanvas(); // renderer is set in setUpGlCanvas
    renderer.renderAll();
    console.log(renderer.floatBuffer);

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();
        scene = getScene(); // setting global var
        renderer = getRenderer(scene);
        renderer.addDomTo(container[0]);
        return;

        function getDomContainer(){
            return [
                document.getElementById('GL1'),
                document.getElementById('GL2'),
                document.getElementById('GL3'),
                document.getElementById('GL4'),
                document.getElementById('GL5'),
                document.getElementById('GL6'),
            ];
        }
        function getRenderer(obj3dScene){
            return new sxRenderer(obj3dScene, renderingArea);
        }
    }
    function getScene(){
        var scene = new THREE.Object3D();
        var geometry = new
            THREE.TeapotBufferGeometry(5);
            // THREE.SphereGeometry( 5, 10, 10 );
            // THREE.BoxBufferGeometry( 4, 4, 4 );
        var material = new THREE.ShaderMaterial({
            vertexShader: document.querySelector('#post-vert').textContent.trim(),
            fragmentShader: document.querySelector('#post-frag').textContent.trim(),
        });
        var sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        return scene;
    }
}

var renderer;
var renderingArea;
var camera;
var mainScene;
var scene;
var bufferTexture;
var float_buffer;

init();
startProgramLoop();
// code execution is finished
// bellow are function definition

function init(){
    "use strict";
    var aoiSize = 100;       // Area of interest size
    renderingArea = {
        center: {
            x:0, y:0, z:0,
        },
        size: {
            x:aoiSize,
            y:aoiSize,
            z:aoiSize,
        },
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels

    setUpGlCanvas(); // renderer is set in setUpGlCanvas
    var sceneBundle = getScene();
    mainScene = sceneBundle.mainScene;
    scene = sceneBundle.scene;
    camera = getCamera();
    bufferTexture = new THREE.WebGLRenderTarget(
        aoiSize,
        aoiSize,
        {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        });
    float_buffer = new Float32Array(aoiSize * aoiSize * 4);
    renderer.render( mainScene, camera );
    renderer.render( mainScene, camera, bufferTexture );
    renderer.readRenderTargetPixels( bufferTexture, 0, 0, aoiSize, aoiSize, float_buffer);
    console.log(float_buffer);

    // var renderBuffer = new Uint8Array(aoiSize * aoiSize * 4);
        // 4 is from WebGL 4 output color channels
    return;

    function setUpGlCanvas(){
        var container = getDomContainer();
        renderer  = getRenderer();
        container.appendChild( renderer.domElement );
        // make GL Canvas Scale to Parent
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        return renderer;

        function getDomContainer(){
            return document.getElementById('GL');
        }
        function getRenderer(){
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize(aoiSize, aoiSize);
            return renderer;
        }
    }
    function getScene(){
        var mainScene = new THREE.Scene();
        var scene = new THREE.Object3D();
        var geometry = new
            THREE.TeapotBufferGeometry(10);
            // THREE.SphereGeometry( 5, 10, 10 );
            // THREE.BoxBufferGeometry( 4, 4, 4 );
        var material = new THREE.ShaderMaterial({
            vertexShader: document.querySelector('#post-vert').textContent.trim(),
            fragmentShader: document.querySelector('#post-frag').textContent.trim(),
        });
        var sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );
        mainScene.add( scene );
        return {mainScene, scene};
    }
    function getCamera(){
        var camera = new THREE.OrthographicCamera();
        updateOrthoCamera( camera, renderingArea );
        return camera;
    }
}

var prevFrameTime = 0;
function startProgramLoop(time=0){
    requestAnimationFrame( startProgramLoop );
    renderLoop(time - prevFrameTime, time);
    prevFrameTime = time;
    return;

    function renderLoop(frameTime, time){
        var t = (~~(time / 1000) % 7) - 3;
        scene.rotation.y = Math.sin(time / 3000);
        renderingArea.center.x = t;
        updateOrthoCamera( camera, renderingArea );
        renderer.render( mainScene, camera );
    }
}

function updateOrthoCamera(camera, renderingArea){
    camera.left   = renderingArea.center.x - renderingArea.size.x/2;
    camera.right  = renderingArea.center.x + renderingArea.size.x/2;
    camera.top    = renderingArea.center.y + renderingArea.size.y/2;
    camera.bottom = renderingArea.center.y - renderingArea.size.y/2;
    camera.near   = renderingArea.center.z - renderingArea.size.z/2;
    camera.far    = renderingArea.center.z + renderingArea.size.z/2;
    camera.updateProjectionMatrix();
}
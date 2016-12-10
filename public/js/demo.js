/* jshint esversion:6 */

// Rasterization Renderer
var renderingArea;
var scene;
var sxRenderer;
// Voxel Renderer
var voxelSubScene;
var mainScene;
var mainCamera;
var mainRenderer;

init();
startProgramLoop();
// code execution is finished
// bellow are function definition

function init(){
    "use strict";
    renderingArea = {
        center: {
            x:0, y:0, z:0,
        },
        size: 5,
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels

    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas
    sxRenderer.renderAll();
    console.log(sxRenderer.floatBuffer);

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();
        scene = getScene(); // setting global var
        sxRenderer = getSxRenderer(scene);
        sxRenderer.addDomTo(container[1]);

        // TODO fix magic numbers
        mainCamera = new THREE.OrthographicCamera(-1,1,-1,1,-10,10);
        mainCamera.position.z = 1;
        mainScene = new THREE.Scene();
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        mainRenderer.setSize( 500, 500 );
        container[0].appendChild(mainRenderer.domElement);
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
        function getScene(){
            var scene = new THREE.Object3D();
            var geometry = new
                THREE.TeapotBufferGeometry(1.5);
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
        function getMainRenderer(){
            return new THREE.WebGLRenderer();
        }
        function getSxRenderer(obj3dScene){
            return new sxRenderer(obj3dScene, renderingArea);
        }
    }
}

var prevFrameTime = 0;
var counter = 0;
var counter2 = 0;
function startProgramLoop(time=0){
    requestAnimationFrame( startProgramLoop );
    renderLoop(time - prevFrameTime, time);
    prevFrameTime = time;
    return;

    function renderLoop(frameTime, time){
        counter += frameTime;
        counter2 += frameTime;
        if(counter > 500){ // update Voxel 2 FPS (every 500 milisec)
            counter = 0;
            mainScene.remove(voxelSubScene.getThreeJsObject3D());
            voxelSubScene.clear();
            sxRenderer.renderAll(false);
            voxelSubScene.addSXVoxelGroup(sxRenderer.floatBuffer);
            var voxelObject3D = voxelSubScene.getThreeJsObject3D();
            mainScene.add(voxelObject3D);
            mainCamera.lookAt( voxelObject3D.position );
        }
        if(counter2 > 13.3){ // redraw screen 60 FPS (every 13.3 milisec)
            counter2 = 0;
            var voxelObject3D = voxelSubScene.getThreeJsObject3D();
            voxelObject3D.rotation.x += 0.01;
            voxelObject3D.rotation.y += 0.01;
            mainRenderer.render( mainScene, mainCamera );
        }
    }
}
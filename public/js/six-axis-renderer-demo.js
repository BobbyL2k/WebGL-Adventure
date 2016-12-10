var renderer;
var renderingArea;
var scene;

init();
startProgramLoop();
// code execution is finished
// bellow are function definition

function init(){
    "use strict";
    renderingArea = {
        center: {
            x:0, y:0, z:2,
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
        renderer.addDomTo(container);
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

var prevFrameTime = 0;
var counter = 0;
function startProgramLoop(time=0){
    requestAnimationFrame( startProgramLoop );
    renderLoop(time - prevFrameTime, time);
    prevFrameTime = time;
    return;

    function renderLoop(frameTime, time){
        counter += frameTime;
        if(counter > 500){
            counter = 0;
            // var t = (~~(time / 1000) % 7) - 3;
            // scene.rotation.y = Math.sin(time / 3000);
            // renderingArea.center.x = t;
            renderer.renderAll();
        }
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
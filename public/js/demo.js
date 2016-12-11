/* jshint esversion:6 */

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000/60;

const VOXEL_REFRESH_RATE = 12;
const V_FRAMETIME_LIMIT = 1000 / VOXEL_REFRESH_RATE;

const EXPECT_DELTA = 2;                     // Expect work to take about 2ms
const SPARE_COMPUTE_TIME = TARGET_FRAME_TIME - EXPECT_DELTA;

// Load balancer
var max_delta = 0;
// var workDone = 0;

// Program Loop
var prevFrameTime = 0;
var counter = 0;

// Game Logic
var sceneRotation = {x:0, y:0, z:0};

// Rasterization Renderer
var renderingArea;
var scene;
var sxRenderer;
// Voxel Renderer
var voxelSubScene;
var mainScene;
var mainCamera;
var mainRenderer;
var currentVR;
// Work queue
var workQueue;

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
        size: 25,
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels

    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas
    sxRenderer.renderAll();
    console.log(sxRenderer.floatBuffer);

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();

        // TODO fix magic numbers
        mainCamera = new THREE.OrthographicCamera(-1,1,-1,1,-10,10);
        mainCamera.position.z = 1;
        mainScene = new THREE.Scene();
        voxelSubScene = [new VoxelScene(), new VoxelScene()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        mainRenderer.setSize( 500, 500 );
        container[0].appendChild(mainRenderer.domElement);

        scene = getScene(); // setting global var
        sxRenderer = getSxRenderer(scene);
        sxRenderer.addDomTo(container[1]);
        currentVR = 0;

        workQueue = new WorkQueue();
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
                THREE.TeapotBufferGeometry(6);
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
            return new SxRenderer(obj3dScene, renderingArea);
        }
    }
}

function startProgramLoop(time=0){
    requestAnimationFrame( startProgramLoop );
    renderLoop(time - prevFrameTime, time);
    prevFrameTime = time;
    return;

    function renderLoop(frameTime, time){

        counter += frameTime;

        if(counter > V_FRAMETIME_LIMIT){ // update Voxel 12 FPS (every 83 milisec)
            counter = 0;
            // Add work to workQueue
            workQueue.add(removeOldVoxelSubScene);
            for(let c=0; c<6; c++){
                workQueue.add(renderSixAxis, [c]);
            }
            for(let c=0; c<6; c++){
                workQueue.add(projectRenderedVoxelToSS, [c]);
            }
            workQueue.add(replaceOldVoxelSubScene);
        }

        var voxelObject3D = voxelSubScene[currentVR].getThreeJsObject3D();
        sceneRotation.x += 0.01;
        sceneRotation.y += 0.01;
        voxelObject3D.rotation.x = sceneRotation.x;
        voxelObject3D.rotation.y = sceneRotation.y;
        // var ProgramLogicTime = performance.now();        /// For performance monitoring
        mainRenderer.render( mainScene, mainCamera );
        // var RenderTime = performance.now();              /// For performance monitoring

        // if(workDone>0) console.log('work Done', workDone);
        // if(workQueue.length>0) console.log('work Queue', workQueue.length);
       
        var timeLeft = SPARE_COMPUTE_TIME - (performance.now() - time);
        // workDone = 0;
        while(workQueue.length > 9 || timeLeft > 0){
            var timeBefore = performance.now();
            if(workQueue.length > 0){
                var work = workQueue.execute();
                // var delta = performance.now() - timeBefore;
                // if(delta > max_delta){
                //     max_delta = delta;
                //     console.log("Delta", delta, work);
                // }else{
                //     max_delta -= 0.001;
                // }
                // workDone++;                              /// Work Delta monitoring
            }
            timeLeft = SPARE_COMPUTE_TIME - (performance.now() - time);
        }
        // var SpareComputeTime = performance.now();        /// For performance monitoring
        // console.log(
        //     "T",
        //     ProgramLogicTime - time,
        //     RenderTime - time,
        //     SpareComputeTime - RenderTime,
        //     "Total",
        //     SpareComputeTime-time);                      /// For performance monitoring
    }

    // Work in queue
    function removeOldVoxelSubScene(){
        voxelSubScene[(currentVR+1)%2].clear();
    }
    function renderSixAxis(angle){
        sxRenderer.renderAngle(angle);
    }
    function projectRenderedVoxelToSS(angle){
        voxelSubScene[(currentVR+1)%2].addVoxel(sxRenderer.floatBuffer[angle], angle);
    }
    function replaceOldVoxelSubScene(){
        mainScene.remove(voxelSubScene[currentVR].getThreeJsObject3D());
        currentVR = (currentVR+1)%2;
        var voxelObject3D = voxelSubScene[currentVR].getThreeJsObject3D();
        mainScene.add(voxelObject3D);
        mainCamera.lookAt( voxelObject3D.position );
    }
}
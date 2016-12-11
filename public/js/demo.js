/* jshint esversion:6 */

const TARGET_REFRESH_RATE = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_REFRESH_RATE;

const RASTER_REFRESH_RATE = 12;
const RASTER_FRAMETIME_LIMIT = 1000 / RASTER_REFRESH_RATE;

const EXPECT_DELTA = 4;                     // Expect work to take about 2ms
const SPARE_COMPUTE_TIME = TARGET_FRAME_TIME - EXPECT_DELTA;
const WORKQUEUE_OVERFLOW_SIZE = 16;

// Load balancer
var max_delta = 0;
// var workDone = 0;

// Program Loop
var prevFrameTime = 0;

// Program Logic
var sceneRotation = {x:0, y:0, z:0};
var raster_time_counter = 0;

// Rasterization Renderer
var renderingArea;
var scene;
var sxRenderer;

// Voxel Renderer (Main Rendering)
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
        mainCamera = new 
            // THREE.OrthographicCamera(-1,1,-1,1,-10,10);
            THREE.PerspectiveCamera( 45, 1, 1, 1000 );
        mainCamera.position.z = 4;
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
            var light = new THREE.PointLight( 0xff0000, 1, 100 );
            light.position.set( 10, 10, 10 );
            scene.add( light );
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
        /// All Program Logic
        programLogic(frameTime);
        // var ProgramLogicTime = performance.now();        /// For performance monitoring
        /// Main Rendering
        mainRenderer.render( mainScene, mainCamera );
        // var RenderTime = performance.now();              /// For performance monitoring

        // if(workDone>0) console.log('work Done', workDone);
        // if(workQueue.length>0) console.log('work Queue', workQueue.length);
        // workDone = 0;                                    /// For WorkQueue monitoring
       
        // WorkQueue execution
        var timeBefore = performance.now();
        var timeLeft = SPARE_COMPUTE_TIME - (timeBefore - time);
        while(workQueue.length > WORKQUEUE_OVERFLOW_SIZE || timeLeft > 0){
            if(workQueue.length > 0){
                var work = workQueue.execute();
                var delta = performance.now() - timeBefore;
                if(delta > timeLeft+EXPECT_DELTA && delta > EXPECT_DELTA)
                    console.log("WorkQueue cause stutter", delta, work);
                // if(delta > max_delta){
                //     max_delta = delta;
                //     console.log("Delta", delta, work);
                // }else{
                //     max_delta -= 0.001;
                // }
                // workDone++;                              /// For WorkQueue monitoring
            }
            timeBefore = performance.now();
            timeLeft = SPARE_COMPUTE_TIME - (timeBefore - time);
        }
        // var SpareComputeTime = performance.now();
        // console.log(
        //     "T",
        //     ProgramLogicTime - time,
        //     RenderTime - time,
        //     SpareComputeTime - RenderTime,
        //     "Total",
        //     SpareComputeTime-time);                      /// For performance monitoring
    }
}

function programLogic(frameTime){
    raster_time_counter += frameTime;

    if(raster_time_counter > RASTER_FRAMETIME_LIMIT){ // time to preform rasterization
        raster_time_counter = 0;
        // Add work to workQueue
        workQueue.add(lowPriorityGameLogic);
        workQueue.add(removeOldVoxelSubScene);
        for(let c=0; c<6; c++){
            workQueue.add(renderSixAxis, [c]);
            workQueue.add(projectRenderedVoxelToSS, [c]);
        }
        // for(let c=0; c<6; c++){
        // }
        workQueue.add(replaceOldVoxelSubScene);
    }

    var voxelObject3D = voxelSubScene[currentVR].getThreeJsObject3D();
    sceneRotation.x += 0.01;
    // sceneRotation.y += 0.01;
    voxelObject3D.rotation.x = sceneRotation.x;
    voxelObject3D.rotation.y = sceneRotation.y;
    // Work in queue

    function lowPriorityGameLogic(){
        scene.rotation.y += Math.PI/96;
        sxRenderer.renderPreview();
    }
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
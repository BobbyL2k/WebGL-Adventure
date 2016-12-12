/* jshint esversion:6 */

const TARGET_REFRESH_RATE = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_REFRESH_RATE;

const RASTER_REFRESH_RATE = 12;
const RASTER_FRAMETIME_LIMIT = 1000 / RASTER_REFRESH_RATE;

const EXPECT_DELTA = 4;                     // Expect work to take about 2ms
const SPARE_COMPUTE_TIME = TARGET_FRAME_TIME - EXPECT_DELTA;

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
var dynamicScene;
var sxRendererArray;

// Voxel Renderer (Main Rendering)
var dynamicVoxelScene;
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
        size: 30,
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels

    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas
    sxRendererArray.forEach(function(sxRenderer){
        sxRenderer.renderAll();
    });

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();

        // TODO fix magic numbers
        mainCamera = new 
            // THREE.OrthographicCamera(-1,1,-1,1,-10,10);
            THREE.PerspectiveCamera( 45, 1, 1, 1000 );
        mainCamera.position.z = 4;
        mainScene = new THREE.Scene();                  /// This is a placeholder scene for first frame rendering
                                                        /// It will be replace by one of dynamicVoxelScene
        dynamicVoxelScene = [new VoxelSceneManager(), new VoxelSceneManager()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        mainRenderer.setSize( 500, 500 );
        container[0].appendChild(mainRenderer.domElement);

        dynamicScene = getDynamicScene(); // setting global var
        sxRendererArray = getSxRendererArray(dynamicScene);
        for(var c=0; c<sxRendererArray.length; c++){
            sxRendererArray[c].addDomTo(container[c+1]);
        }
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
        function getDynamicScene(){
            var dynamicScene = [];
            var geometry = new
                THREE.TeapotBufferGeometry(6);
                // THREE.SphereGeometry( 5, 10, 10 );
                // THREE.BoxBufferGeometry( 4, 4, 4 );
            var material = new THREE.ShaderMaterial({
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
            var mesh = new THREE.Mesh( geometry, material );
            dynamicScene.push(mesh);
            mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 6, 6, 6 ), material );
            dynamicScene.push(mesh);
            return dynamicScene;
        }
        function getMainRenderer(){
            return new THREE.WebGLRenderer();
        }
        function getSxRendererArray(obj3dScene){
            var sxRendererArray = [];
            for(var c=0; c<obj3dScene.length; c++){
                renderingArea.center.x = obj3dScene[c].position.x;
                renderingArea.center.y = obj3dScene[c].position.y;
                renderingArea.center.z = obj3dScene[c].position.z;
                sxRendererArray.push(new SxRenderer(obj3dScene[c], renderingArea));
            }
            return sxRendererArray;
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
        programLogic(frameTime, time);
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
        while(workQueue.isOverflow() || timeLeft > 0){
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
        //     RenderTime - ProgramLogicTime,
        //     SpareComputeTime - RenderTime,
        //     "Total",
        //     SpareComputeTime-time);                      /// For performance monitoring
    }
}

function programLogic(frameTime, time){
    raster_time_counter += frameTime;

    mainCamera.position.y = 1*Math.sin(time/1000);
    mainCamera.position.x = 1*Math.cos(time/1000);
    dynamicScene[0].position.x = 1*Math.sin(performance.now()/1000);
    dynamicScene[0].position.y = 1*Math.cos(performance.now()/1000);
    mainCamera.lookAt(dynamicScene[1].position);

    if(raster_time_counter > RASTER_FRAMETIME_LIMIT){ // time to preform rasterization
        raster_time_counter = 0;
        // Add work to workQueue
        workQueue.add(lowPriorityGameLogic, [frameTime, time]);
        workQueue.add(removeOldVoxelSubScene);
        for(let objIndex=0; objIndex<dynamicScene.length; objIndex++){
            for(let angle=0; angle<6; angle++){
                workQueue.add(renderSixAxis, [objIndex, angle]);
                workQueue.add(projectRenderedVoxelToSS, [objIndex, angle]);
            }
            workQueue.add(updateVoxelPosition, [objIndex]);
        }
        workQueue.add(replaceOldVoxelSubScene);
        workQueue.setComplete();
    }

    /// Simulate Camera rotation -- need to change to actual Camera rotation
    // var voxelObject3D = voxelSubScene[currentVR].getThreeJsObject3D();
    // sceneRotation.x += 0.01;
    // // sceneRotation.y += 0.01;
    // voxelObject3D.rotation.x = sceneRotation.x;
    // voxelObject3D.rotation.y = sceneRotation.y;
    // Work in queue

    function lowPriorityGameLogic(){
        dynamicScene[0].rotation.y += Math.PI/96;
        dynamicScene[1].rotation.z -= Math.PI/96;
        sxRendererArray[0].updateRenderingArea({
            center:{
                x: dynamicScene[0].position.x,
                y: dynamicScene[0].position.y,
            }});
        sxRendererArray.forEach(function(sxRenderer){
            sxRenderer.renderPreview();
        });
    }
    function removeOldVoxelSubScene(){
        dynamicVoxelScene[(currentVR+1)%2].clear();
    }
    function renderSixAxis(objIndex, angle){
        sxRendererArray[objIndex].renderAngle(angle);
    }
    function projectRenderedVoxelToSS(objIndex, angle){
        dynamicVoxelScene[(currentVR+1)%2].addVoxel(objIndex, sxRendererArray[objIndex].floatBuffer[angle], angle);
    }
    function updateVoxelPosition(objIndex){
        // console.log("EIEI");
        var voxelPosition = sxRendererArray[objIndex].getPosition();
        var voxel = dynamicVoxelScene[(currentVR+1)%2].getThreeJsObject3D(objIndex);
        voxel.position.x = voxelPosition.x;
        voxel.position.y = voxelPosition.y;
        voxel.position.z = voxelPosition.z;
    }
    function replaceOldVoxelSubScene(){
        currentVR = (currentVR+1)%2;
        mainScene = dynamicVoxelScene[currentVR].getThreeJsScene();
    }
}
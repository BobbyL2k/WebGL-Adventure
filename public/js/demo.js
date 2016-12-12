/* jshint esversion:6 */

const TARGET_REFRESH_RATE = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_REFRESH_RATE;

const RASTER_REFRESH_RATE = 48;
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
var dynamicObjectArray;
var sxRendererArray;

// Voxel Renderer (Main Rendering)
var dynamicVoxelScene;
var mainScene;
var mainCamera;
var mainRenderer;
var currentVR;
// Work queue
var workQueue;

// Material Holder
var materialsHolder;


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
    materialsHolder = new MaterialsHolder();
    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();

        // TODO fix magic numbers
        mainCamera = new THREE.PerspectiveCamera( 45, 1, 1, 1000 );
        // THREE.OrthographicCamera(-1,1,-1,1,-10,10);
        mainCamera.position.z = 8;
        mainScene = new THREE.Scene();                  /// This is a placeholder scene for first frame rendering
                                                        /// It will be replace by one of dynamicVoxelScene
        dynamicVoxelScene = [new THREE.Object3D(), new THREE.Object3D()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        mainRenderer.setSize( 500, 500 );
        container[0].appendChild(mainRenderer.domElement);

        dynamicObjectArray = getDynamicObjectArray(); // setting global var
        for(var c=0; c<dynamicObjectArray.length; c++){
            dynamicVoxelScene[0].add(dynamicObjectArray[c].voxelObject[0]);
            dynamicVoxelScene[1].add(dynamicObjectArray[c].voxelObject[1]);
            dynamicObjectArray[c].sxRenderer.addDomTo(container[c+1]);
        }
        currentVR = 0;

        // Testing Area
        mainRenderer.shadowMap.enabled = true;
		mainRenderer.shadowMap.type = THREE.PCFShadowMap;

        var ambient = new THREE.AmbientLight(0x090909);
        mainScene.add( ambient );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		// directionalLight.position.set( 2, 1.2, 10 ).normalize();
		// mainScene.add( directionalLight );
		directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		directionalLight.position.set( 10, -10, 1 ).normalize();
        directionalLight.castShadow = true;
	    directionalLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 10, -10 ,1 ) );
	    directionalLight.shadow.bias = 0.0001;
	    directionalLight.shadow.mapSize.width = 2048;
	    directionalLight.shadow.mapSize.height = 1024;
		mainScene.add( directionalLight );

        var groundGeo = new THREE.BoxGeometry(30,0.01,40);
        var gorundMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
        var groundMesh = new THREE.Mesh(groundGeo,groundMesh);
        groundMesh.position.y = -1;
        // mainScene.add(groundMesh);
		//var pointLight = new THREE.PointLight( 0xffaa00, 2 );
		//pointLight.position.set( 2000, 1200, 10000 );
		//mainScene.add( pointLight );

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
        function getDynamicObjectArray(){
            var dynamicScene = [];
            var teapotSize = 6;
            var geometry = new THREE.TeapotBufferGeometry(teapotSize);
            var material = new THREE.ShaderMaterial({
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
            var dynamicObject = new DynamicObject( new THREE.Mesh( geometry, material ), {size:teapotSize*4} );
            dynamicScene.push(dynamicObject);
            dynamicObject = new DynamicObject( 
                new THREE.Mesh( 
                    new THREE.BoxBufferGeometry( 8, 8, 8 ), 
                    material ), 
                {size:12} );
            dynamicScene.push(dynamicObject);
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
                // var delta = performance.now() - timeBefore;
                // if(delta > timeLeft+EXPECT_DELTA && delta > EXPECT_DELTA)
                //     console.log("WorkQueue cause stutter", delta, work);
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

    // mainCamera.position.y = 1*Math.sin(time/1000);
    // mainCamera.position.x = 1*Math.cos(time/1000);
    dynamicObjectArray[0].position.x = 2*Math.sin(time/1000);
    dynamicObjectArray[0].position.y = 2*Math.cos(time/1000);
    dynamicObjectArray[1].rotation.x = time/500;
    // dynamicObjectArray[1].rotation.z = time/500;
    mainCamera.lookAt(dynamicObjectArray[0].position);

    if(raster_time_counter > RASTER_FRAMETIME_LIMIT){ // time to preform rasterization
        raster_time_counter = 0;
        // Add work to workQueue
        workQueue.add(lowPriorityGameLogic, [frameTime, time]);
        for(let objIndex=0; objIndex<dynamicObjectArray.length; objIndex++){
            workQueue.add(removeOldVoxelSubScene, [objIndex]);
            for(let angle=0; angle<6; angle++){
                workQueue.add(renderSixAxis, [objIndex, angle]);
                workQueue.add(projectRenderedVoxelToSS, [objIndex, angle]);
            }
            workQueue.add(updateVoxel, [objIndex]);
        }
        workQueue.add(replaceOldVoxelSubScene);
        workQueue.setComplete();
    }
    // Work in queue

    function lowPriorityGameLogic(){
        dynamicObjectArray.forEach(function(dynamicObject){
            dynamicObject.sampleObjectState();
            dynamicObject.sxRenderer.renderPreview();
        });
    }
    function removeOldVoxelSubScene(objIndex){
        dynamicObjectArray[objIndex].clearVoxelFromBuffer((currentVR+1)%2);
    }
    function renderSixAxis(objIndex, angle){
        dynamicObjectArray[objIndex].projectObjectToBuffer(angle);
    }
    function projectRenderedVoxelToSS(objIndex, angle){
        dynamicObjectArray[objIndex].convertBufferToVoxel(angle, (currentVR+1)%2, materialsHolder);
    }
    function updateVoxel(objIndex){
        dynamicObjectArray[objIndex].packageVoxel((currentVR+1)%2);
    }
    function replaceOldVoxelSubScene(){
        // console.log("FC");
        mainScene.remove(dynamicVoxelScene[currentVR]);
        currentVR = (currentVR+1)%2;
        mainScene.add(dynamicVoxelScene[currentVR]);
    }
}
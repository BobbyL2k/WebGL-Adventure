/* jshint esversion:6 */

const viewportWidth = 1000;
const viewportHeight = 700;

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
var dynamicObjectArray;
var sxRendererArray;
var staticObject;

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
// testing
var groundMesh;
var pointLight;
var pointLightMesh;
var groundMesh;

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
        size: 31,
    };
    // Rendering from +-5 x y and z
    // Area of interest is 10*10*10 = 1000 voxels
    materialsHolder = new MaterialsHolder();
    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();

        // TODO fix magic numbers
        mainCamera = new THREE.PerspectiveCamera( 45, viewportWidth/viewportHeight, 1, 1000 );
        // // // // // // mainCamera = new THREE.OrthographicCamera(-125,125,-125,125,-125,125);
        mainCamera.position.z = 50;
        mainCamera.position.y = 30;
        mainCamera.lookAt({x:0,y:0,z:0});
        mainScene = new THREE.Scene();                  /// This is a placeholder scene for first frame rendering
                                                        /// It will be replace by one of dynamicVoxelScene
        dynamicVoxelScene = [new THREE.Object3D(), new THREE.Object3D()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        container[0].appendChild(mainRenderer.domElement);

        staticObject = getStaticObject();
        staticObject.sxRenderer.addDomTo(container[1]);
        mainScene.add(staticObject.voxelObject);
        dynamicObjectArray = getDynamicObjectArray(); // setting global var
        for(var c=0; c<dynamicObjectArray.length; c++){
            dynamicVoxelScene[0].add(dynamicObjectArray[c].voxelObject[0]);
            dynamicVoxelScene[1].add(dynamicObjectArray[c].voxelObject[1]);
            dynamicObjectArray[c].sxRenderer.addDomTo(container[c+2]);
        }
        currentVR = 0;

        {// Testing Area

            var ambient = new THREE.AmbientLight(0xCCCCCC);
            mainScene.add( ambient );

            // var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            // directionalLight.position.set( 2, 1.2, 10 ).normalize();
            // mainScene.add( directionalLight );
            // directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            // directionalLight.position.set( 10, -10, 10 ).normalize();
            // mainScene.add( directionalLight );

            pointLight = new THREE.PointLight( 0xffaa00, 2 ,1000);
            pointLight.position.set( 100,100,100 );
            pointLight.castShadow = true;
            //pointLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 30, 1, 1, 200 ) );
            pointLight.shadow.camera.fov = 90;
            pointLight.shadow.camera.near = 1;
            pointLight.shadow.camera.far = 250;
            pointLight.shadow.bias = 0.05;
            pointLight.shadow.mapSize.width = 4096;
            pointLight.shadow.mapSize.height = 4096;
            
            mainScene.add( pointLight );

            // pointLightMesh = new THREE.Object3D();
            // pointLightMesh.add(new THREE.Mesh( new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial( {color: 0xff0000} )));
            // mainScene.add( pointLightMesh );

            var groundGeo = new THREE.BoxGeometry(3000,0.01,3000);
            var groundMaterial = new THREE.MeshPhongMaterial( {
                color: 0xa0adaf,
                shininess: 150,
                specular: 0xffffff,
                shading: THREE.SmoothShading
            } );
            groundMesh = new THREE.Mesh(groundGeo,groundMaterial);
            groundMesh.position.y = -10;
            groundMesh.castShadow = false;
            groundMesh.receiveShadow = true;
            mainScene.add(groundMesh);

            // gorundMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
            // groundMesh = new THREE.Mesh(groundGeo,groundMesh);
            // groundMesh.position.y = -10;
            // groundMesh.castShadow = true;
            // groundMesh.receiveShadow = true;
            // mainScene.add(groundMesh);

            var geometry = new THREE.TeapotBufferGeometry(6);
            var teaPot = new THREE.Mesh(geometry,materialsHolder.getMaterial(1));
            teaPot.position.x = 10;
            teaPot.castShadow = true;
            teaPot.receiveShadow = true;

            // var teaPotShadow = new THREE.ShadowMesh( teaPot );
            // mainScene.add( teaPotShadow );

            // dynamicObjectArray[0].voxelObject[1].add(teaPot);
            //mainScene.scale.set(1,-1,1);
        }

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
            //var geometry = new THREE.TeapotBufferGeometry(teapotSize,teapotSize,teapotSize,);
            var material = new THREE.ShaderMaterial({
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
            var dynamicObject = new DynamicObject( new THREE.Mesh( geometry, material ), {size:teapotSize*4} );
            dynamicObject.position.y = 10;
            dynamicScene.push(dynamicObject);
            dynamicObject = new DynamicObject( 
                new THREE.Mesh( 
                    new THREE.BoxBufferGeometry( 8, 8, 8 ), 
                    material ), 
                {size:12} );
            // dynamicScene.push(dynamicObject);
            return dynamicScene;
        }
        function getStaticObject(){
            var worldObject = getStaticWorld();
            var staticObject = new StaticObject(worldObject, {size:40});
            // staticObject.projectObjectToVoxel(materialsHolder);
            return staticObject;
        }
        function getStaticWorld(){
            var world = new THREE.Object3D();
            var material = new THREE.ShaderMaterial({
                side:THREE.DoubleSide,
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
            var floorGeo = new
                // THREE.BoxGeometry(300,1,300);
                THREE.TeapotBufferGeometry(5);
            var floorMesh = new THREE.Mesh(floorGeo, material);
            world.add(floorMesh);
            return world;
        }
        function getMainRenderer(){
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( viewportWidth, viewportHeight );
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.BasicShadowMap;
            return renderer;
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

        // if(workDone>0)
        //     console.log('work Done', workDone);
        // if(workQueue.length>0)
        //     console.log('work Queue', workQueue.length);
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

    pointLight.position.y = 200;
    // pointLight.position.z = 50*Math.sin(time/1000);
    // pointLight.position.x = 50*Math.cos(time/1000);
    // pointLightMesh.position = pointLight.position;
    mainCamera.position.z = 50*Math.sin(time/1000);
    mainCamera.position.x = 50*Math.cos(time/1000);
    mainCamera.lookAt(mainScene.position);
    // dynamicObjectArray[0].position.x = 2*Math.sin(time/10000);
    // dynamicObjectArray[0].position.y = 20;//~~(time/1000)%10;
    // groundMesh.position.y = (time+10)%100;
    // dynamicObjectArray[1].rotation.z = time/2000;
    // dynamicObjectArray[1].rotation.y = time/4000;
    // dynamicObjectArray[1].position.x = 15*Math.sin(time/10000);
    // dynamicObjectArray[1].position.y = 15*Math.cos(time/10000);
    // mainCamera.lookAt(dynamicObjectArray[0].position);

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
            dynamicObject.sxRenderer.renderPreview(Math.floor(performance.now()/1000)%6);
            // staticObject.sxRenderer.renderPreview( Math.floor(performance.now()/500) % (staticObject.sxRenderer.floatBuffer.length));

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
/* jshint esversion:6 */

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

const TARGET_REFRESH_RATE = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_REFRESH_RATE;

const RASTER_REFRESH_RATE = 6;
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
var dummyCamera;
// Work queue
var workQueue;

// Material Holder
var materialsHolder;
// testing
var groundMesh;
var pointLight;
var pointLightMesh;
var groundMesh;
var pointLightShadowMapViewer;
var shadowMapViewerRenderer;
var teapot;
var cube;
var cubeSize = 10;
var cubeObj;
var femaleObject;
var oakObject;

// moving object;
var sphere;
var pyramid;

//controls
var mouseControl;
var positionControl;
var clock;
var manager;
var loader;

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
    // For loading .obj files
    clock = new THREE.Clock();
    manager = new THREE.LoadingManager();
    loader = new THREE.OBJLoader( manager );
    setUpGlCanvas(); // sxRenderer is set in setUpGlCanvas

    return;

    function setUpGlCanvas(){
        var container = getDomContainer();

        // TODO fix magic numbers
        mainCamera = new THREE.PerspectiveCamera( 45, viewportWidth/viewportHeight, 1, 1000 );
        dummyCamera = new THREE.PerspectiveCamera( 45, viewportWidth/viewportHeight, 1, 1000 );
        // // // // // // mainCamera = new THREE.OrthographicCamera(-125,125,-125,125,-125,125);
        mainCamera.position.z =  90;
        mainCamera.position.y =  35;
        mainCamera.position.x = -51;
        mainCamera.lookAt({x:0,y:0,z:0});
        mainScene = new THREE.Scene();                  /// This is a placeholder scene for first frame rendering
                                                        /// It will be replace by one of dynamicVoxelScene
        dynamicVoxelScene = [new THREE.Object3D(), new THREE.Object3D()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        container[0].appendChild(mainRenderer.domElement);


        
        mainScene.add(getStaticObject());
        // staticObject.sxRenderer.addDomTo(container[1]);
        dynamicObjectArray = getDynamicObjectArray(); // setting global var
        // console.log(dynamicObjectArray.length);
        for(var c=0; c<dynamicObjectArray.length; c++){
            dynamicVoxelScene[0].add(dynamicObjectArray[c].voxelObject[0]);
            dynamicVoxelScene[1].add(dynamicObjectArray[c].voxelObject[1]);
            dynamicObjectArray[c].sxRenderer.addDomTo(container[c+2]);
        }
        currentVR = 0;

        {// Testing Area

            var ambient = new THREE.AmbientLight(0xCCCCCC);
            mainScene.add( ambient );

            positionControl = new THREE.FirstPersonControls( mainCamera );
			positionControl.movementSpeed = 10;
			positionControl.lookSpeed = 0.125;
			positionControl.lookVertical = true;

            pointLight = new THREE.PointLight( 0xffffff, 1, 200);
            pointLight.position.set( 0,50,0 );
            pointLight.castShadow = true;
            pointLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 90, 1, 1, 200 ) );
            pointLight.shadow.bias = 0.2;
            pointLight.shadow.mapSize.width = 1024*2;
            pointLight.shadow.mapSize.height = 1024*2;

            mainScene.add( pointLight );

            var groundGeo = new THREE.BoxGeometry(3000,0.01,3000);
            var groundMaterial = new THREE.MeshPhongMaterial( {
                color: 0x0c641d,
                shininess: 0,
                specular: 0x000000,
                shading: THREE.SmoothShading,
                wireframe: false,
            } );
            groundMesh = new THREE.Mesh(groundGeo,groundMaterial);
            groundMesh.castShadow = true;
            groundMesh.receiveShadow = true;
            mainScene.add(groundMesh);

            pointLightShadowMapViewer = new THREE.ShadowMapViewer( pointLight );
		    pointLightShadowMapViewer.position.x = 0;
		    pointLightShadowMapViewer.position.y = 0;
		    pointLightShadowMapViewer.size.width = 500;
		    pointLightShadowMapViewer.size.height = 500;
		    pointLightShadowMapViewer.update();

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
                document.getElementById('Debug'),
            ];
        }
        function getDynamicObjectArray(){
            var dynamicScene = [];
            var teapotSize = 3;
            var sphereSize = 3;
            var geometry = new THREE.TeapotBufferGeometry(teapotSize);
            var dynamicObject;

            dynamicObject = new FlippingCube( cubeSize , 4);
            dynamicScene.push(dynamicObject);
            
            geometry = new THREE.SphereBufferGeometry( sphereSize);
            sphere = new THREE.Mesh( geometry, materialsHolder.voxelMaterials[3] );
            dynamicObject = new DynamicObject( sphere , {size:Math.ceil(sphereSize*2)} );
            dynamicObject.position.y = sphereSize;
            dynamicObject.position.x = -20;
            dynamicScene.push(dynamicObject);

            var coneRadius = 6;
            var coneHeight = coneRadius * 2;
            var coneGeometry = new THREE.ConeBufferGeometry( coneRadius, coneHeight, 4 );
            var coneMaterial = materialsHolder.voxelMaterials[2];
            var cone = new THREE.Mesh( coneGeometry, coneMaterial );
            pyramid = cone;
            cone.rotation.y = Math.PI/4;

            dynamicObject = new DynamicObject( cone , {size:Math.ceil(coneRadius*2)} );
            dynamicScene.push(dynamicObject);
            dynamicObject.position.y = coneHeight / 2;
            dynamicObject.position.x = -40;
            dynamicObject.rotation.y += Math.PI/2;
            dynamicScene.push(dynamicObject);

            dynamicObject = new DynamicObject(
                new THREE.Mesh(
                    new THREE.BoxBufferGeometry( 8, 8, 8 ),
                    materialsHolder.getMaterial(2)),
                {size:6} );
            // dynamicScene.push(dynamicObject);
            return dynamicScene;
        }
        function loadObjectFile(filePath, material, size, translate = {x:0,y:0,z:0}){
            loader.load( filePath , function ( object ) {
                object.traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        child.material = material;
                    }
                } );
                var translatedObject = new THREE.Object3D();
                object.position.x = translate.x;
                object.position.y = translate.y;
                object.position.z = translate.z;
                object.scale.set(3,3,3);
                translatedObject.add(object);
                var dynamicObject = new DynamicObject(translatedObject,{size:size});
                dynamicObjectArray.push(dynamicObject);
                // MUST! add manually
                var pushIndex = dynamicObjectArray.length-1;
                dynamicVoxelScene[0].add(dynamicObjectArray[pushIndex].voxelObject[0]);
                dynamicVoxelScene[1].add(dynamicObjectArray[pushIndex].voxelObject[1]);
                // dynamicObjectArray[c].sxRenderer.addDomTo(container[3]);
                return object;
            }, function(p){}, function(e){console.log(e);} );
        }
        function getStaticObject(){
            var staticWorld = new THREE.Object3D();
            var teapotSize = 5;
            var teapotGeometry = new THREE.TeapotBufferGeometry(teapotSize);
            var staticObject;
            // Utah jar
            staticObject = new StaticObject( new THREE.Mesh(teapotGeometry,materialsHolder.voxelMaterials[1]) , {size:Math.ceil(teapotSize*3.7)}  );
            staticObject.projectObjectToVoxel(materialsHolder);
            staticObject.voxelObject.position.y = 5;
            staticObject.voxelObject.position.z = 20;
            staticObject.voxelObject.position.x = 20;
            staticWorld.add(staticObject.voxelObject);

            return staticWorld;
        }
        function getStaticWorld(){
            var world = new THREE.Object3D();
            var material = new THREE.ShaderMaterial({
                side:THREE.DoubleSide,
                uniforms: {
                    materialId: { value: 2 },
                },
                vertexShader: document.querySelector('#post-vert').textContent.trim(),
                fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            });
            var floorGeo = new
                // THREE.BoxGeometry(300,1,300);
                THREE.TeapotBufferGeometry(5);
            var floorMesh = new THREE.Mesh(floorGeo, material);
            floorMesh.position.y=5;
            floorMesh.position.x=-5;
            floorMesh.position.z=-5;
            world.add(floorMesh);
            return world;
        }
        function getMainRenderer(){
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( viewportWidth, viewportHeight );
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.BasicShadowMap;
            renderer.setClearColor(0x2194ce);
            // renderer.antialias = true;
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
        positionControl.update( clock.getDelta() );
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
        // shadowMapViewerRenderer.render(new THREE.Scene(),mainCamera);
        // pointLightShadowMapViewer.render( shadowMapViewerRenderer );
        // pointLightShadowMapViewer.render( mainRenderer );
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
    var lightOrbitRadius = 50;
    pointLight.position.z = lightOrbitRadius * Math.sin(time/10000);
    pointLight.position.x = lightOrbitRadius * Math.cos(time/10000);
    var scale = ((time/2000)%10)*0.5;
    dynamicObjectArray[0].animate(time);
    dynamicObjectArray[1].rotation.x = time / 2000;
    dynamicObjectArray[1].rotation.z = time / 2000;
    dynamicObjectArray[1].position.x = lightOrbitRadius * Math.sin(time/3000);
    dynamicObjectArray[1].position.z = lightOrbitRadius * Math.cos(time/3000);
    
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
            // dynamicObject.sxRenderer.renderPreview(Math.floor(performance.now()/1000)%6);
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
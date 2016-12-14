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
        mainCamera.position.y =  34;
        mainCamera.position.x = -51;
        mainCamera.lookAt({x:0,y:0,z:0});
        mainScene = new THREE.Scene();                  /// This is a placeholder scene for first frame rendering
                                                        /// It will be replace by one of dynamicVoxelScene
        dynamicVoxelScene = [new THREE.Object3D(), new THREE.Object3D()];
        mainRenderer = getMainRenderer();
        // TODO fix magic numbers
        container[0].appendChild(mainRenderer.domElement);


        
        // mainScene.add(getStaticObject());
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


            // mouseControl =  new THREE.OrbitControls(mainCamera, mainRenderer.domElement);
            // mouseControl.target.set(0,0,0);
            // mouseControl.update();
            positionControl = new THREE.FirstPersonControls( mainCamera );
			positionControl.movementSpeed = 10;
			positionControl.lookSpeed = 0.125;
			positionControl.lookVertical = true;
            // var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            // directionalLight.position.set( 2, 1.2, 10 ).normalize();
            // mainScene.add( directionalLight );
            // directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            // directionalLight.position.set( 10, -10, 10 ).normalize();
            // mainScene.add( directionalLight );

            pointLight = new THREE.PointLight( 0xffffff, 1, 200);
            pointLight.position.set( 0,50,0 );
            pointLight.castShadow = true;
            pointLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 90, 1, 1, 200 ) );
            // pointLight.shadow.camera.fov = 90;
            // pointLight.shadow.camera.near = 1;
            // pointLight.shadow.camera.far = 1000;
            // pointLight.shadow.camera.lookAt(0,0,0);
            // pointLight.target = dynamicObjectArray[0]._real_object3d;
            // console.log(pointLight.shadow.camera);
            // pointLight.shadow.camera.right = 50;
			// pointLight.shadow.camera.left = - 50;
			// pointLight.shadow.camera.top	= 50;
			// pointLight.shadow.camera.bottom = - 50;
            pointLight.shadow.bias = 0.2;
            pointLight.shadow.mapSize.width = 1024*2;
            pointLight.shadow.mapSize.height = 1024*2;

            mainScene.add( pointLight );

            // pointLightMesh = new THREE.Object3D();
            // pointLightMesh.add(new THREE.Mesh( new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial( {color: 0xff0000} )));
            // mainScene.add( pointLightMesh );

            var groundGeo = new THREE.BoxGeometry(3000,0.01,3000);
            var groundMaterial = new THREE.MeshPhongMaterial( {
                color: 0x0c641d,
                shininess: 0,
                specular: 0x000000,
                shading: THREE.SmoothShading,
                wireframe: false,
            } );
            groundMesh = new THREE.Mesh(groundGeo,groundMaterial);
            // groundMesh.position.y = 10;
            groundMesh.castShadow = true;
            groundMesh.receiveShadow = true;
            mainScene.add(groundMesh);


            // var geometry = new THREE.TeapotBufferGeometry(3);
            // teapot = new THREE.Mesh(geometry,materialsHolder.getMaterial(1));
            // teapot.position.x = 10;
            // teapot.position.y = 10;
            // teapot.castShadow = true;
            // teapot.receiveShadow = true;

            // pointLightShadowMapViewer = new THREE.ShadowMapViewer( pointLight );
		    // pointLightShadowMapViewer.position.x = 0;
		    // pointLightShadowMapViewer.position.y = 0;
		    // pointLightShadowMapViewer.size.width = 500;
		    // pointLightShadowMapViewer.size.height = 500;
		    // pointLightShadowMapViewer.update();
            femaleObject = loadStaticObjectFile('js/objects/female02.obj',materialsHolder.voxelMaterials[2], 200);
            // shadowMapViewerRenderer = new THREE.WebGLRenderer();
            // shadowMapViewerRenderer.setSize( 300, 300 );
            // shadowMapViewerRenderer.shadowMap.enabled = true;
            // shadowMapViewerRenderer.shadowMap.type = THREE.BasicShadowMap;
            // container[6].appendChild(shadowMapViewerRenderer.domElement);
            // console.log(shadowMapViewerRenderer.domElement);
            // mainScene.add( new THREE.CameraHelper( pointLight.shadow.camera ) );


            // mainScene.add(teapot);
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
            // var teapotSize = 3;
            // var sphereSize = 3;
            // var geometry = new THREE.TeapotBufferGeometry(teapotSize);
            // var dynamicObject;
            //var geometry = new THREE.TeapotBufferGeometry(teapotSize,teapotSize,teapotSize,);
            // var material = new THREE.ShaderMaterial({
            //     vertexShader: document.querySelector('#post-vert').textContent.trim(),
            //     fragmentShader: document.querySelector('#post-frag').textContent.trim(),
            // });
            // dynamicObject = new DynamicObject( new THREE.Mesh( geometry, materialsHolder.voxelMaterials[1] ), {size:Math.ceil(teapotSize*3.7)} );
            // dynamicObject.position.y = teapotSize;
            // // dynamicScene.push(dynamicObject);

            // dynamicObject = new FlippingCube( cubeSize , 4);
            // dynamicScene.push(dynamicObject);
            
            // geometry = new THREE.SphereBufferGeometry( sphereSize);
            // sphere = new THREE.Mesh( geometry, materialsHolder.voxelMaterials[3] );
            // dynamicObject = new DynamicObject( sphere , {size:Math.ceil(sphereSize*2)} );
            // dynamicScene.push(dynamicObject);
            // dynamicObject.position.y = sphereSize;
            // dynamicObject.position.x = -20;
            // dynamicScene.push(dynamicObject);

            // var coneRadius = 6;
            // var coneHeight = coneRadius * 2;
            // var coneGeometry = new THREE.ConeBufferGeometry( coneRadius, coneHeight, 4 );
            // var coneMaterial = materialsHolder.voxelMaterials[2];
            // var cone = new THREE.Mesh( coneGeometry, coneMaterial );
            // pyramid = cone;
            // cone.position.y = coneHeight / 2;
            // cone.rotation.y = Math.PI/4;
            // mainScene.add( cone );

            // dynamicObject = new DynamicObject( cone , {size:Math.ceil(coneRadius*2)} );
            // dynamicScene.push(dynamicObject);
            // dynamicObject.position.y = coneHeight / 2;
            // dynamicObject.position.x = -40;
            // dynamicObject.rotation.y += Math.PI/2;
            // dynamicScene.push(dynamicObject);


            // dynamicObject = new DynamicObject( new THREE.Mesh( geometry, materialsHolder.voxelMaterials[1] ), {size:Math.ceil(teapotSize*3.7)} );
            // dynamicObject.position.y = teapotSize;
            // dynamicObject.position.z = -20;
            // dynamicScene.push(dynamicObject);

            // console.log(femaleObject);
            // femaleObject = loadObjectFile('js/objects/female02.obj',materialsHolder.voxelMaterials[2], 200);
            // // oakObject = loadObjectFile('js/objects/Large_Oak_Green_01.obj', materialsHolder.voxelMaterials[2], 30, {x:-1,y:0,z:1});
            // console.log(femaleObject);

            // dynamicObject = new DynamicObject(
            //     new THREE.Mesh(
            //         new THREE.BoxBufferGeometry( 8, 8, 8 ),
            //         materialsHolder.getMaterial(2)),
            //     {size:6} );
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
                object.scale.set(0.5,0.5,0.5);
                translatedObject.add(object);
                var dynamicObject = new DynamicObject(translatedObject,{size:size});
                dynamicObjectArray.push(dynamicObject);
                // MUST! add manually
                var pushIndex = dynamicObjectArray.length-1;
                dynamicVoxelScene[0].add(dynamicObjectArray[pushIndex].voxelObject[0]);
                dynamicVoxelScene[1].add(dynamicObjectArray[pushIndex].voxelObject[1]);
                dynamicObjectArray[c].sxRenderer.addDomTo(container[1]);
                return object;
            }, function(p){}, function(e){console.log(e);} );
        }
        function loadStaticObjectFile(filePath, material, size, translate = {x:0,y:0,z:0}){
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
                object.scale.set(0.5,0.5,0.5);
                translatedObject.add(object);
                var staticObject = new StaticObject(translatedObject,{size:size});
                staticObject.projectObjectToVoxel(materialsHolder);
                mainScene.add(staticObject.voxelObject);
                // dynamicObjectArray.push(dynamicObject);
                // MUST! add manually
                // var pushIndex = dynamicObjectArray.length-1;
                // dynamicVoxelScene[0].add(dynamicObjectArray[pushIndex].voxelObject[0]);
                // dynamicVoxelScene[1].add(dynamicObjectArray[pushIndex].voxelObject[1]);
                // dynamicObjectArray[c].sxRenderer.addDomTo(container[1]);
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
        // positionControl.update( clock.getDelta() );
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

    // pointLight.position.y = 200;
    var lightOrbitRadius = 50;
    pointLight.position.z = lightOrbitRadius * Math.sin(time/10000);
    pointLight.position.x = lightOrbitRadius * Math.cos(time/10000);
    // pointLightMesh.position = pointLight.position;
    mainCamera.position.z = 150*Math.sin(time/5000);
    mainCamera.position.x = 150*Math.cos(time/5000);
    console.log(mainCamera.position);
    mainCamera.lookAt({x:0,y:34,z:0});
    // cubeObj.rotation.z -= 0.01;
    // dynamicObjectArray[0]
    // mainCamera.lookAt(mainScene.position);
    // mainCamera.position.x += dummyCamera.position.x-mainCamera.position.x;
    // mainCamera.position.y += dummyCamera.position.y-mainCamera.position.y;
    // mainCamera.position.z += dummyCamera.position.z-mainCamera.position.z;
    // console.log(mainCamera.position + " " + dummyCamera.position);
    // var scale = ((time/2000)%10)*0.5;
    // dynamicObjectArray[1]._real_object3d.scale.set(scale,scale,scale);
    // femaleObject.scale.set(scale,scale,scale);
    // dynamicObjectArray[1].position.z = -10;
    // dynamicObjectArray[0].animate(time);
    // dynamicObjectArray[1].rotation.x = time / 2000;
    // dynamicObjectArray[1].rotation.z = time / 2000;
    // dynamicObjectArray[1].position.x = lightOrbitRadius * Math.sin(time/3000);
    // dynamicObjectArray[1].position.z = lightOrbitRadius * Math.cos(time/3000);
    // dynamicObjectArray[2].rotation.y += time/ 100000;
    // console.log(sphere.rotation);
    // dynamicObjectArray[0].rotation.cz = -(time/2000)%(Math.PI/2);
    // dynamicObjectArray[0].position.x = cubeSize*Math.floor((time/2000)/(Math.PI/2));
    // if(cubeObj.rotation.z <= -Math.PI/2){
    //     cubeObj.rotation.z = 0;
    //     console.log(cubeSize);
    // }
    // teapot.rotation.x += 0.1;
    // dynamicObjectArray[0].position.x = 2*Math.sin(time/10000);
    // dynamicObjectArray[0].position.y = 20;//~~(time/1000)%10;
    // groundMesh.position.y = (time+10)%100;
    // dynamicObjectArray[0].rotation.z = time/2000;
    // for(var c=0; c<3; c++){
    //     dynamicObjectArray[c].rotation.y = (time + 20000*c)/4000;
    //     dynamicObjectArray[c].position.x = 15*Math.sin((time + 20000*c)/10000);
    //     dynamicObjectArray[c].position.z = 15*Math.cos((time + 20000*c)/10000);
    // }
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
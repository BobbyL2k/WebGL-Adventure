/*jshint esversion: 6 */

const angle_count = 6;

var sxRenderer;
{
    class cl_sxRenderer{
        constructor(Object3D, renderingArea){
            const defaultRenderingArea = {
                center: {
                    x:0, y:0, z:0,
                },
                size: {
                    x:10,y:10,z:10,
                }
            };
            this._renderingArea = loadDefault(defaultRenderingArea, renderingArea);
            this.renderer = [];
            this.camera = [];
            this.scene = [];
            this.bufferTexture = [];
            this.floatBuffer = [];
            for(var angle=0; angle<angle_count; angle++){
                this.renderer.push(new THREE.WebGLRenderer());

                var camera = new THREE.OrthographicCamera();
                updateOrthoCamera(angle, camera, this._renderingArea);
                this.camera.push(camera);

                var scene = new THREE.Scene();
                var obj3D = new THREE.Object3D();
                obj3D.add(Object3D);
                setRotation(angle, obj3D);
                scene.add(obj3D.clone());
                this.scene.push(scene);

                this.bufferTexture.push(new THREE.WebGLRenderTarget(
                    getWidth (angle, this._renderingArea),
                    getHeight(angle, this._renderingArea),
                    {
                        format: THREE.RGBAFormat,
                        type: THREE.FloatType,
                    }));

                this.floatBuffer.push(new Float32Array(
                    getWidth (angle, this._renderingArea) *
                    getHeight(angle, this._renderingArea) *
                    4));

            }
        }
        addDomTo(domContainer){
            this.hasDomContainer = true;
            for(var c=0; c<angle_count; c++){
                domContainer[c].appendChild( this.renderer[c].domElement );
                this.renderer[c].domElement.style.width  = "100%";
                this.renderer[c].domElement.style.height = "100%";
            }
        }
        renderAll(){
            for(var c=0; c<angle_count; c++){
                if(this.hasDomContainer){
                    console.log('rendering to screen', c);
                    this.renderer[c].render( this.scene[c], this.camera[c] );
                }
                this.renderer[c].render( this.scene[c], this.camera[c], this.bufferTexture[c] );
                this.renderer[c].readRenderTargetPixels( this.bufferTexture[c], 0, 0,
                    getWidth(c, this._renderingArea), getHeight(c, this._renderingArea),
                    this.floatBuffer[c]);
            }
        }
        updateRenderingArea(renderingArea){
            this._renderingArea = loadDefault(this._renderingArea, renderingArea);
        }
    }
    sxRenderer = cl_sxRenderer;

    function updateOrthoCamera(angle, camera, renderingArea){
        switch(angle){
            case 0: // front
            case 2: // back
            camera.left   = -renderingArea.size.x/2;
            camera.right  =  renderingArea.size.x/2;
            camera.top    =  renderingArea.size.y/2;
            camera.bottom = -renderingArea.size.y/2;
            camera.near   = -renderingArea.size.z/2;
            camera.far    =  renderingArea.size.z/2;
            break;
            case 1: // left
            case 3: // right
            camera.left   = -renderingArea.size.z/2;
            camera.right  =  renderingArea.size.z/2;
            camera.top    =  renderingArea.size.y/2;
            camera.bottom = -renderingArea.size.y/2;
            camera.near   = -renderingArea.size.x/2;
            camera.far    =  renderingArea.size.x/2;
            break;
            case 4: // top
            case 5: // bottom
            camera.left   = -renderingArea.size.x/2;
            camera.right  =  renderingArea.size.x/2;
            camera.top    =  renderingArea.size.z/2;
            camera.bottom = -renderingArea.size.z/2;
            camera.near   = -renderingArea.size.y/2;
            camera.far    =  renderingArea.size.y/2;

        }
        camera.updateProjectionMatrix();
    }

    function setRotation(angle, obj3D){
        switch(angle){
            case 0:
            obj3D.rotation.x = 0;
            obj3D.rotation.y = 0;
            obj3D.rotation.z = 0;
            break;
            case 1:
            obj3D.rotation.x = 0;
            obj3D.rotation.y = Math.PI/2;
            obj3D.rotation.z = 0;
            break;
            case 2:
            obj3D.rotation.x = 0;
            obj3D.rotation.y = Math.PI;
            obj3D.rotation.z = 0;
            break;
            case 3:
            obj3D.rotation.x = 0;
            obj3D.rotation.y = -Math.PI/2;
            obj3D.rotation.z = 0;
            break;
            case 4:
            obj3D.rotation.x = Math.PI/2;
            obj3D.rotation.y = 0;
            obj3D.rotation.z = 0;
            break;
            case 5:
            obj3D.rotation.x = -Math.PI/2;
            obj3D.rotation.y = 0;
            obj3D.rotation.z = 0;
            break;
        }

    }

    function getWidth(angle, renderingArea){
        // front left back right top bottom
        switch(angle){
            case 0:
            return renderingArea.size.x;
            case 1:
            return renderingArea.size.z;
            case 2:
            return renderingArea.size.x;
            case 3:
            return renderingArea.size.z;
            case 4:
            return renderingArea.size.x;
            case 5:
            return renderingArea.size.x;
        }
    }

    function getHeight(angle, renderingArea){
        // front left back right top bottom
        switch(angle){
            case 0:
            return renderingArea.size.y;
            case 1:
            return renderingArea.size.y;
            case 2:
            return renderingArea.size.y;
            case 3:
            return renderingArea.size.y;
            case 4:
            return renderingArea.size.z;
            case 5:
            return renderingArea.size.z;
        }
    }

    function loadDefault(d_obj, obj){
        var result = {};
        for(var key in d_obj){
            if(typeof d_obj[key] !== 'object'){
                result[key] = obj[key]===undefined?d_obj[key]:obj[key];
            }else{
                result[key] = loadDefault(d_obj[key], obj[key]);
            }
        }
        return result;
    }
}
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
                size: 10
            };
            this._renderingArea = loadDefault(defaultRenderingArea, renderingArea);
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize( this._renderingArea.size, this._renderingArea.size );
            this.camera = new THREE.OrthographicCamera();
            updateOrthoCamera(this.camera, this._renderingArea);
            this.scene = new THREE.Scene();
            this.PosObject3D = Object3D;
            this.RotObject3D = new THREE.Object3D();
            this.RotObject3D.add(this.PosObject3D);
            this.scene.add(this.RotObject3D);
            this.bufferTexture = new THREE.WebGLRenderTarget(
                this._renderingArea.size,
                this._renderingArea.size,
                {
                    format: THREE.RGBAFormat,
                    type: THREE.FloatType,
                });
            this.floatBuffer = [];
            for(var angle=0; angle<angle_count; angle++){
                this.floatBuffer.push(new Float32Array(
                    this._renderingArea.size * this._renderingArea.size * 4
                    ));
            }
        }
        addDomTo(domContainer){
            this.hasDomContainer = true;
            domContainer[0].appendChild( this.renderer.domElement );
            this.renderer.domElement.style.width  = "100%";
            this.renderer.domElement.style.height = "100%";
        }
        renderAll(){
            if(this.hasDomContainer){ // For Preview
                if(this.c === undefined)
                    this.c = -1;
                this.c++;
                setTransformation( this.c%6, this.PosObject3D, this.RotObject3D, this._renderingArea );
                this.renderer.render( this.scene, this.camera );
            }
            for(var c=0; c<angle_count; c++){
                setTransformation( c, this.PosObject3D, this.RotObject3D, this._renderingArea );
                this.renderer.render( this.scene, this.camera, this.bufferTexture );
                this.renderer.readRenderTargetPixels( this.bufferTexture, 0, 0,
                    this._renderingArea.size, this._renderingArea.size,
                    this.floatBuffer[c]);
            }
        }
        updateRenderingArea(renderingArea){
            this._renderingArea = loadDefault(this._renderingArea, renderingArea);
        }
    }
    sxRenderer = cl_sxRenderer;

    function updateOrthoCamera(camera, renderingArea){
        camera.left   = -renderingArea.size/2;
        camera.right  =  renderingArea.size/2;
        camera.top    =  renderingArea.size/2;
        camera.bottom = -renderingArea.size/2;
        camera.near   = -renderingArea.size/2;
        camera.far    =  renderingArea.size/2;
        camera.updateProjectionMatrix();
    }

    function setTransformation(angle, posObj3D, rotObj3D, renderingArea){
        posObj3D.position.x = -renderingArea.center.x;
        posObj3D.position.y = -renderingArea.center.y;
        posObj3D.position.z = -renderingArea.center.z;
        switch(angle){
            case 0:
            rotObj3D.rotation.x = 0;
            rotObj3D.rotation.y = 0;
            rotObj3D.rotation.z = 0;
            break;
            case 1:
            rotObj3D.rotation.x = 0;
            rotObj3D.rotation.y = Math.PI/2;
            rotObj3D.rotation.z = 0;
            break;
            case 2:
            rotObj3D.rotation.x = 0;
            rotObj3D.rotation.y = Math.PI;
            rotObj3D.rotation.z = 0;
            break;
            case 3:
            rotObj3D.rotation.x = 0;
            rotObj3D.rotation.y = -Math.PI/2;
            rotObj3D.rotation.z = 0;
            break;
            case 4:
            rotObj3D.rotation.x = Math.PI/2;
            rotObj3D.rotation.y = 0;
            rotObj3D.rotation.z = 0;
            break;
            case 5:
            rotObj3D.rotation.x = -Math.PI/2;
            rotObj3D.rotation.y = 0;
            rotObj3D.rotation.z = 0;
            break;
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
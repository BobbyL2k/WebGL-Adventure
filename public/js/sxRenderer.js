/*jshint esversion: 6 */

var sxRenderer;
{
    const angle_count = 6;

    const defaultRenderingArea = {
        center: {
            x:0, y:0, z:0,
        },
        size: 10
    };

    class cl_sxRenderer{
        // NOTE Recomputing size of renderingArea happens in
            // 1 constructor
            // 2 updateRenderingArea
            // If any systems uses size please update accordingly
        constructor(Object3D, renderingArea){
            this._renderingArea = loadDefault(defaultRenderingArea, renderingArea);

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize( this._renderingArea.size, this._renderingArea.size );

            this.camera = new THREE.OrthographicCamera();
            this.updateOrthoCamera();

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
            domContainer.appendChild( this.renderer.domElement );
            this.renderer.domElement.style.width  = "100%";
            this.renderer.domElement.style.height = "100%";
        }
        renderAll(){
            if(this.c === undefined) // For Preview
                this.c = -1;
            this.renderPreview(this.c = (this.c+1)%6);
            for(var c=0; c<angle_count; c++){
                this.renderAngle(c);
            }
        }
        renderAngle(angle){
            setTransformation( angle, this.PosObject3D, this.RotObject3D, this._renderingArea );
            this.renderer.render( this.scene, this.camera, this.bufferTexture );
            this.renderer.readRenderTargetPixels( this.bufferTexture, 0, 0,
                this._renderingArea.size, this._renderingArea.size,
                this.floatBuffer[angle]);
        }
        renderPreview(angle){
            if(this.hasDomContainer){ // For Preview
                setTransformation( angle, this.PosObject3D, this.RotObject3D, this._renderingArea );
                this.renderer.render( this.scene, this.camera );
            }
        }
        updateRenderingArea(renderingArea){
            var old_size = this._renderingArea.size;
            this._renderingArea = loadDefault(this._renderingArea, renderingArea);
            if(this._renderingArea.size != old_size){
                this.renderer.setSize( this._renderingArea.size, this._renderingArea.size );
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
                this.updateOrthoCamera();
            }
            this.renderer.domElement.style.width  = "100%";
            this.renderer.domElement.style.height = "100%";
        }
        
        updateOrthoCamera(){
            this.camera.left   = -this._renderingArea.size/2;
            this.camera.right  =  this._renderingArea.size/2;
            this.camera.top    =  this._renderingArea.size/2;
            this.camera.bottom = -this._renderingArea.size/2;
            this.camera.near   = -this._renderingArea.size/2;
            this.camera.far    =  this._renderingArea.size/2;
            this.camera.updateProjectionMatrix();
        }
    }
    sxRenderer = cl_sxRenderer;

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
        if(obj === undefined) return d_obj;
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
/*jshint esversion: 6 */

var SliceRenderer;
{

    const defaultRenderingArea = {
        center: {
            x:0, y:0, z:0,
        },
        size: {
            x:21, y:21, z:21,
        },
    };

    var sliceDepth = 1;

    class cl_SliceRenderer{
        constructor(Object3D, renderingArea){
            this._renderingArea = loadDefault(defaultRenderingArea, renderingArea);

            this.renderer = new THREE.WebGLRenderer();

            this.camera = new THREE.OrthographicCamera();

            this.scene = new THREE.Scene();
            this.posObj3D = Object3D;
            this.scene.add(this.posObj3D);

            this.updateCenter();
            this.updateSize();
        }

        renderAll(){
            if(this.c === undefined) // For Preview
                this.c = -1;
            this.renderPreview(this.c = (this.c+1)%this._renderingArea.size.z);
            for(var slice=0; slice<this._renderingArea.size.z/sliceDepth; slice++){
                this.renderSlice(slice);
            }
        }

        addDomTo(domContainer){
            this.hasDomContainer = true;
            domContainer.appendChild( this.renderer.domElement );
            this.renderer.domElement.style.width  = "100%";
            this.renderer.domElement.style.height = "100%";
        }

        renderPreview(slice){
            console.log(this, "Preview silce", slice);
            if(this.hasDomContainer){ // For Preview
                this.updateOrthoCameraZ(slice);
                this.renderer.render( this.scene, this.camera );
            }
        }

        renderSlice(slice){
            this.updateOrthoCameraZ(slice);
            this.renderer.render( this.scene, this.camera, this.bufferTexture );
            this.renderer.readRenderTargetPixels( this.bufferTexture, 0, 0,
                this._renderingArea.size.x, this._renderingArea.size.y,
                this.floatBuffer[slice]);
        }

        updateRenderingArea(renderingArea){
            // var old_size = this._renderingArea.size;
            this._renderingArea = loadDefault(this._renderingArea, renderingArea);
            this.updateCenter();
            // if(this._renderingArea.size != old_size){
                this.updateSize();
            // }
        }

        updateSize(){
            this.renderer.setSize( this._renderingArea.size.x, this._renderingArea.size.y );

            this.bufferTexture = new THREE.WebGLRenderTarget(
                this._renderingArea.size.x,
                this._renderingArea.size.y,
                {
                    format: THREE.RGBAFormat,
                    type: THREE.FloatType,
                });

            this.floatBuffer = [];
            const slice_count = this._renderingArea.size.z;
            for(var slice=0; slice<slice_count; slice++){
                this.floatBuffer.push(new Float32Array(
                    this._renderingArea.size.x * this._renderingArea.size.y * 4
                    ));
            }
            this.updateOrthoCameraXY();
        }

        updateCenter(){
            this.posObj3D.position.x = -this._renderingArea.center.x;
            this.posObj3D.position.y = -this._renderingArea.center.y;
            this.posObj3D.position.z = -this._renderingArea.center.z;
        }

        updateOrthoCameraXY(){
            this.camera.left   = -this._renderingArea.size.x/2;
            this.camera.right  =  this._renderingArea.size.x/2;
            this.camera.top    =  this._renderingArea.size.y/2;
            this.camera.bottom = -this._renderingArea.size.y/2;
            // this.camera.updateProjectionMatrix(); // will update anyway on render call
        }

        updateOrthoCameraZ(slice){
            this.camera.near   = slice*sliceDepth -this._renderingArea.size.z/2;
            this.camera.far    = slice*sliceDepth -this._renderingArea.size.z/2 +sliceDepth;
            this.camera.updateProjectionMatrix();
        }
    }
    SliceRenderer = cl_SliceRenderer;

    function loadDefault(d_obj, obj){
        if(obj === undefined) return d_obj;
        var result = {};
        if(typeof obj === 'object'){
            for(let key in d_obj){
                if(typeof d_obj[key] !== 'object'){
                    result[key] = obj[key]===undefined?d_obj[key]:obj[key];
                }else{
                    result[key] = loadDefault(d_obj[key], obj[key]);
                }
            }
        }else{
            for(let key in d_obj){
                if(typeof d_obj[key] !== 'object'){
                    result[key] = obj;
                }else{
                    result[key] = loadDefault(d_obj[key], obj);
                }
            }
        }
        return result;
    }
}
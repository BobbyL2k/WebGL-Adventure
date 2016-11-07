/* jshint esversion: 6 */

class ViewPort{
    constructor(htmlDomTarget, renderCallback, configuration){
        // Public
        this.renderer = new THREE.WebGLRenderer();
        // Private
        this._uid = THREE.Math.generateUUID();
        this._prevFrameTime = 0;
        this._renderCallback = renderCallback;
    }
    coreRender(time){
        requestAnimationFrame( this.coreRender.bind(this) );
        this.renderCallback(time - this._prevFrameTime, time);
        this._prevFrameTime = time;
    }
    test(){
        console.log(this._uid);
    }
}
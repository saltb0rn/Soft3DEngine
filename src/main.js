// import * as glMatrix from "../lib/gl-matrix-min.js";

const Soft3DEngine = {};

/* Class defs */

const Camera = (function() {
    function Camera(position, target) {
        this.position = glMatrix.vec3.create();
        this.target = glMatrix.vec3.create();
    }

    Camera.prototype.lookAt = function(position, target, up) {
        this.position = position;
        this.target = target;
    };
})();

Soft3DEngine.Camera = Camera;

const Mesh = (function() {
    function Mesh(name, verticesCount) {
        this.name = name;
        this.vertices = new Array(verticesCount);
        this.rotation = glMatrix.vec3.create();
        this.position = glMatrix.vec3.create();
    }

    Mesh.prototype.transformByMatrix = function(mat) {
    };

    return Mesh;
})();

Soft3DEngine.Mesh = Mesh;

const Cube = (function() {
    function Cube(len) {
        len = len >> 0;
        if (len < 2) {
            throw Error('len of cube should be greater than 2');
        }
        let mesh = new Mesh('cube', 8),
            v = len >> 1;
        mesh.vertices[0] = glMatrix.vec3.fromValues(v, v, v);
        mesh.vertices[1] = glMatrix.vec3.fromValues(-v, v, v);
        mesh.vertices[2] = glMatrix.vec3.fromValues(-v, -v, v);
        mesh.vertices[3] = glMatrix.vec3.fromValues(v, -v, v);
        mesh.vertices[4] = glMatrix.vec3.fromValues(v, v, -v);
        mesh.vertices[5] = glMatrix.vec3.fromValues(-v, v, -v);
        mesh.vertices[6] = glMatrix.vec3.fromValues(-v, -v, -v);
        mesh.vertices[7] = glMatrix.vec3.fromValues(v, -v, -v);
        return mesh;
    }
    return Cube;
})();

Soft3DEngine.Cube = Cube;

const Device = (function() {
    function Device(canvas) {
        this.workingCanvas = canvas;
        this.workingWidth = canvas.width;
        this.workingHeight = canvas.height;
        this.workingContext = this.workingCanvas.getContext('2d');
        this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
    };

    Device.prototype.clear = function() {
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
        this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
    };

    Device.prototype.present = function() {
        this.workingContext.putImageData(this.backbuffer, 0, 0);
    };

    Device.prototype.putPixel = function(x, y, color) {
        this.backbufferData = this.backbuffer.data;
        // 1D array, each pixel takes up 4 bytes
        var index = ((y >> 0) * this.workingWidth + (x >> 0)) * 4;
        this.backbufferdata[index] = color.r * 255;
        this.backbufferdata[index + 1] = color.g * 255;
        this.backbufferdata[index + 2] = color.b * 255;
        this.backbufferdata[index + 3] = color.a * 255;
    };

    Device.prototype.project = function(coord, transMat) {
        // point in NDC
        var point = glMatrix.vec3.transformMat4(glMatrix.vec3.create(), coord, transMat);
        // 变换是根据Canvas的坐标原点位于左上角,需要手动把坐标变换到现对于中心作为原点
        var x = point[0] * this.workingWidth + this.workingWidth >> 1;
        var y = -point[1] * this.workingHeight + this.workingHeight >> 1;
        return glMatrix.vec2.fromValues(x, y);
    };

    Device.prototype.drawPoint = function(point) {
        var x = point[0],
            y = point[1];
        if (x >= 0 && y >= 0 && x <= this.workingWidth && y <= this.workingHeight) {
            this.putPixel(x, y, glMatrix.vec4.fromValues(1, 1, 0, 1));
        }
    };

    Device.prototype.render = function(camera, meshes) {
        return;
        var viewMatrix = glMatrix.mat4.lookAt(
            glMatrix.mat4.create(),
            camera.position,
            camera.target,
            glMatrix.vec3.fromValues(0, 0, 1)
        );
        var projectionMatrix = glMatrix.mat4.perspective(
            glMatrix.mat4.create(),
            70, this.workingWidth / this.workingHeight,
            0.1, 10.0
        );
        for (var i = 0; i < meshes.length; i++) {
            var cMesh = meshes[i];
        }
        
    };

    return Device;
})();

// methods defs of Soft3DEngine

// Soft3DEngine.PerspectiveCamera = function(fovH, aspect, near, far) {
// };

// Soft3DEngine.OrthographicCamera = function(left, right, top, bottom, near, far) {
// };

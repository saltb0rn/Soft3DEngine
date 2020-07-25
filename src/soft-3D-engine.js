// import * as glMatrix from "../lib/gl-matrix-min.js";

const Soft3DEngine = {};

/* Class defs */

const Camera = (function() {
    function Camera(position, target) {
        this.position = position;
        this.target = target;
    }

    // Camera.prototype.lookAt = function(position, target, up) {
    //     this.position = position;
    //     this.target = target;
    // };

    return Camera;
})();

Soft3DEngine.Camera = Camera;

const Mesh = (function() {
    function Mesh(name, verticesCount) {
        this.name = name;
        this.vertices = new Array(verticesCount);
        this.rotation = {
            x: 0,
            y: 0,
            z: 0
        };
        this.position = glMatrix.vec3.create();
    }

    // Mesh.prototype.transformByMatrix = function(mat) {
    // };

    return Mesh;
})();

Soft3DEngine.Mesh = Mesh;

const Cube = (function() {
    function Cube(len, position) {
        len = len >> 0;
        if (len < 2) {
            throw Error('len of cube should be greater than 2');
        }
        let mesh = new Mesh('cube', 8),
            v = len >> 1;
        if (position) {
            mesh.position = position;
        }
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
        this.backbufferdata = this.backbuffer.data;
    };

    Device.prototype.clear = function() {
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
        this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
    };

    Device.prototype.present = function() {
        this.workingContext.putImageData(this.backbuffer, 0, 0);
    };

    Device.prototype.putPixel = function(x, y, color) {
        this.backbufferdata = this.backbuffer.data;
        // 1D array, each pixel takes up 4 bytes
        var index = ((y >> 0) * this.workingWidth + (x >> 0)) * 4;
        this.backbufferdata[index] = color[0] * 255;
        this.backbufferdata[index + 1] = color[1] * 255;
        this.backbufferdata[index + 2] = color[2] * 255;
        this.backbufferdata[index + 3] = color[3] * 255;
    };

    Device.prototype.project = function(coord, transMat) {
        /*
          coord in homogeneous coordinate system, if you don't want to convert it to Cartesian coordinate manually, use below lines:

          var point = glMatrix.vec3.transformMat4(glMatrix.vec4.create(), coord, transMat);
          var x = point[0] * this.workingWidth + this.workingWidth >> 1;
          var y = -point[1] * this.workingWidth + this.workingWidth >> 1;
          return glMatrix.vec2.fromValues(x, y);
        */
        var point = glMatrix.vec4.transformMat4(
            glMatrix.vec4.create(),
            glMatrix.vec4.fromValues(coord[0], coord[1], coord[2], 1.0),
            transMat);
        var divW = 1 / point[3];
        var pointNDC = glMatrix.vec3.fromValues(point[0] * divW, point[1] * divW, point[2] * divW);
        var x = ((pointNDC[0] * this.workingWidth) >> 0) + this.workingWidth >> 1;
        var y = ((-pointNDC[1] * this.workingHeight) >> 0) + this.workingHeight >> 1;
        return glMatrix.vec2.fromValues(x, y);
    };

    Device.prototype.drawPoint = function(point) {
        var x = point[0],
            y = point[1];
        if (x >= 0 && y >= 0 && x <= this.workingWidth && y <= this.workingHeight) {
            this.putPixel(x, y, glMatrix.vec4.fromValues(1, 1, 1, 1));
        }
    };

    Device.prototype.render = function(camera, meshes) {

        var viewMatrix = glMatrix.mat4.lookAt(
            glMatrix.mat4.create(),
            camera.position,
            camera.target,
            glMatrix.vec3.fromValues(0, 1, 0)
        );
        var projectionMatrix = glMatrix.mat4.perspective(
            glMatrix.mat4.create(),
            0.78, this.workingWidth / this.workingHeight,
            0.1, 10.0
        );
        for (var i = 0; i < meshes.length; i++) {
            var cMesh = meshes[i],
                modelMatrixRy = glMatrix.mat4.rotateY(
                    glMatrix.mat4.create(),
                    glMatrix.mat4.create(),
                    cMesh.rotation.y
                ),
                modelMatrixRx = glMatrix.mat4.rotateX(
                    glMatrix.mat4.create(),
                    glMatrix.mat4.create(),
                    cMesh.rotation.x
                ),
                modelMatrixRz = glMatrix.mat4.rotateZ(
                    glMatrix.mat4.create(),
                    glMatrix.mat4.create(),
                    cMesh.rotation.z
                ),
                modelMatrixRxy = glMatrix.mat4.multiply(
                    glMatrix.mat4.create(),
                    modelMatrixRx, modelMatrixRy
                ),
                modelMatrixR = glMatrix.mat4.multiply(
                    glMatrix.mat4.create(),
                    modelMatrixRz, modelMatrixRxy
                ),
                vec3Translation = glMatrix.vec3.fromValues(
                    cMesh.position[0], cMesh.position[1], cMesh.position[2]),
                modelMatrixT = glMatrix.mat4.fromTranslation(
                    glMatrix.mat4.create(),
                    vec3Translation
                );
            var modelMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(), modelMatrixT, modelMatrixR),
                _transformMatrix1 = glMatrix.mat4.multiply(
                    glMatrix.mat4.create(),
                    viewMatrix,
                    modelMatrix
                ),
                transformMatrix = glMatrix.mat4.multiply(
                    glMatrix.mat4.create(),
                    projectionMatrix,
                    _transformMatrix1
                );
            for (var indexVertices = 0; indexVertices < cMesh.vertices.length; indexVertices++) {
                var projectPoint = this.project(cMesh.vertices[indexVertices], transformMatrix);
                this.drawPoint(projectPoint);
            }
        }

    };

    return Device;
})();

Soft3DEngine.Device = Device;

// methods defs of Soft3DEngine

// Soft3DEngine.PerspectiveCamera = function(fovH, aspect, near, far) {
// };

// Soft3DEngine.OrthographicCamera = function(left, right, top, bottom, near, far) {
// };

var canvas,
    device,
    mesh,
    meshes = [],
    camera;

function drawingLoop() {
    device.clear();
    mesh.rotation.x -= 0.01;
    mesh.rotation.y -= 0.01;
    device.render(camera, meshes);
    device.present();
    requestAnimationFrame(drawingLoop);
}

function main() {
    canvas = document.getElementById('frontbuffer');
    mesh = new Soft3DEngine.Cube(4, [-6, -1, -5]);
    meshes.push(mesh);
    camera = new Soft3DEngine.Camera(
        glMatrix.vec3.fromValues(0, 0, 10),
        glMatrix.vec3.fromValues(0, 0, 0)
    );
    device = new Soft3DEngine.Device(canvas);
    requestAnimationFrame(drawingLoop);
}

document.addEventListener('DOMContentLoaded', main, false);

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export { THREE };

export function createRenderer(canvas, clearColor = 0x1a1a2e) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(clearColor);
    return renderer;
}

export function createPerspectiveCamera(container, options = {}) {
    const {
        fov = 60,
        near = 0.1,
        far = 1000,
        position = { x: 0, y: 0, z: 5 },
    } = options;

    const camera = new THREE.PerspectiveCamera(
        fov,
        container.clientWidth / container.clientHeight,
        near,
        far,
    );

    camera.position.set(position.x, position.y, position.z);
    return camera;
}

export function createOrthographicCamera(container, options = {}) {
    const {
        frustumSize = 6,
        near = 0.1,
        far = 1000,
        position = { x: 0, y: 0, z: 5 },
    } = options;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.OrthographicCamera(
        (-frustumSize * aspect) / 2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        -frustumSize / 2,
        near,
        far,
    );

    camera.position.set(position.x, position.y, position.z);
    return camera;
}

export function createOrbitControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    return controls;
}

export function syncRendererSize(renderer, camera, container, options = {}) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height, false);

    if (camera.isPerspectiveCamera) {
        camera.aspect = width / height;
    } else if (camera.isOrthographicCamera) {
        const frustumSize = options.frustumSize ?? 6;
        const aspect = width / height;
        camera.left = (-frustumSize * aspect) / 2;
        camera.right = (frustumSize * aspect) / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
    }

    camera.updateProjectionMatrix();
}

export function createAnimationLoop(update) {
    let frameId = 0;

    function tick(time) {
        frameId = window.requestAnimationFrame(tick);
        update(time);
    }

    return {
        start() {
            if (!frameId) {
                frameId = window.requestAnimationFrame(tick);
            }
        },
        stop() {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
                frameId = 0;
            }
        },
    };
}

export function disposeMaterial(material) {
    if (Array.isArray(material)) {
        material.forEach(disposeMaterial);
        return;
    }

    if (material && typeof material.dispose === "function") {
        material.dispose();
    }
}

export function replaceMeshGeometry(mesh, geometry) {
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }
    mesh.geometry = geometry;
}

export function replaceMeshMaterial(mesh, material) {
    disposeMaterial(mesh.material);
    mesh.material = material;
}

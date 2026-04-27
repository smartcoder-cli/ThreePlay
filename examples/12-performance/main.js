import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Performance",
    lessonLabel: "Demo 12 - Performance",
    nextHref: "../13-shaders/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Optimization Settings</h2>
            <div class="control-group"><label class="control-label" for="objectCount">Object count</label><div class="control-row"><input id="objectCount" type="range" min="10" max="1000" step="10" value="200"><span class="value-chip" id="objectCountValue">200</span></div></div>
            <div class="control-group"><div class="toggle-row"><input id="enableInstancing" type="checkbox" checked><label class="control-label" for="enableInstancing">Use instancing</label></div></div>
            <div class="control-group"><div class="toggle-row"><input id="enableFrustum" type="checkbox" checked><label class="control-label" for="enableFrustum">Frustum culling</label></div></div>
            <div class="control-group"><div class="toggle-row"><input id="autoRotate" type="checkbox" checked><label class="control-label" for="autoRotate">Auto rotate camera</label></div></div>
        </section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Instancing collapses many similar meshes into far fewer draw calls.</li><li>Frustum culling prevents off-screen objects from rendering.</li><li>Triangle count and draw calls are both useful but different signals.</li><li>The best optimization depends on the actual bottleneck.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "fps", label: "FPS", value: "0" }, { id: "triangles", label: "Triangles", value: "0" }, { id: "calls", label: "Calls", value: "0" }, { id: "objects", label: "Objects", value: "200" }]),
});
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 20, z: 30 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 0.8); light.position.set(10, 20, 10); scene.add(light);

const elements = {
    objectCount: document.getElementById("objectCount"), objectCountValue: document.getElementById("objectCountValue"),
    enableInstancing: document.getElementById("enableInstancing"), enableFrustum: document.getElementById("enableFrustum"), autoRotate: document.getElementById("autoRotate"),
    fps: document.getElementById("fps"), triangles: document.getElementById("triangles"), calls: document.getElementById("calls"), objects: document.getElementById("objects"),
};
const state = { objectCount: 200, enableInstancing: true, enableFrustum: true, autoRotate: true };
let activeObject = null;
const transforms = [];
let fpsFrames = 0;
let lastFps = performance.now();
const matrix = new THREE.Matrix4();

function rebuildScene() {
    if (activeObject) scene.remove(activeObject);
    transforms.length = 0;
    for (let i = 0; i < state.objectCount; i += 1) transforms.push({ pos: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 40), rot: Math.random() * Math.PI * 2 });
    if (state.enableInstancing) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x4ecdc4 });
        const instanced = new THREE.InstancedMesh(geometry, material, state.objectCount);
        transforms.forEach((item, index) => { matrix.makeRotationY(item.rot); matrix.setPosition(item.pos); instanced.setMatrixAt(index, matrix); });
        activeObject = instanced;
    } else {
        const group = new THREE.Group();
        transforms.forEach((item) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }));
            mesh.position.copy(item.pos); mesh.rotation.y = item.rot; mesh.frustumCulled = state.enableFrustum; group.add(mesh);
        });
        activeObject = group;
    }
    scene.add(activeObject);
    elements.objects.textContent = String(state.objectCount);
}

function syncUi() {
    elements.objectCount.value = String(state.objectCount); elements.objectCountValue.textContent = String(state.objectCount);
    elements.enableInstancing.checked = state.enableInstancing; elements.enableFrustum.checked = state.enableFrustum; elements.autoRotate.checked = state.autoRotate;
}

elements.objectCount.addEventListener("input", (event) => { state.objectCount = Number(event.target.value); syncUi(); rebuildScene(); });
elements.enableInstancing.addEventListener("change", (event) => { state.enableInstancing = event.target.checked; rebuildScene(); });
elements.enableFrustum.addEventListener("change", (event) => { state.enableFrustum = event.target.checked; rebuildScene(); });
elements.autoRotate.addEventListener("change", (event) => { state.autoRotate = event.target.checked; });

const loop = createAnimationLoop(() => {
    controls.autoRotate = state.autoRotate;
    controls.update();
    renderer.render(scene, camera);
    elements.triangles.textContent = String(renderer.info.render.triangles);
    elements.calls.textContent = String(renderer.info.render.calls);
    fpsFrames += 1;
    const now = performance.now();
    if (now - lastFps > 1000) { elements.fps.textContent = String(fpsFrames); fpsFrames = 0; lastFps = now; }
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncUi(); rebuildScene(); syncRendererSize(renderer, camera, container); loop.start();

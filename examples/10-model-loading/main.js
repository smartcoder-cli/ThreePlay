import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Model Loading",
    lessonLabel: "Demo 10 - Model Loading",
    nextHref: "../11-audio-video/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Built-in Models</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-model="cube">Cube</button><button class="select-button" data-model="torus">Torus</button>
            <button class="select-button" data-model="knot">Torus Knot</button><button class="select-button" data-model="sphere">Sphere</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Model Settings</h2>
            <div class="control-group"><label class="control-label" for="rotateSpeed">Rotate speed</label><div class="control-row"><input id="rotateSpeed" type="range" min="0" max="3" step="0.1" value="0.5"><span class="value-chip" id="rotateSpeedValue">0.5</span></div></div>
            <div class="control-group"><label class="control-label" for="scale">Scale</label><div class="control-row"><input id="scale" type="range" min="0.5" max="3" step="0.1" value="1"><span class="value-chip" id="scaleValue">1.0</span></div></div>
            <div class="control-group"><div class="toggle-row"><input id="wireframe" type="checkbox" checked><label class="control-label" for="wireframe">Wireframe</label></div></div>
            <div class="control-group"><div class="toggle-row"><input id="autoRotate" type="checkbox" checked><label class="control-label" for="autoRotate">Auto rotate</label></div></div>
        </section>
        <div class="info-box">Real projects usually load glTF assets via GLTFLoader. This lesson uses built-in primitives to focus on inspection, counts, and transform flow.</div>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>glTF is the most common web-friendly delivery format.</li><li>Loaders usually hand back a scene graph, not just one mesh.</li><li>Normalizing scale and pivot is part of model presentation work.</li><li>Wireframe is useful for quickly validating topology density.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "currentModel", label: "Model", value: "Cube" }, { id: "vertexCount", label: "Vertices", value: "24" }, { id: "faceCount", label: "Faces", value: "12" }]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 2, z: 6 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 0.8); light.position.set(5, 10, 5); scene.add(light);
let currentMesh = null;
const models = {
    cube: { name: "Cube", create: () => new THREE.BoxGeometry(2, 2, 2) },
    torus: { name: "Torus", create: () => new THREE.TorusGeometry(1.5, 0.5, 16, 50) },
    knot: { name: "Torus Knot", create: () => new THREE.TorusKnotGeometry(1, 0.3, 100, 16) },
    sphere: { name: "Sphere", create: () => new THREE.SphereGeometry(1.5, 32, 32) },
};
const elements = {
    modelButtons: Array.from(document.querySelectorAll("[data-model]")),
    rotateSpeed: document.getElementById("rotateSpeed"), rotateSpeedValue: document.getElementById("rotateSpeedValue"),
    scale: document.getElementById("scale"), scaleValue: document.getElementById("scaleValue"),
    wireframe: document.getElementById("wireframe"), autoRotate: document.getElementById("autoRotate"),
    currentModel: document.getElementById("currentModel"), vertexCount: document.getElementById("vertexCount"), faceCount: document.getElementById("faceCount"),
};
const state = { model: "cube", rotateSpeed: 0.5, scale: 1, wireframe: true, autoRotate: true };

function rebuildMesh() {
    if (currentMesh) { scene.remove(currentMesh); currentMesh.geometry.dispose(); currentMesh.material.dispose(); }
    currentMesh = new THREE.Mesh(models[state.model].create(), new THREE.MeshStandardMaterial({ color: 0x4ecdc4, wireframe: state.wireframe }));
    currentMesh.scale.setScalar(state.scale);
    scene.add(currentMesh);
    const positions = currentMesh.geometry.attributes.position.count;
    const faces = currentMesh.geometry.index ? currentMesh.geometry.index.count / 3 : positions / 3;
    elements.currentModel.textContent = models[state.model].name;
    elements.vertexCount.textContent = String(positions);
    elements.faceCount.textContent = String(Math.floor(faces));
}

function syncUi() {
    elements.rotateSpeed.value = String(state.rotateSpeed); elements.rotateSpeedValue.textContent = state.rotateSpeed.toFixed(1);
    elements.scale.value = String(state.scale); elements.scaleValue.textContent = state.scale.toFixed(1);
    elements.wireframe.checked = state.wireframe; elements.autoRotate.checked = state.autoRotate;
    elements.modelButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.model === state.model));
}

elements.modelButtons.forEach((button) => button.addEventListener("click", () => { state.model = button.dataset.model; syncUi(); rebuildMesh(); }));
elements.rotateSpeed.addEventListener("input", (event) => { state.rotateSpeed = Number(event.target.value); syncUi(); });
elements.scale.addEventListener("input", (event) => { state.scale = Number(event.target.value); syncUi(); rebuildMesh(); });
elements.wireframe.addEventListener("change", (event) => { state.wireframe = event.target.checked; rebuildMesh(); });
elements.autoRotate.addEventListener("change", (event) => { state.autoRotate = event.target.checked; });

const loop = createAnimationLoop(() => {
    if (currentMesh && state.autoRotate) currentMesh.rotation.y += 0.01 * state.rotateSpeed;
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncUi(); rebuildMesh(); syncRendererSize(renderer, camera, container); loop.start();

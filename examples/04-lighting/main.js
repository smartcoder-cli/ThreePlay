import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import {
    THREE,
    createAnimationLoop,
    createOrbitControls,
    createPerspectiveCamera,
    createRenderer,
    syncRendererSize,
} from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");

const shell = renderLessonShell(app, {
    title: "Lighting",
    lessonLabel: "Demo 04 - Lighting",
    nextHref: "../05-animation/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Light Type</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-type="directional">Directional</button>
                <button class="select-button" data-type="point">Point</button>
                <button class="select-button" data-type="spot">Spot</button>
                <button class="select-button" data-type="ambient">Ambient</button>
            </div>
            <div class="info-box">Different lights change both highlight shape and whether shadows are meaningful.</div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Light Properties</h2>
            <div class="control-group">
                <label class="control-label" for="lightColor">Color</label>
                <div class="control-row">
                    <input type="color" id="lightColor" value="#ffffff">
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="intensity">Intensity</label>
                <div class="control-row">
                    <input type="range" id="intensity" min="0" max="3" step="0.1" value="1">
                    <span class="value-chip" id="intensityValue">1.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="posX">Position X</label>
                <div class="control-row">
                    <input type="range" id="posX" min="-10" max="10" step="0.5" value="5">
                    <span class="value-chip" id="posXValue">5.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="posY">Position Y</label>
                <div class="control-row">
                    <input type="range" id="posY" min="-10" max="10" step="0.5" value="10">
                    <span class="value-chip" id="posYValue">10.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="posZ">Position Z</label>
                <div class="control-row">
                    <input type="range" id="posZ" min="-10" max="10" step="0.5" value="5">
                    <span class="value-chip" id="posZValue">5.0</span>
                </div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Shadow Settings</h2>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="castShadow" checked>
                    <label class="control-label" for="castShadow">Cast shadows</label>
                </div>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="receiveShadow" checked>
                    <label class="control-label" for="receiveShadow">Receive shadows</label>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="shadowMapSize">Shadow map size</label>
                <div class="control-row">
                    <input type="range" id="shadowMapSize" min="256" max="2048" step="256" value="1024">
                    <span class="value-chip" id="shadowMapSizeValue">1024</span>
                </div>
            </div>
        </section>

        <button class="primary-button" id="resetBtn">Reset Lesson</button>

        <section class="panel">
            <h2 class="panel__title">Study Notes</h2>
            <ul class="tips-list">
                <li>Ambient light lifts all values evenly and does not create directional shading.</li>
                <li>Directional, point, and spot lights each produce different highlight behavior.</li>
                <li>Shadow resolution changes quality but costs memory and performance.</li>
                <li>Moving the light changes both illumination and shadow projection.</li>
            </ul>
        </section>
    `,
    statsContent: "",
});
shell.stats.remove();

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, {
    fov: 60,
    position: { x: 5, y: 5, z: 5 },
});
const renderer = createRenderer(canvas, 0x1a1a2e);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
const controls = createOrbitControls(camera, canvas);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x4ecdc4, metalness: 0.3, roughness: 0.5 }),
);
sphere.castShadow = true;
sphere.receiveShadow = true;
sphere.position.y = 0.8;
scene.add(sphere);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b, metalness: 0.2, roughness: 0.5 }),
);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(2.5, 0.6, 0);
cube.rotation.y = Math.PI / 6;
scene.add(cube);

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xffd93d, metalness: 0.2, roughness: 0.5 }),
);
cylinder.castShadow = true;
cylinder.receiveShadow = true;
cylinder.position.set(-2, 0.75, 1.5);
scene.add(cylinder);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.25, 16, 48),
    new THREE.MeshStandardMaterial({ color: 0xa29bfe, metalness: 0.3, roughness: 0.4 }),
);
torus.castShadow = true;
torus.receiveShadow = true;
torus.position.set(-1.5, 1.2, -1.5);
torus.rotation.x = Math.PI / 3;
scene.add(torus);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x333344 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const meshes = [sphere, cube, cylinder, torus];
let currentLight = null;

const elements = {
    typeButtons: Array.from(document.querySelectorAll("[data-type]")),
    lightColor: document.getElementById("lightColor"),
    intensity: document.getElementById("intensity"),
    intensityValue: document.getElementById("intensityValue"),
    posX: document.getElementById("posX"),
    posXValue: document.getElementById("posXValue"),
    posY: document.getElementById("posY"),
    posYValue: document.getElementById("posYValue"),
    posZ: document.getElementById("posZ"),
    posZValue: document.getElementById("posZValue"),
    castShadow: document.getElementById("castShadow"),
    receiveShadow: document.getElementById("receiveShadow"),
    shadowMapSize: document.getElementById("shadowMapSize"),
    shadowMapSizeValue: document.getElementById("shadowMapSizeValue"),
    resetBtn: document.getElementById("resetBtn"),
};

const defaultState = {
    type: "directional",
    color: "#ffffff",
    intensity: 1,
    posX: 5,
    posY: 10,
    posZ: 5,
    castShadow: true,
    receiveShadow: true,
    shadowMapSize: 1024,
};

const state = { ...defaultState };

function createLight() {
    if (currentLight) {
        scene.remove(currentLight);
    }

    switch (state.type) {
        case "point":
            currentLight = new THREE.PointLight(state.color, state.intensity, 50);
            break;
        case "spot":
            currentLight = new THREE.SpotLight(state.color, state.intensity);
            currentLight.angle = Math.PI / 4;
            currentLight.penumbra = 0.3;
            currentLight.target.position.set(0, 0, 0);
            scene.add(currentLight.target);
            break;
        case "ambient":
            currentLight = new THREE.AmbientLight(state.color, state.intensity);
            break;
        case "directional":
        default:
            currentLight = new THREE.DirectionalLight(state.color, state.intensity);
            break;
    }

    currentLight.position.set(state.posX, state.posY, state.posZ);
    if (!currentLight.isAmbientLight) {
        currentLight.castShadow = state.castShadow;
        currentLight.shadow.mapSize.width = state.shadowMapSize;
        currentLight.shadow.mapSize.height = state.shadowMapSize;
    }
    scene.add(currentLight);
}

function applyLightSettings() {
    if (!currentLight) {
        return;
    }
    currentLight.color.set(state.color);
    currentLight.intensity = state.intensity;

    if (!currentLight.isAmbientLight) {
        currentLight.position.set(state.posX, state.posY, state.posZ);
        currentLight.castShadow = state.castShadow;
        currentLight.shadow.mapSize.width = state.shadowMapSize;
        currentLight.shadow.mapSize.height = state.shadowMapSize;
    }

    meshes.forEach((mesh) => { mesh.castShadow = state.castShadow; mesh.receiveShadow = true; });
    ground.receiveShadow = state.receiveShadow;
}

function syncUiFromState() {
    elements.lightColor.value = state.color;
    elements.intensity.value = String(state.intensity);
    elements.intensityValue.textContent = state.intensity.toFixed(1);
    elements.posX.value = String(state.posX);
    elements.posXValue.textContent = state.posX.toFixed(1);
    elements.posY.value = String(state.posY);
    elements.posYValue.textContent = state.posY.toFixed(1);
    elements.posZ.value = String(state.posZ);
    elements.posZValue.textContent = state.posZ.toFixed(1);
    elements.castShadow.checked = state.castShadow;
    elements.receiveShadow.checked = state.receiveShadow;
    elements.shadowMapSize.value = String(state.shadowMapSize);
    elements.shadowMapSizeValue.textContent = String(state.shadowMapSize);
    elements.typeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.type === state.type));
}

elements.typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.type = button.dataset.type;
        syncUiFromState();
        createLight();
        applyLightSettings();
    });
});

["lightColor", "intensity", "posX", "posY", "posZ", "shadowMapSize"].forEach((key) => {
    elements[key].addEventListener("input", (event) => {
        state[key === "lightColor" ? "color" : key] = key === "lightColor" ? event.target.value : Number(event.target.value);
        syncUiFromState();
        applyLightSettings();
    });
});

elements.castShadow.addEventListener("change", (event) => {
    state.castShadow = event.target.checked;
    applyLightSettings();
});

elements.receiveShadow.addEventListener("change", (event) => {
    state.receiveShadow = event.target.checked;
    applyLightSettings();
});

elements.resetBtn.addEventListener("click", () => {
    Object.assign(state, defaultState);
    syncUiFromState();
    createLight();
    applyLightSettings();
});

const loop = createAnimationLoop(() => {
    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.008;
    cylinder.rotation.y += 0.012;
    torus.rotation.z += 0.01;
    controls.update();
    renderer.render(scene, camera);
});

window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));

syncUiFromState();
createLight();
applyLightSettings();
syncRendererSize(renderer, camera, container);
loop.start();

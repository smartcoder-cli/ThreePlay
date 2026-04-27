import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";
import { FlyControls } from "three/examples/jsm/controls/FlyControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
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
    title: "Controls",
    lessonLabel: "Demo 06 - Controls",
    nextHref: "../07-particles/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Controller Type</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-control="orbit">Orbit</button>
                <button class="select-button" data-control="firstPerson">First Person</button>
                <button class="select-button" data-control="fly">Fly</button>
                <button class="select-button" data-control="transform">Transform</button>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Controller Settings</h2>
            <div class="control-group">
                <label class="control-label" for="rotateSpeed">Rotate speed</label>
                <div class="control-row">
                    <input type="range" id="rotateSpeed" min="0.1" max="5" step="0.1" value="1">
                    <span class="value-chip" id="rotateSpeedValue">1.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="minDistance">Min distance</label>
                <div class="control-row">
                    <input type="range" id="minDistance" min="1" max="10" step="0.5" value="2">
                    <span class="value-chip" id="minDistanceValue">2</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="maxDistance">Max distance</label>
                <div class="control-row">
                    <input type="range" id="maxDistance" min="10" max="50" step="1" value="20">
                    <span class="value-chip" id="maxDistanceValue">20</span>
                </div>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="enableDamping" checked>
                    <label class="control-label" for="enableDamping">Enable damping</label>
                </div>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="autoRotate">
                    <label class="control-label" for="autoRotate">Auto rotate</label>
                </div>
            </div>
            <div class="info-box">
                Orbit settings only affect orbit mode. Transform mode now attaches to the clicked object instead of showing an idle gizmo.
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Interaction Hints</h2>
            <div class="hint-box">
                <div><kbd>Left drag</kbd> rotate or look around</div>
                <div><kbd>Right drag</kbd> pan in orbit mode</div>
                <div><kbd>Wheel</kbd> zoom in orbit mode</div>
                <div><kbd>W A S D</kbd> move in first-person and fly modes</div>
                <div><kbd>Click cube</kbd> recolor it or attach transform controls</div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Interaction Log</h2>
            <div class="log-box" id="log"></div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Study Notes</h2>
            <ul class="tips-list">
                <li>Orbit controls are the most common baseline for scene inspection.</li>
                <li>Damping smooths input but adds a small amount of lag by design.</li>
                <li>Distance limits stop the camera from clipping through the scene.</li>
                <li>Different control schemes fit different application types.</li>
            </ul>
        </section>
    `,
    statsContent: "",
});

shell.stats.remove();

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const focusTarget = new THREE.Vector3(0, 0.35, 0);
const camera = createPerspectiveCamera(container, {
    fov: 60,
    position: { x: 5.5, y: 4.2, z: 7 },
});
const renderer = createRenderer(canvas, 0x1a1a2e);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
const materials = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffd93d, 0x6c5ce7, 0xa29bfe].map((color) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5 }),
);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x222233 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

const gridHelper = new THREE.GridHelper(30, 30, 0x444466, 0x333355);
gridHelper.position.y = -0.5;
scene.add(gridHelper);

const cubes = [];
[
    [0, 0.5, 0],
    [-2, 0.5, 2],
    [2, 0.5, -2],
    [0, 0.5, 3],
].forEach((position, index) => {
    const cube = new THREE.Mesh(sharedGeometry, materials[index]);
    cube.position.set(position[0], position[1], position[2]);
    scene.add(cube);
    cubes.push(cube);
});

const elements = {
    controlButtons: Array.from(document.querySelectorAll("[data-control]")),
    rotateSpeed: document.getElementById("rotateSpeed"),
    rotateSpeedValue: document.getElementById("rotateSpeedValue"),
    minDistance: document.getElementById("minDistance"),
    minDistanceValue: document.getElementById("minDistanceValue"),
    maxDistance: document.getElementById("maxDistance"),
    maxDistanceValue: document.getElementById("maxDistanceValue"),
    enableDamping: document.getElementById("enableDamping"),
    autoRotate: document.getElementById("autoRotate"),
    log: document.getElementById("log"),
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

const state = {
    currentControlType: "orbit",
    rotateSpeed: 1,
    minDistance: 2,
    maxDistance: 20,
    enableDamping: true,
    autoRotate: false,
};

let controls = null;
let transformControls = null;

function appendLog(message) {
    const line = document.createElement("div");
    line.textContent = `> ${message}`;
    elements.log.appendChild(line);

    while (elements.log.children.length > 8) {
        elements.log.removeChild(elements.log.firstChild);
    }

    elements.log.scrollTop = elements.log.scrollHeight;
}

function setPointerFromEvent(event) {
    pointer.x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    pointer.y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
}

function pickCube(event) {
    setPointerFromEvent(event);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(cubes)[0]?.object ?? null;
}

function applyOrbitSettings() {
    if (!controls || state.currentControlType !== "orbit") {
        return;
    }

    controls.enableDamping = state.enableDamping;
    controls.autoRotate = state.autoRotate;
    controls.rotateSpeed = state.rotateSpeed;
    controls.minDistance = state.minDistance;
    controls.maxDistance = state.maxDistance;
}

function disposeActiveControls() {
    if (controls) {
        controls.dispose?.();
        controls = null;
    }

    if (transformControls) {
        scene.remove(transformControls);
        transformControls.dispose();
        transformControls = null;
    }
}

function setupControls(type) {
    disposeActiveControls();

    camera.position.set(5.5, 4.2, 7);
    camera.lookAt(focusTarget);
    state.currentControlType = type;

    switch (type) {
        case "firstPerson":
            controls = new FirstPersonControls(camera, canvas);
            controls.movementSpeed = 5;
            controls.lookSpeed = 0.1;
            appendLog("First-person controls active. Use WASD and mouse look.");
            break;
        case "fly":
            controls = new FlyControls(camera, renderer.domElement);
            controls.movementSpeed = 5;
            controls.rollSpeed = 0.5;
            appendLog("Fly controls active. Use WASD plus mouse look.");
            break;
        case "transform":
            controls = createOrbitControls(camera, canvas);
            controls.target.copy(focusTarget);
            transformControls = new TransformControls(camera, canvas);
            transformControls.setMode("translate");
            transformControls.addEventListener("dragging-changed", (event) => {
                controls.enabled = !event.value;
            });
            scene.add(transformControls);
            appendLog("Transform controls active. Click a cube to attach the gizmo.");
            break;
        case "orbit":
        default:
            controls = createOrbitControls(camera, canvas);
            controls.target.copy(focusTarget);
            applyOrbitSettings();
            appendLog("Orbit controls active. Drag to orbit and wheel to zoom.");
            break;
    }
}

function updateControlButtons() {
    elements.controlButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.control === state.currentControlType);
    });
}

elements.controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setupControls(button.dataset.control);
        updateControlButtons();
    });
});

elements.rotateSpeed.addEventListener("input", (event) => {
    state.rotateSpeed = Number(event.target.value);
    elements.rotateSpeedValue.textContent = state.rotateSpeed.toFixed(1);
    applyOrbitSettings();
    if (state.currentControlType === "orbit") {
        appendLog(`Orbit rotate speed set to ${state.rotateSpeed.toFixed(1)}.`);
    }
});

elements.minDistance.addEventListener("input", (event) => {
    state.minDistance = Number(event.target.value);
    elements.minDistanceValue.textContent = state.minDistance.toFixed(1);
    applyOrbitSettings();
    if (state.currentControlType === "orbit") {
        appendLog(`Orbit min distance set to ${state.minDistance.toFixed(1)}.`);
    }
});

elements.maxDistance.addEventListener("input", (event) => {
    state.maxDistance = Number(event.target.value);
    elements.maxDistanceValue.textContent = state.maxDistance.toFixed(0);
    applyOrbitSettings();
    if (state.currentControlType === "orbit") {
        appendLog(`Orbit max distance set to ${state.maxDistance.toFixed(0)}.`);
    }
});

elements.enableDamping.addEventListener("change", (event) => {
    state.enableDamping = event.target.checked;
    applyOrbitSettings();
});

elements.autoRotate.addEventListener("change", (event) => {
    state.autoRotate = event.target.checked;
    applyOrbitSettings();
});

canvas.addEventListener("click", (event) => {
    const cube = pickCube(event);
    if (!cube) {
        return;
    }

    if (state.currentControlType === "transform" && transformControls) {
        transformControls.attach(cube);
        appendLog(
            `Transform attached at (${cube.position.x.toFixed(1)}, ${cube.position.y.toFixed(1)}, ${cube.position.z.toFixed(1)}).`,
        );
        return;
    }

    cube.material = materials[Math.floor(Math.random() * materials.length)];
    appendLog(
        `Cube clicked at (${cube.position.x.toFixed(1)}, ${cube.position.y.toFixed(1)}, ${cube.position.z.toFixed(1)}).`,
    );
});

canvas.addEventListener("mousemove", (event) => {
    canvas.style.cursor = pickCube(event) ? "pointer" : "default";
});

const loop = createAnimationLoop(() => {
    const delta = clock.getDelta();

    if (controls) {
        if (state.currentControlType === "firstPerson" || state.currentControlType === "fly") {
            controls.update(delta);
        } else {
            controls.update();
        }
    }

    renderer.render(scene, camera);
});

function handleResize() {
    syncRendererSize(renderer, camera, container);
}

window.addEventListener("resize", handleResize);

elements.rotateSpeedValue.textContent = state.rotateSpeed.toFixed(1);
elements.minDistanceValue.textContent = state.minDistance.toFixed(1);
elements.maxDistanceValue.textContent = state.maxDistance.toFixed(0);

setupControls("orbit");
updateControlButtons();
handleResize();
appendLog("Try dragging the camera and clicking a cube.");
loop.start();

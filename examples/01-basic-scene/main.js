import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import {
    THREE,
    createAnimationLoop,
    createOrbitControls,
    createOrthographicCamera,
    createPerspectiveCamera,
    createRenderer,
    replaceMeshGeometry,
    replaceMeshMaterial,
    syncRendererSize,
} from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");

const shell = renderLessonShell(app, {
    title: "Basic Scene",
    lessonLabel: "Demo 01 - Basic Scene",
    nextHref: "../02-geometries/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Scene Settings</h2>
            <div class="control-group">
                <label class="control-label" for="bgColor">Background color</label>
                <div class="control-row">
                    <input type="color" id="bgColor" value="#1a1a2e">
                    <span class="control-label">Updates renderer clear color</span>
                </div>
            </div>
            <div class="info-box">
                A minimal Three.js app is built from <strong>Scene</strong>, <strong>Camera</strong>, and <strong>Renderer</strong>.
                This lesson keeps that setup small enough to inspect and reset.
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Camera Settings</h2>
            <div class="control-group">
                <label class="control-label" for="fov">Field of view</label>
                <div class="control-row">
                    <input type="range" id="fov" min="30" max="120" step="1" value="75">
                    <span class="value-chip" id="fovValue">75 deg</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="cameraDistance">Camera distance</label>
                <div class="control-row">
                    <input type="range" id="cameraDistance" min="2" max="20" step="0.5" value="5">
                    <span class="value-chip" id="distanceValue">5</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="cameraType">Camera type</label>
                <select id="cameraType">
                    <option value="perspective">Perspective</option>
                    <option value="orthographic">Orthographic</option>
                </select>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="autoRotate" checked>
                    <label class="control-label" for="autoRotate">Auto rotate</label>
                </div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Cube Settings</h2>
            <div class="control-group">
                <label class="control-label" for="cubeColor">Color</label>
                <div class="control-row">
                    <input type="color" id="cubeColor" value="#4ecdc4">
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="cubeSize">Size</label>
                <div class="control-row">
                    <input type="range" id="cubeSize" min="0.5" max="3" step="0.1" value="1">
                    <span class="value-chip" id="sizeValue">1</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="materialType">Material</label>
                <select id="materialType">
                    <option value="basic">Basic</option>
                    <option value="normal">Normal</option>
                    <option value="standard">Standard</option>
                    <option value="wireframe">Wireframe</option>
                </select>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Light Settings</h2>
            <div class="control-group" id="lightEnabledGroup">
                <div class="toggle-row">
                    <input type="checkbox" id="enableLight" checked>
                    <label class="control-label" for="enableLight">Enable point light</label>
                </div>
            </div>
            <div class="control-group" id="lightColorGroup">
                <label class="control-label" for="lightColor">Light color</label>
                <div class="control-row">
                    <input type="color" id="lightColor" value="#ffffff">
                </div>
            </div>
            <div class="control-group" id="lightIntensityGroup">
                <label class="control-label" for="lightIntensity">Light intensity</label>
                <div class="control-row">
                    <input type="range" id="lightIntensity" min="0" max="2" step="0.1" value="1">
                    <span class="value-chip" id="lightIntensityValue">1.0</span>
                </div>
            </div>
            <div class="info-box">Only the Standard material clearly reacts to this light setup.</div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Code Preview</h2>
            <div class="code-preview" id="codePreview"></div>
        </section>

        <button class="primary-button" id="resetBtn">Reset Lesson</button>

        <section class="panel">
            <h2 class="panel__title">Study Notes</h2>
            <ul class="tips-list">
                <li>Increase FOV and watch perspective distortion become stronger.</li>
                <li>Switch to an orthographic camera and compare depth cues.</li>
                <li>Change materials and notice when light actually matters.</li>
                <li>Drag the canvas and adjust distance to understand camera placement.</li>
            </ul>
        </section>
    `,
    statsContent: statsRows([
        { id: "fps", label: "FPS", value: "0" },
        { id: "triangles", label: "Triangles", value: "0" },
        { id: "calls", label: "Calls", value: "0" },
    ]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const focusTarget = new THREE.Vector3(0, -0.25, 0);

const defaultState = {
    bgColor: "#1a1a2e",
    fov: 75,
    distance: 5,
    cameraType: "perspective",
    autoRotate: true,
    cubeColor: "#4ecdc4",
    cubeSize: 1,
    materialType: "basic",
    lightEnabled: true,
    lightColor: "#ffffff",
    lightIntensity: 1,
};

const state = { ...defaultState };

let camera = createPerspectiveCamera(container, {
    fov: state.fov,
    position: { x: 0.8, y: 0.6, z: state.distance + 0.4 },
});

const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
controls.target.copy(focusTarget);
controls.autoRotate = state.autoRotate;
controls.autoRotateSpeed = 2;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    createMaterial(state.materialType, state.cubeColor),
);
scene.add(cube);

const fpsNode = document.getElementById("fps");
const trianglesNode = document.getElementById("triangles");
const callsNode = document.getElementById("calls");

let frameCount = 0;
let lastFpsTime = performance.now();

const loop = createAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);

    frameCount += 1;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
        fpsNode.textContent = String(frameCount);
        frameCount = 0;
        lastFpsTime = now;
    }

    trianglesNode.textContent = String(renderer.info.render.triangles);
    callsNode.textContent = String(renderer.info.render.calls);
});

const elements = {
    bgColor: document.getElementById("bgColor"),
    fov: document.getElementById("fov"),
    fovValue: document.getElementById("fovValue"),
    cameraDistance: document.getElementById("cameraDistance"),
    distanceValue: document.getElementById("distanceValue"),
    cameraType: document.getElementById("cameraType"),
    autoRotate: document.getElementById("autoRotate"),
    cubeColor: document.getElementById("cubeColor"),
    cubeSize: document.getElementById("cubeSize"),
    sizeValue: document.getElementById("sizeValue"),
    materialType: document.getElementById("materialType"),
    enableLight: document.getElementById("enableLight"),
    lightColor: document.getElementById("lightColor"),
    lightIntensity: document.getElementById("lightIntensity"),
    lightIntensityValue: document.getElementById("lightIntensityValue"),
    lightEnabledGroup: document.getElementById("lightEnabledGroup"),
    lightColorGroup: document.getElementById("lightColorGroup"),
    lightIntensityGroup: document.getElementById("lightIntensityGroup"),
    codePreview: document.getElementById("codePreview"),
    resetBtn: document.getElementById("resetBtn"),
};

function createMaterial(type, color) {
    const colorValue = new THREE.Color(color);

    switch (type) {
        case "normal":
            return new THREE.MeshNormalMaterial();
        case "standard":
            return new THREE.MeshStandardMaterial({ color: colorValue });
        case "wireframe":
            return new THREE.MeshBasicMaterial({ color: colorValue, wireframe: true });
        case "basic":
        default:
            return new THREE.MeshBasicMaterial({ color: colorValue });
    }
}

function setLightControlsEnabled(enabled) {
    const className = "control-group--disabled";
    elements.lightEnabledGroup.classList.toggle(className, !enabled);
    elements.lightColorGroup.classList.toggle(className, !enabled);
    elements.lightIntensityGroup.classList.toggle(className, !enabled);
}

function updateCodePreview() {
    const cameraCtor = state.cameraType === "perspective"
        ? `new THREE.PerspectiveCamera(${state.fov}, width / height, 0.1, 1000)`
        : "new THREE.OrthographicCamera(left, right, top, bottom, 0.1, 1000)";

    elements.codePreview.innerHTML = [
        `<span class="comment">// scene</span>`,
        `<span class="keyword">const</span> scene = <span class="keyword">new</span> THREE.Scene();`,
        ``,
        `<span class="comment">// camera</span>`,
        `<span class="keyword">const</span> camera = <span class="keyword">new</span> ${cameraCtor};`,
        ``,
        `<span class="comment">// renderer</span>`,
        `<span class="keyword">const</span> renderer = <span class="keyword">new</span> THREE.WebGLRenderer();`,
        ``,
        `<span class="comment">// mesh</span>`,
        `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.BoxGeometry(<span class="number">${state.cubeSize}</span>);`,
        `<span class="keyword">const</span> material = <span class="keyword">new</span> THREE.${materialLabel(state.materialType)}();`,
    ].join("\n");
}

function materialLabel(type) {
    switch (type) {
        case "normal":
            return "MeshNormalMaterial";
        case "standard":
            return "MeshStandardMaterial";
        case "wireframe":
            return "MeshBasicMaterial";
        case "basic":
        default:
            return "MeshBasicMaterial";
    }
}

function updateCameraDistance(distance) {
    state.distance = distance;
    elements.distanceValue.textContent = String(distance);

    const direction = camera.position.clone().sub(controls.target).normalize();
    const nextDirection = direction.lengthSq() === 0 ? new THREE.Vector3(0, 0, 1) : direction;
    camera.position.copy(controls.target.clone().add(nextDirection.multiplyScalar(distance)));
    controls.update();
}

function swapCamera(type) {
    const previousPosition = camera.position.clone();
    const nextCamera = type === "perspective"
        ? createPerspectiveCamera(container, {
            fov: state.fov,
            position: { x: previousPosition.x, y: previousPosition.y, z: previousPosition.z },
        })
        : createOrthographicCamera(container, {
            frustumSize: 6,
            position: { x: previousPosition.x, y: previousPosition.y, z: previousPosition.z },
        });

    nextCamera.lookAt(focusTarget);
    camera = nextCamera;
    controls.object = camera;
    controls.target.copy(focusTarget);
    syncRendererSize(renderer, camera, container, { frustumSize: 6 });
    controls.update();
}

function applyMaterial(type) {
    state.materialType = type;
    replaceMeshMaterial(cube, createMaterial(type, state.cubeColor));
    setLightControlsEnabled(type === "standard");
    updateCodePreview();
}

function applyStateToInputs() {
    elements.bgColor.value = state.bgColor;
    elements.fov.value = String(state.fov);
    elements.fovValue.textContent = `${state.fov} deg`;
    elements.cameraDistance.value = String(state.distance);
    elements.distanceValue.textContent = String(state.distance);
    elements.cameraType.value = state.cameraType;
    elements.autoRotate.checked = state.autoRotate;
    elements.cubeColor.value = state.cubeColor;
    elements.cubeSize.value = String(state.cubeSize);
    elements.sizeValue.textContent = String(state.cubeSize);
    elements.materialType.value = state.materialType;
    elements.enableLight.checked = state.lightEnabled;
    elements.lightColor.value = state.lightColor;
    elements.lightIntensity.value = String(state.lightIntensity);
    elements.lightIntensityValue.textContent = state.lightIntensity.toFixed(1);
}

function resetScene() {
    Object.assign(state, defaultState);
    applyStateToInputs();

    renderer.setClearColor(state.bgColor);
    swapCamera(state.cameraType);
    updateCameraDistance(state.distance);
    controls.autoRotate = state.autoRotate;

    cube.material.color?.set?.(state.cubeColor);
    replaceMeshGeometry(cube, new THREE.BoxGeometry(state.cubeSize, state.cubeSize, state.cubeSize));
    applyMaterial(state.materialType);

    pointLight.visible = state.lightEnabled;
    pointLight.color.set(state.lightColor);
    pointLight.intensity = state.lightIntensity;

    camera.position.set(0.8, 0.6, state.distance + 0.4);
    controls.target.copy(focusTarget);
    controls.update();
    updateCodePreview();
}

elements.bgColor.addEventListener("input", (event) => {
    state.bgColor = event.target.value;
    renderer.setClearColor(state.bgColor);
});

elements.fov.addEventListener("input", (event) => {
    const nextValue = Number(event.target.value);
    state.fov = nextValue;
    elements.fovValue.textContent = `${nextValue} deg`;
    if (camera.isPerspectiveCamera) {
        camera.fov = nextValue;
        camera.updateProjectionMatrix();
    }
    updateCodePreview();
});

elements.cameraDistance.addEventListener("input", (event) => {
    updateCameraDistance(Number(event.target.value));
});

elements.cameraType.addEventListener("change", (event) => {
    state.cameraType = event.target.value;
    swapCamera(state.cameraType);
    updateCodePreview();
});

elements.autoRotate.addEventListener("change", (event) => {
    state.autoRotate = event.target.checked;
    controls.autoRotate = state.autoRotate;
});

elements.cubeColor.addEventListener("input", (event) => {
    state.cubeColor = event.target.value;
    if (cube.material.color) {
        cube.material.color.set(state.cubeColor);
    }
});

elements.cubeSize.addEventListener("input", (event) => {
    state.cubeSize = Number(event.target.value);
    elements.sizeValue.textContent = String(state.cubeSize);
    replaceMeshGeometry(cube, new THREE.BoxGeometry(state.cubeSize, state.cubeSize, state.cubeSize));
    updateCodePreview();
});

elements.materialType.addEventListener("change", (event) => {
    applyMaterial(event.target.value);
});

elements.enableLight.addEventListener("change", (event) => {
    state.lightEnabled = event.target.checked;
    pointLight.visible = state.lightEnabled;
});

elements.lightColor.addEventListener("input", (event) => {
    state.lightColor = event.target.value;
    pointLight.color.set(state.lightColor);
});

elements.lightIntensity.addEventListener("input", (event) => {
    state.lightIntensity = Number(event.target.value);
    elements.lightIntensityValue.textContent = state.lightIntensity.toFixed(1);
    pointLight.intensity = state.lightIntensity;
});

elements.resetBtn.addEventListener("click", resetScene);

function handleResize() {
    syncRendererSize(renderer, camera, container, { frustumSize: 6 });
}

window.addEventListener("resize", handleResize);

applyStateToInputs();
renderer.setClearColor(state.bgColor);
handleResize();
updateCameraDistance(state.distance);
applyMaterial(state.materialType);
updateCodePreview();
loop.start();

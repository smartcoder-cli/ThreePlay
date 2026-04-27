import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import {
    THREE,
    createAnimationLoop,
    createOrbitControls,
    createPerspectiveCamera,
    createRenderer,
    disposeMaterial,
    syncRendererSize,
} from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");

const shell = renderLessonShell(app, {
    title: "Materials",
    lessonLabel: "Demo 03 - Materials",
    nextHref: "../04-lighting/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Material Type</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-type="standard">Standard</button>
                <button class="select-button" data-type="basic">Basic</button>
                <button class="select-button" data-type="normal">Normal</button>
                <button class="select-button" data-type="phong">Phong</button>
                <button class="select-button" data-type="lambert">Lambert</button>
                <button class="select-button" data-type="toon">Toon</button>
            </div>
            <div class="info-box">
                Standard is the most general-purpose physically based material. The lesson shows how the same mesh reacts when the shading model changes.
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Material Properties</h2>
            <div class="control-group">
                <label class="control-label" for="color">Base color</label>
                <div class="control-row">
                    <input type="color" id="color" value="#4ecdc4">
                </div>
            </div>
            <div class="control-group" id="metalnessGroup">
                <label class="control-label" for="metalness">Metalness</label>
                <div class="control-row">
                    <input type="range" id="metalness" min="0" max="1" step="0.01" value="0.5">
                    <span class="value-chip" id="metalnessValue">0.50</span>
                </div>
            </div>
            <div class="control-group" id="roughnessGroup">
                <label class="control-label" for="roughness">Roughness</label>
                <div class="control-row">
                    <input type="range" id="roughness" min="0" max="1" step="0.01" value="0.5">
                    <span class="value-chip" id="roughnessValue">0.50</span>
                </div>
            </div>
            <div class="control-group" id="emissiveGroup">
                <label class="control-label" for="emissive">Emissive color</label>
                <div class="control-row">
                    <input type="color" id="emissive" value="#000000">
                    <input type="range" id="emissiveIntensity" min="0" max="2" step="0.1" value="0">
                    <span class="value-chip" id="emissiveIntensityValue">0.0</span>
                </div>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="wireframe">
                    <label class="control-label" for="wireframe">Wireframe</label>
                </div>
            </div>
            <div class="control-group">
                <div class="toggle-row">
                    <input type="checkbox" id="flatShading">
                    <label class="control-label" for="flatShading">Flat shading</label>
                </div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Lighting</h2>
            <div class="control-group" id="ambientGroup">
                <label class="control-label" for="ambientLightIntensity">Ambient intensity</label>
                <div class="control-row">
                    <input type="range" id="ambientLightIntensity" min="0" max="1" step="0.05" value="0.3">
                    <span class="value-chip" id="ambientLightValue">0.30</span>
                </div>
            </div>
            <div class="control-group" id="dirLightGroup">
                <label class="control-label" for="dirLightIntensity">Directional intensity</label>
                <div class="control-row">
                    <input type="range" id="dirLightIntensity" min="0" max="2" step="0.05" value="1">
                    <span class="value-chip" id="dirLightValue">1.00</span>
                </div>
            </div>
            <div class="info-box">Metalness, roughness, and emissive intensity matter most on Standard material.</div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Procedural Texture</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-texture="checker">Checker</button>
                <button class="select-button" data-texture="gradient">Gradient</button>
                <button class="select-button" data-texture="noise">Noise</button>
                <button class="select-button" data-texture="grid">Grid</button>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Code Preview</h2>
            <div class="code-preview" id="codePreview"></div>
        </section>

        <button class="primary-button" id="resetBtn">Reset Lesson</button>

        <section class="panel">
            <h2 class="panel__title">Study Notes</h2>
            <ul class="tips-list">
                <li>Compare how each material responds to the same lighting setup.</li>
                <li>Use metalness and roughness together instead of in isolation.</li>
                <li>Flat shading exposes polygon structure clearly on curved meshes.</li>
                <li>Procedural textures make it easier to see UV-driven surface changes.</li>
            </ul>
        </section>
    `,
    statsContent: statsRows([{ id: "currentMaterial", label: "Material", value: "Standard" }]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const focusTarget = new THREE.Vector3(0, 0.2, 0);
const camera = createPerspectiveCamera(container, {
    fov: 60,
    position: { x: 4.8, y: 3.2, z: 5.2 },
});
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
controls.target.copy(focusTarget);
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 20);
pointLight.position.set(-5, 5, -5);
scene.add(pointLight);

const geometry = new THREE.SphereGeometry(1.5, 64, 64);
let mesh = null;

const elements = {
    materialButtons: Array.from(document.querySelectorAll("[data-type]")),
    textureButtons: Array.from(document.querySelectorAll("[data-texture]")),
    color: document.getElementById("color"),
    metalness: document.getElementById("metalness"),
    metalnessValue: document.getElementById("metalnessValue"),
    roughness: document.getElementById("roughness"),
    roughnessValue: document.getElementById("roughnessValue"),
    emissive: document.getElementById("emissive"),
    emissiveIntensity: document.getElementById("emissiveIntensity"),
    emissiveIntensityValue: document.getElementById("emissiveIntensityValue"),
    wireframe: document.getElementById("wireframe"),
    flatShading: document.getElementById("flatShading"),
    ambientLightIntensity: document.getElementById("ambientLightIntensity"),
    ambientLightValue: document.getElementById("ambientLightValue"),
    dirLightIntensity: document.getElementById("dirLightIntensity"),
    dirLightValue: document.getElementById("dirLightValue"),
    metalnessGroup: document.getElementById("metalnessGroup"),
    roughnessGroup: document.getElementById("roughnessGroup"),
    emissiveGroup: document.getElementById("emissiveGroup"),
    ambientGroup: document.getElementById("ambientGroup"),
    dirLightGroup: document.getElementById("dirLightGroup"),
    currentMaterial: document.getElementById("currentMaterial"),
    codePreview: document.getElementById("codePreview"),
    resetBtn: document.getElementById("resetBtn"),
};

const defaultState = {
    type: "standard",
    texture: "checker",
    color: "#4ecdc4",
    metalness: 0.5,
    roughness: 0.5,
    emissive: "#000000",
    emissiveIntensity: 0,
    wireframe: false,
    flatShading: false,
    ambientLightIntensity: 0.3,
    dirLightIntensity: 1,
};

const state = { ...defaultState };

function makeCanvasTexture(draw) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext("2d");
    draw(context, textureCanvas.width, textureCanvas.height);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
}

const textures = {
    checker: makeCanvasTexture((ctx, width, height) => {
        const tile = 32;
        for (let y = 0; y < height; y += tile) {
            for (let x = 0; x < width; x += tile) {
                ctx.fillStyle = ((x + y) / tile) % 2 === 0 ? "#ffffff" : "#888888";
                ctx.fillRect(x, y, tile, tile);
            }
        }
    }),
    gradient: makeCanvasTexture((ctx, width, height) => {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#ff6b6b");
        gradient.addColorStop(0.5, "#4ecdc4");
        gradient.addColorStop(1, "#45b7d1");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }),
    noise: makeCanvasTexture((ctx, width, height) => {
        const imageData = ctx.createImageData(width, height);
        for (let index = 0; index < imageData.data.length; index += 4) {
            const value = Math.floor(Math.random() * 200 + 55);
            imageData.data[index] = value;
            imageData.data[index + 1] = value;
            imageData.data[index + 2] = value;
            imageData.data[index + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }),
    grid: makeCanvasTexture((ctx, width, height) => {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#4ecdc4";
        ctx.lineWidth = 2;
        const gap = 32;
        for (let offset = 0; offset <= width; offset += gap) {
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            ctx.lineTo(offset, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, offset);
            ctx.lineTo(width, offset);
            ctx.stroke();
        }
    }),
};

function createMaterial() {
    const common = {
        color: state.color,
        map: textures[state.texture],
        wireframe: state.wireframe,
    };

    switch (state.type) {
        case "basic":
            return new THREE.MeshBasicMaterial(common);
        case "normal":
            return new THREE.MeshNormalMaterial({ wireframe: state.wireframe, flatShading: state.flatShading });
        case "phong":
            return new THREE.MeshPhongMaterial({ ...common, shininess: 100, flatShading: state.flatShading });
        case "lambert":
            return new THREE.MeshLambertMaterial(common);
        case "toon":
            return new THREE.MeshToonMaterial(common);
        case "standard":
        default:
            return new THREE.MeshStandardMaterial({
                ...common,
                metalness: state.metalness,
                roughness: state.roughness,
                emissive: new THREE.Color(state.emissive),
                emissiveIntensity: state.emissiveIntensity,
                flatShading: state.flatShading,
            });
    }
}

function updateMaterialAvailability() {
    const enabled = state.type === "standard";
    elements.metalnessGroup.classList.toggle("control-group--disabled", !enabled);
    elements.roughnessGroup.classList.toggle("control-group--disabled", !enabled);
    elements.emissiveGroup.classList.toggle("control-group--disabled", !enabled);
    elements.ambientGroup.classList.toggle("control-group--disabled", !enabled);
    elements.dirLightGroup.classList.toggle("control-group--disabled", !enabled);
}

function updateCodePreview() {
    const materialName = `Mesh${state.type.charAt(0).toUpperCase()}${state.type.slice(1)}Material`;
    const lines = [
        `<span class="comment">// ${materialName}</span>`,
        `<span class="keyword">const</span> material = <span class="keyword">new</span> THREE.${materialName}({`,
        `  color: <span class="string">"${state.color}"</span>,`,
    ];

    if (state.type === "standard") {
        lines.push(`  metalness: <span class="number">${state.metalness.toFixed(2)}</span>,`);
        lines.push(`  roughness: <span class="number">${state.roughness.toFixed(2)}</span>,`);
        lines.push(`  emissiveIntensity: <span class="number">${state.emissiveIntensity.toFixed(1)}</span>,`);
    }

    lines.push(`  wireframe: <span class="keyword">${state.wireframe}</span>,`);
    lines.push(`  flatShading: <span class="keyword">${state.flatShading}</span>,`);
    lines.push(`});`);
    elements.codePreview.innerHTML = lines.join("\n");
}

function rebuildMesh() {
    if (mesh) {
        scene.remove(mesh);
        disposeMaterial(mesh.material);
    }
    mesh = new THREE.Mesh(geometry, createMaterial());
    scene.add(mesh);
    elements.currentMaterial.textContent = state.type;
    updateMaterialAvailability();
    updateCodePreview();
}

function applyLighting() {
    ambientLight.intensity = state.ambientLightIntensity;
    directionalLight.intensity = state.dirLightIntensity;
}

function syncUiFromState() {
    elements.color.value = state.color;
    elements.metalness.value = String(state.metalness);
    elements.metalnessValue.textContent = state.metalness.toFixed(2);
    elements.roughness.value = String(state.roughness);
    elements.roughnessValue.textContent = state.roughness.toFixed(2);
    elements.emissive.value = state.emissive;
    elements.emissiveIntensity.value = String(state.emissiveIntensity);
    elements.emissiveIntensityValue.textContent = state.emissiveIntensity.toFixed(1);
    elements.wireframe.checked = state.wireframe;
    elements.flatShading.checked = state.flatShading;
    elements.ambientLightIntensity.value = String(state.ambientLightIntensity);
    elements.ambientLightValue.textContent = state.ambientLightIntensity.toFixed(2);
    elements.dirLightIntensity.value = String(state.dirLightIntensity);
    elements.dirLightValue.textContent = state.dirLightIntensity.toFixed(2);
    elements.materialButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.type === state.type));
    elements.textureButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.texture === state.texture));
}

elements.materialButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.type = button.dataset.type;
        syncUiFromState();
        rebuildMesh();
    });
});

elements.textureButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.texture = button.dataset.texture;
        syncUiFromState();
        rebuildMesh();
    });
});

elements.color.addEventListener("input", (event) => { state.color = event.target.value; rebuildMesh(); });
elements.metalness.addEventListener("input", (event) => { state.metalness = Number(event.target.value); syncUiFromState(); rebuildMesh(); });
elements.roughness.addEventListener("input", (event) => { state.roughness = Number(event.target.value); syncUiFromState(); rebuildMesh(); });
elements.emissive.addEventListener("input", (event) => { state.emissive = event.target.value; rebuildMesh(); });
elements.emissiveIntensity.addEventListener("input", (event) => { state.emissiveIntensity = Number(event.target.value); syncUiFromState(); rebuildMesh(); });
elements.wireframe.addEventListener("change", (event) => { state.wireframe = event.target.checked; rebuildMesh(); });
elements.flatShading.addEventListener("change", (event) => { state.flatShading = event.target.checked; rebuildMesh(); });
elements.ambientLightIntensity.addEventListener("input", (event) => { state.ambientLightIntensity = Number(event.target.value); syncUiFromState(); applyLighting(); });
elements.dirLightIntensity.addEventListener("input", (event) => { state.dirLightIntensity = Number(event.target.value); syncUiFromState(); applyLighting(); });
elements.resetBtn.addEventListener("click", () => {
    Object.assign(state, defaultState);
    syncUiFromState();
    applyLighting();
    camera.position.set(4.8, 3.2, 5.2);
    controls.target.copy(focusTarget);
    controls.update();
    rebuildMesh();
});

const loop = createAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
});

window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));

syncUiFromState();
applyLighting();
rebuildMesh();
syncRendererSize(renderer, camera, container);
loop.start();

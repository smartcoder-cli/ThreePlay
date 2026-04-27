import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
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
    title: "Geometries",
    lessonLabel: "Demo 02 - Geometries",
    nextHref: "../03-materials/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Core Shapes</h2>
            <div class="button-grid button-grid--three">
                <button class="select-button is-active" data-type="box">
                    <span class="select-button__icon">B</span>Box
                </button>
                <button class="select-button" data-type="sphere">
                    <span class="select-button__icon">S</span>Sphere
                </button>
                <button class="select-button" data-type="cylinder">
                    <span class="select-button__icon">C</span>Cylinder
                </button>
                <button class="select-button" data-type="cone">
                    <span class="select-button__icon">N</span>Cone
                </button>
                <button class="select-button" data-type="torus">
                    <span class="select-button__icon">T</span>Torus
                </button>
                <button class="select-button" data-type="plane">
                    <span class="select-button__icon">P</span>Plane
                </button>
            </div>
            <div class="info-box">
                <strong>BufferGeometry</strong> stores vertex data in typed arrays. This lesson makes the topology changes visible as you change segments and shape type.
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Parameters</h2>
            <div class="control-group">
                <label class="control-label" for="size">Size</label>
                <div class="control-row">
                    <input type="range" id="size" min="0.5" max="3" step="0.1" value="1">
                    <span class="value-chip" id="sizeValue">1.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="segments">Segments</label>
                <div class="control-row">
                    <input type="range" id="segments" min="3" max="64" step="1" value="32">
                    <span class="value-chip" id="segmentsValue">32</span>
                </div>
            </div>
            <div class="control-group" id="radiusGroup">
                <label class="control-label" for="radius">Tube radius</label>
                <div class="control-row">
                    <input type="range" id="radius" min="0.1" max="2" step="0.1" value="0.4">
                    <span class="value-chip" id="radiusValue">0.4</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="color">Color</label>
                <div class="control-row">
                    <input type="color" id="color" value="#4ecdc4">
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
                    <input type="checkbox" id="showNormals">
                    <label class="control-label" for="showNormals">Normal helper</label>
                </div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Geometry Info</h2>
            <div class="info-list">
                <div>Vertices: <strong id="vertexCount">24</strong></div>
                <div>Triangles: <strong id="triangleCount">12</strong></div>
                <div>Attributes: <strong>position, normal, uv</strong></div>
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
                <li>Increase segments and compare how round surfaces gain fidelity.</li>
                <li>Enable wireframe to inspect topology instead of surface shading.</li>
                <li>Switch between primitives and compare vertex counts directly.</li>
                <li>Use normal helpers to connect geometry changes with lighting response.</li>
            </ul>
        </section>
    `,
    statsContent: statsRows([
        { id: "vertices", label: "Vertices", value: "0" },
        { id: "triangles", label: "Triangles", value: "0" },
        { id: "faces", label: "Faces", value: "0" },
    ]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const focusTarget = new THREE.Vector3(0, -0.4, 0);
const camera = createPerspectiveCamera(container, {
    fov: 60,
    position: { x: 3.4, y: 2.4, z: 4.2 },
});
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
controls.target.copy(focusTarget);
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const elements = {
    typeButtons: Array.from(document.querySelectorAll("[data-type]")),
    size: document.getElementById("size"),
    sizeValue: document.getElementById("sizeValue"),
    segments: document.getElementById("segments"),
    segmentsValue: document.getElementById("segmentsValue"),
    radius: document.getElementById("radius"),
    radiusValue: document.getElementById("radiusValue"),
    radiusGroup: document.getElementById("radiusGroup"),
    color: document.getElementById("color"),
    wireframe: document.getElementById("wireframe"),
    showNormals: document.getElementById("showNormals"),
    vertices: document.getElementById("vertices"),
    triangles: document.getElementById("triangles"),
    faces: document.getElementById("faces"),
    vertexCount: document.getElementById("vertexCount"),
    triangleCount: document.getElementById("triangleCount"),
    codePreview: document.getElementById("codePreview"),
    resetBtn: document.getElementById("resetBtn"),
};

const defaultState = {
    type: "box",
    size: 1,
    segments: 32,
    radius: 0.4,
    color: "#4ecdc4",
    wireframe: false,
    showNormals: false,
};

const state = { ...defaultState };

let currentMesh = null;
let normalHelper = null;

function createGeometry(type, params) {
    const { size, segments, radius } = params;

    switch (type) {
        case "sphere":
            return new THREE.SphereGeometry(size / 2, segments, segments);
        case "cylinder":
            return new THREE.CylinderGeometry(size / 2, size / 2, size, segments);
        case "cone":
            return new THREE.ConeGeometry(size / 2, size, segments);
        case "torus":
            return new THREE.TorusGeometry(size / 2, radius, segments, segments * 2);
        case "plane":
            return new THREE.PlaneGeometry(size * 2, size * 2, segments, segments);
        case "box":
        default:
            return new THREE.BoxGeometry(size, size, size);
    }
}

function buildCodePreview(type, size, segments, radius) {
    const previews = {
        box: [
            `<span class="comment">// box</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.BoxGeometry(`,
            `  <span class="number">${size.toFixed(1)}</span>, <span class="comment">// width</span>`,
            `  <span class="number">${size.toFixed(1)}</span>, <span class="comment">// height</span>`,
            `  <span class="number">${size.toFixed(1)}</span> <span class="comment">// depth</span>`,
            `);`,
        ],
        sphere: [
            `<span class="comment">// sphere</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.SphereGeometry(`,
            `  <span class="number">${(size / 2).toFixed(1)}</span>, <span class="comment">// radius</span>`,
            `  <span class="number">${segments}</span>, <span class="comment">// widthSegments</span>`,
            `  <span class="number">${segments}</span> <span class="comment">// heightSegments</span>`,
            `);`,
        ],
        cylinder: [
            `<span class="comment">// cylinder</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.CylinderGeometry(`,
            `  <span class="number">${(size / 2).toFixed(1)}</span>, <span class="comment">// radiusTop</span>`,
            `  <span class="number">${(size / 2).toFixed(1)}</span>, <span class="comment">// radiusBottom</span>`,
            `  <span class="number">${size.toFixed(1)}</span>, <span class="comment">// height</span>`,
            `  <span class="number">${segments}</span> <span class="comment">// radialSegments</span>`,
            `);`,
        ],
        cone: [
            `<span class="comment">// cone</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.ConeGeometry(`,
            `  <span class="number">${(size / 2).toFixed(1)}</span>, <span class="comment">// radius</span>`,
            `  <span class="number">${size.toFixed(1)}</span>, <span class="comment">// height</span>`,
            `  <span class="number">${segments}</span> <span class="comment">// radialSegments</span>`,
            `);`,
        ],
        torus: [
            `<span class="comment">// torus</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.TorusGeometry(`,
            `  <span class="number">${(size / 2).toFixed(1)}</span>, <span class="comment">// radius</span>`,
            `  <span class="number">${radius.toFixed(1)}</span>, <span class="comment">// tube</span>`,
            `  <span class="number">${segments}</span>, <span class="comment">// radialSegments</span>`,
            `  <span class="number">${segments * 2}</span> <span class="comment">// tubularSegments</span>`,
            `);`,
        ],
        plane: [
            `<span class="comment">// plane</span>`,
            `<span class="keyword">const</span> geometry = <span class="keyword">new</span> THREE.PlaneGeometry(`,
            `  <span class="number">${(size * 2).toFixed(1)}</span>, <span class="comment">// width</span>`,
            `  <span class="number">${(size * 2).toFixed(1)}</span>, <span class="comment">// height</span>`,
            `  <span class="number">${segments}</span>, <span class="comment">// widthSegments</span>`,
            `  <span class="number">${segments}</span> <span class="comment">// heightSegments</span>`,
            `);`,
        ],
    };

    return previews[type].join("\n");
}

function clearCurrentMesh() {
    if (normalHelper) {
        scene.remove(normalHelper);
        normalHelper = null;
    }

    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        disposeMaterial(currentMesh.material);
        currentMesh = null;
    }
}

function updateGeometryInfo(geometry) {
    const vertices = geometry.attributes.position.count;
    const triangles = geometry.index ? geometry.index.count / 3 : vertices / 3;
    const faceCount = Math.floor(triangles);

    elements.vertices.textContent = String(vertices);
    elements.triangles.textContent = String(faceCount);
    elements.faces.textContent = String(faceCount);
    elements.vertexCount.textContent = String(vertices);
    elements.triangleCount.textContent = String(faceCount);
}

function updateMesh() {
    clearCurrentMesh();

    const geometry = createGeometry(state.type, state);
    const material = new THREE.MeshStandardMaterial({
        color: state.color,
        wireframe: state.wireframe,
        side: THREE.DoubleSide,
    });

    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);

    if (state.showNormals) {
        normalHelper = new VertexNormalsHelper(currentMesh, 0.2, 0xff6b6b);
        scene.add(normalHelper);
    }

    updateGeometryInfo(geometry);
    elements.codePreview.innerHTML = buildCodePreview(
        state.type,
        state.size,
        state.segments,
        state.radius,
    );
}

function updateControlsFromState() {
    elements.size.value = String(state.size);
    elements.sizeValue.textContent = state.size.toFixed(1);
    elements.segments.value = String(state.segments);
    elements.segmentsValue.textContent = String(state.segments);
    elements.radius.value = String(state.radius);
    elements.radiusValue.textContent = state.radius.toFixed(1);
    elements.color.value = state.color;
    elements.wireframe.checked = state.wireframe;
    elements.showNormals.checked = state.showNormals;
    elements.radiusGroup.style.display = state.type === "torus" ? "block" : "none";

    elements.typeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.type === state.type);
    });
}

function resetLesson() {
    Object.assign(state, defaultState);
    updateControlsFromState();
    camera.position.set(3.4, 2.4, 4.2);
    controls.target.copy(focusTarget);
    controls.update();
    updateMesh();
}

elements.typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        state.type = button.dataset.type;
        updateControlsFromState();
        updateMesh();
    });
});

elements.size.addEventListener("input", (event) => {
    state.size = Number(event.target.value);
    elements.sizeValue.textContent = state.size.toFixed(1);
    updateMesh();
});

elements.segments.addEventListener("input", (event) => {
    state.segments = Number(event.target.value);
    elements.segmentsValue.textContent = String(state.segments);
    updateMesh();
});

elements.radius.addEventListener("input", (event) => {
    state.radius = Number(event.target.value);
    elements.radiusValue.textContent = state.radius.toFixed(1);
    updateMesh();
});

elements.color.addEventListener("input", (event) => {
    state.color = event.target.value;
    updateMesh();
});

elements.wireframe.addEventListener("change", (event) => {
    state.wireframe = event.target.checked;
    updateMesh();
});

elements.showNormals.addEventListener("change", (event) => {
    state.showNormals = event.target.checked;
    updateMesh();
});

elements.resetBtn.addEventListener("click", resetLesson);

const loop = createAnimationLoop(() => {
    controls.update();
    if (normalHelper) {
        normalHelper.update();
    }
    renderer.render(scene, camera);
});

function handleResize() {
    syncRendererSize(renderer, camera, container);
}

window.addEventListener("resize", handleResize);

updateControlsFromState();
updateMesh();
handleResize();
loop.start();

import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
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
    title: "Particles",
    lessonLabel: "Demo 07 - Particles",
    nextHref: "../08-physics/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Particle Preset</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-type="snow">Snow</button>
                <button class="select-button" data-type="fire">Fire</button>
                <button class="select-button" data-type="stars">Stars</button>
                <button class="select-button" data-type="fountain">Fountain</button>
            </div>
        </section>
        <section class="panel">
            <h2 class="panel__title">Particle Settings</h2>
            <div class="control-group"><label class="control-label" for="count">Count</label><div class="control-row"><input id="count" type="range" min="100" max="10000" step="100" value="2000"><span class="value-chip" id="countValue">2000</span></div></div>
            <div class="control-group"><label class="control-label" for="size">Size</label><div class="control-row"><input id="size" type="range" min="0.1" max="2" step="0.1" value="0.5"><span class="value-chip" id="sizeValue">0.5</span></div></div>
            <div class="control-group"><label class="control-label" for="speed">Speed</label><div class="control-row"><input id="speed" type="range" min="0.1" max="3" step="0.1" value="1"><span class="value-chip" id="speedValue">1.0</span></div></div>
            <div class="control-group"><label class="control-label" for="color">Color</label><div class="control-row"><input id="color" type="color" value="#4ecdc4"></div></div>
            <div class="control-group"><div class="toggle-row"><input id="blending" type="checkbox" checked><label class="control-label" for="blending">Additive blending</label></div></div>
            <div class="control-group"><div class="toggle-row"><input id="gravity" type="checkbox" checked><label class="control-label" for="gravity">Apply gravity</label></div></div>
        </section>
        <button class="primary-button" id="resetBtn">Reset Lesson</button>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Points are much cheaper than rendering thousands of meshes.</li><li>Per-particle motion usually comes from position buffers plus a simple update rule.</li><li>Additive blending works well for fire, stars, and glow-like effects.</li><li>Particle count is often the first performance lever.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "particleCount", label: "Count", value: "2000" }, { id: "fps", label: "FPS", value: "0" }]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 10, z: 20 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const elements = {
    typeButtons: Array.from(document.querySelectorAll("[data-type]")),
    count: document.getElementById("count"), countValue: document.getElementById("countValue"),
    size: document.getElementById("size"), sizeValue: document.getElementById("sizeValue"),
    speed: document.getElementById("speed"), speedValue: document.getElementById("speedValue"),
    color: document.getElementById("color"), blending: document.getElementById("blending"),
    gravity: document.getElementById("gravity"), resetBtn: document.getElementById("resetBtn"),
    particleCount: document.getElementById("particleCount"), fps: document.getElementById("fps"),
};
const defaults = { type: "snow", count: 2000, size: 0.5, speed: 1, color: "#4ecdc4", blending: true, gravity: true };
const state = { ...defaults };
let system = null;
let frameCount = 0;
let lastFps = performance.now();

function buildSystem() {
    if (system) { scene.remove(system); system.geometry.dispose(); system.material.dispose(); }
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(state.count * 3);
    const velocities = new Float32Array(state.count * 3);
    for (let i = 0; i < state.count; i += 1) {
        const offset = i * 3;
        positions[offset] = (Math.random() - 0.5) * 20;
        positions[offset + 1] = Math.random() * 15;
        positions[offset + 2] = (Math.random() - 0.5) * 20;
        if (state.type === "fountain") {
            positions[offset] = 0; positions[offset + 1] = 0; positions[offset + 2] = 0;
            velocities[offset] = (Math.random() - 0.5) * 0.08;
            velocities[offset + 1] = 0.12 + Math.random() * 0.08;
            velocities[offset + 2] = (Math.random() - 0.5) * 0.08;
        } else {
            velocities[offset] = (Math.random() - 0.5) * 0.02;
            velocities[offset + 1] = state.type === "fire" ? 0.03 + Math.random() * 0.04 : -(0.01 + Math.random() * 0.03);
            velocities[offset + 2] = (Math.random() - 0.5) * 0.02;
        }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    const material = new THREE.PointsMaterial({
        color: state.color, size: state.size, transparent: true, opacity: 0.9,
        blending: state.blending ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false,
    });
    system = new THREE.Points(geometry, material);
    scene.add(system);
    elements.particleCount.textContent = String(state.count);
}

function resetParticle(offset, positions, velocities) {
    positions[offset] = (Math.random() - 0.5) * 20;
    positions[offset + 1] = state.type === "fire" ? 0 : 15;
    positions[offset + 2] = (Math.random() - 0.5) * 20;
    velocities[offset] = (Math.random() - 0.5) * 0.02;
    velocities[offset + 1] = state.type === "fire" ? 0.03 + Math.random() * 0.04 : -(0.01 + Math.random() * 0.03);
    velocities[offset + 2] = (Math.random() - 0.5) * 0.02;
}

function syncUi() {
    elements.count.value = String(state.count); elements.countValue.textContent = String(state.count);
    elements.size.value = String(state.size); elements.sizeValue.textContent = state.size.toFixed(1);
    elements.speed.value = String(state.speed); elements.speedValue.textContent = state.speed.toFixed(1);
    elements.color.value = state.color; elements.blending.checked = state.blending; elements.gravity.checked = state.gravity;
    elements.typeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.type === state.type));
}

elements.typeButtons.forEach((button) => button.addEventListener("click", () => { state.type = button.dataset.type; syncUi(); buildSystem(); }));
["count", "size", "speed"].forEach((id) => elements[id].addEventListener("input", (event) => { state[id] = Number(event.target.value); syncUi(); if (id !== "speed") buildSystem(); }));
elements.color.addEventListener("input", (event) => { state.color = event.target.value; buildSystem(); });
elements.blending.addEventListener("change", (event) => { state.blending = event.target.checked; buildSystem(); });
elements.gravity.addEventListener("change", (event) => { state.gravity = event.target.checked; });
elements.resetBtn.addEventListener("click", () => { Object.assign(state, defaults); syncUi(); buildSystem(); });

const loop = createAnimationLoop(() => {
    const positions = system.geometry.attributes.position.array;
    const velocities = system.geometry.attributes.velocity.array;
    for (let i = 0; i < state.count; i += 1) {
        const offset = i * 3;
        positions[offset] += velocities[offset] * state.speed;
        positions[offset + 1] += velocities[offset + 1] * state.speed;
        positions[offset + 2] += velocities[offset + 2] * state.speed;
        if (state.gravity && state.type !== "stars") velocities[offset + 1] -= 0.0008 * state.speed;
        if (state.type === "stars") positions[offset + 2] += 0.08 * state.speed;
        if (positions[offset + 1] < -2 || positions[offset + 1] > 18 || positions[offset + 2] > 12) resetParticle(offset, positions, velocities);
    }
    system.geometry.attributes.position.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
    frameCount += 1;
    const now = performance.now();
    if (now - lastFps > 1000) { elements.fps.textContent = String(frameCount); frameCount = 0; lastFps = now; }
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncUi(); buildSystem(); syncRendererSize(renderer, camera, container); loop.start();

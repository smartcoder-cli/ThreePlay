import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "WebGPU",
    lessonLabel: "Demo 16 - WebGPU",
    nextHref: "../17-responsive/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Renderer Context</h2><div class="hint-box"><div id="gpuSupport">Checking browser support...</div></div></section>
        <section class="panel"><h2 class="panel__title">Compare Concepts</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-view="pipeline">Pipeline</button>
            <button class="select-button" data-view="buffers">Buffers</button>
            <button class="select-button" data-view="compute">Compute</button>
            <button class="select-button" data-view="bindgroups">Bind Groups</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>WebGPU exposes more explicit control than traditional WebGL.</li><li>Pipelines, bind groups, and buffers become first-class concepts.</li><li>Compute shaders open workflows outside graphics-only rendering.</li><li>Support depends on browser, OS, and GPU driver state.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "modeLabel", label: "View", value: "Pipeline" }]),
});
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 2, z: 7 } });
const renderer = createRenderer(canvas, 0x111827);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 0.9); light.position.set(5, 8, 5); scene.add(light);
const nodes = [];
for (let i = 0; i < 4; i += 1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 4, 0.7, 0.55) }));
    mesh.position.x = (i - 1.5) * 1.8;
    scene.add(mesh);
    nodes.push(mesh);
}
const supportLine = document.getElementById("gpuSupport");
supportLine.textContent = navigator.gpu ? "WebGPU API is exposed in this browser. This lesson still renders with WebGL for compatibility." : "WebGPU API is not exposed here. The lesson shows concepts using a compatibility-friendly scene.";
const modeLabel = document.getElementById("modeLabel");
const state = { view: "pipeline" };
Array.from(document.querySelectorAll("[data-view]")).forEach((button) => button.addEventListener("click", () => {
    state.view = button.dataset.view;
    modeLabel.textContent = state.view.charAt(0).toUpperCase() + state.view.slice(1);
    Array.from(document.querySelectorAll("[data-view]")).forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.view));
}));
const loop = createAnimationLoop((time) => {
    nodes.forEach((mesh, index) => {
        mesh.rotation.x = time * 0.0004 * (index + 1);
        mesh.rotation.y = time * 0.0005 * (index + 1);
        mesh.position.y = Math.sin(time * 0.001 + index) * (state.view === "compute" ? 0.8 : 0.3);
    });
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncRendererSize(renderer, camera, container); loop.start();

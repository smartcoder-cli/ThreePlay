import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Final Project",
    lessonLabel: "Demo 18 - Final Project",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Showcase Modes</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-mode="gallery">Gallery</button>
            <button class="select-button" data-mode="lights">Light Show</button>
            <button class="select-button" data-mode="orbit">Slow Orbit</button>
            <button class="select-button" data-mode="focus">Focus Piece</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Project Notes</h2><ul class="tips-list"><li>This scene combines layout, lighting, animation, and reusable primitives.</li><li>The goal is composition: multiple ideas in one coherent environment.</li><li>Final projects are where shared infrastructure starts paying for itself.</li><li>From here the next step is polishing, asset loading, and production structure.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "objectsLabel", label: "Objects", value: "9" }, { id: "modeLabel", label: "Mode", value: "Gallery" }]),
});
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 5, z: 15 } });
const renderer = createRenderer(canvas, 0x12192a);
const controls = createOrbitControls(camera, canvas);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
scene.fog = new THREE.Fog(0x12192a, 20, 45);
scene.add(new THREE.AmbientLight(0x404060, 0.7));
const spot = new THREE.SpotLight(0xffffff, 1); spot.position.set(10, 20, 10); scene.add(spot);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
const grid = new THREE.GridHelper(40, 40, 0x444466, 0x333355); scene.add(grid);
const exhibits = [];
[
    [-6, -4, 0xff6b6b, "box"], [-2, -4, 0x4ecdc4, "sphere"], [2, -4, 0x45b7d1, "torus"], [6, -4, 0xffd93d, "cone"],
    [-4, 4, 0xa29bfe, "cylinder"], [0, 4, 0xfd79a8, "icosa"], [4, 4, 0x00b894, "octa"],
].forEach((item, index) => {
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0x333344 }));
    pedestal.position.set(item[0], 0.6, item[1]); scene.add(pedestal);
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    if (item[3] === "sphere") geometry = new THREE.SphereGeometry(0.7, 32, 32);
    if (item[3] === "torus") geometry = new THREE.TorusGeometry(0.6, 0.2, 16, 32);
    if (item[3] === "cone") geometry = new THREE.ConeGeometry(0.7, 1.4, 32);
    if (item[3] === "cylinder") geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32);
    if (item[3] === "icosa") geometry = new THREE.IcosahedronGeometry(0.8);
    if (item[3] === "octa") geometry = new THREE.OctahedronGeometry(0.8);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: item[2], metalness: 0.35, roughness: 0.35, emissive: item[2], emissiveIntensity: 0.08 }));
    mesh.position.set(item[0], 2.1, item[1]); scene.add(mesh);
    exhibits.push({ mesh, offset: index });
});
const modeLabel = document.getElementById("modeLabel");
const state = { mode: "gallery" };
Array.from(document.querySelectorAll("[data-mode]")).forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    modeLabel.textContent = button.textContent.trim();
    Array.from(document.querySelectorAll("[data-mode]")).forEach((item) => item.classList.toggle("is-active", item.dataset.mode === state.mode));
}));
const loop = createAnimationLoop((time) => {
    exhibits.forEach((entry, index) => {
        entry.mesh.rotation.y += 0.01 + index * 0.0005;
        entry.mesh.position.y = 2.1 + Math.sin(time * 0.0015 + entry.offset) * (state.mode === "focus" ? 0.1 : 0.25);
    });
    controls.autoRotate = state.mode === "orbit" || state.mode === "gallery";
    if (state.mode === "focus") camera.position.lerp(new THREE.Vector3(0, 4, 8), 0.03);
    if (state.mode === "lights") spot.intensity = 1 + Math.sin(time * 0.003) * 0.4;
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncRendererSize(renderer, camera, container); loop.start();

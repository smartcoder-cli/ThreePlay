import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "VR and AR",
    lessonLabel: "Demo 14 - VR and AR",
    nextHref: "../15-terrain-skybox/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Immersion Mode</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-mode="mono">Mono</button>
            <button class="select-button" data-mode="stereo">Stereo</button>
            <button class="select-button" data-mode="overlay">AR Overlay</button>
            <button class="select-button" data-mode="room">Room Scale</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Status</h2><div class="hint-box"><div id="supportLine">This lesson simulates immersive presentation patterns in a normal browser tab.</div></div></section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>WebXR is the browser API used for real headset and AR sessions.</li><li>Stereo rendering means presenting two slightly offset eye views.</li><li>AR often mixes world content with camera passthrough or overlays.</li><li>Input and comfort rules change a lot in immersive contexts.</li></ul></section>
    `,
    statsContent: "",
});
shell.stats.remove();
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 2, z: 8 } });
const renderer = createRenderer(canvas, 0x0e1324);
const controls = createOrbitControls(camera, canvas);
const group = new THREE.Group();
scene.add(group);
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5, 10, 5); scene.add(light);
const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7, 0.05, 64, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x4ecdc4, transparent: true, opacity: 0.16 }),
);
horizon.position.y = -0.55;
scene.add(horizon);
const anchor = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.46, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.0 }),
);
anchor.rotation.x = -Math.PI / 2;
anchor.position.set(0, -0.48, 0);
scene.add(anchor);
for (let i = 0; i < 12; i += 1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 12, 0.7, 0.55) }));
    mesh.position.set(Math.cos(i / 12 * Math.PI * 2) * 3, Math.sin(i * 0.5) * 0.4, Math.sin(i / 12 * Math.PI * 2) * 3);
    group.add(mesh);
}
const floor = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.1, 64), new THREE.MeshBasicMaterial({ color: 0x4ecdc4, side: THREE.DoubleSide })); floor.rotation.x = -Math.PI / 2; group.add(floor);
const state = { mode: "mono" };
const supportLine = document.getElementById("supportLine");
Array.from(document.querySelectorAll("[data-mode]")).forEach((button) => button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    Array.from(document.querySelectorAll("[data-mode]")).forEach((item) => item.classList.toggle("is-active", item.dataset.mode === state.mode));
    supportLine.textContent =
        state.mode === "overlay"
            ? "AR overlay mode emphasizes anchored markers and a lighter pass-through feel."
            : state.mode === "stereo"
                ? "Stereo mode exaggerates left-right offset and depth layering."
                : state.mode === "room"
                    ? "Room-scale mode spreads objects into a larger walk-around volume."
                    : "Mono mode keeps a standard single-camera presentation.";
}));
const loop = createAnimationLoop((time) => {
    group.rotation.y += 0.004;
    group.scale.setScalar(1);
    horizon.scale.set(1, 1, 1);
    anchor.material.opacity = 0.0;

    if (state.mode === "stereo") {
        camera.position.x = Math.sin(time / 500) * 0.28;
        camera.position.y = 2;
        group.scale.set(1.08, 1, 1.08);
        renderer.setClearColor(0x10172d);
    } else if (state.mode === "room") {
        camera.position.x = 0;
        camera.position.y = 2 + Math.sin(time / 700) * 0.2;
        group.scale.set(1.38, 1.1, 1.38);
        horizon.scale.set(1.7, 1, 1.7);
        renderer.setClearColor(0x0e1324);
    } else if (state.mode === "overlay") {
        camera.position.x = 0;
        camera.position.y = 1.75;
        anchor.material.opacity = 0.95;
        horizon.scale.set(0.92, 1, 0.92);
        renderer.setClearColor(0x294552);
    } else {
        camera.position.x = 0;
        camera.position.y = 2;
        renderer.setClearColor(0x0e1324);
    }
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncRendererSize(renderer, camera, container); loop.start();

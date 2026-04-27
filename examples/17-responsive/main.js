import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Responsive",
    lessonLabel: "Demo 17 - Responsive",
    nextHref: "../18-project/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Layout Modes</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-layout="fit">Fit</button>
            <button class="select-button" data-layout="cover">Cover</button>
            <button class="select-button" data-layout="portrait">Portrait Focus</button>
            <button class="select-button" data-layout="landscape">Landscape Focus</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Responsive 3D is about both canvas sizing and camera behavior.</li><li>Portrait and landscape often need visibly different composition priorities.</li><li>UI chrome should not fight with the render surface on small screens.</li><li>Resize handling should update both renderer and projection state.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "viewportLabel", label: "Viewport", value: "0 x 0" }, { id: "modeLabel", label: "Mode", value: "Fit" }]),
});
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 2, z: 6 } });
const renderer = createRenderer(canvas, 0x132036);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const group = new THREE.Group(); scene.add(group);
const cards = [];
for (let i = 0; i < 6; i += 1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 6, 0.7, 0.55) }));
    mesh.position.set((i - 2.5) * 1.2, Math.sin(i) * 0.5, 0);
    group.add(mesh);
    cards.push(mesh);
}
const frame = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4.8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 }));
frame.position.z = -0.6;
group.add(frame);
const viewportLabel = document.getElementById("viewportLabel");
const modeLabel = document.getElementById("modeLabel");
const state = { layout: "fit" };
Array.from(document.querySelectorAll("[data-layout]")).forEach((button) => button.addEventListener("click", () => {
    state.layout = button.dataset.layout;
    modeLabel.textContent = button.textContent.trim();
    Array.from(document.querySelectorAll("[data-layout]")).forEach((item) => item.classList.toggle("is-active", item.dataset.layout === state.layout));
    applyLayout();
}));
function applyLayout() {
    const portrait = container.clientHeight > container.clientWidth;
    cards.forEach((mesh, index) => {
        mesh.scale.setScalar(1);
        mesh.position.x = (index - 2.5) * 1.2;
        mesh.position.y = Math.sin(index) * 0.5;
        mesh.position.z = 0;
    });
    group.rotation.z = 0;
    frame.scale.set(1, 1, 1);

    if (state.layout === "portrait" || (portrait && state.layout === "fit")) {
        camera.position.set(0, 3.9, 7.8);
        group.rotation.z = 0.08;
        cards.forEach((mesh, index) => {
            mesh.position.x = (index - 2.5) * 0.8;
            mesh.position.y = (2.5 - index) * 0.6;
        });
        frame.scale.set(0.72, 1.18, 1);
    } else if (state.layout === "landscape" || (!portrait && state.layout === "fit")) {
        camera.position.set(0, 2, 6);
        frame.scale.set(1.12, 0.86, 1);
    } else if (state.layout === "cover") {
        camera.position.set(0, 1.2, 4.2);
        cards.forEach((mesh) => mesh.scale.setScalar(1.35));
        frame.scale.set(1.24, 1.04, 1);
    }

    camera.lookAt(0, 0, 0);
    viewportLabel.textContent = `${container.clientWidth} x ${container.clientHeight}`;
}
const loop = createAnimationLoop(() => { group.rotation.y += 0.01; controls.update(); renderer.render(scene, camera); });
window.addEventListener("resize", () => { syncRendererSize(renderer, camera, container); applyLayout(); });
syncRendererSize(renderer, camera, container); applyLayout(); loop.start();

import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Terrain and Skybox",
    lessonLabel: "Demo 15 - Terrain and Skybox",
    nextHref: "../16-webgpu/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Environment</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-sky="day">Day</button><button class="select-button" data-sky="sunset">Sunset</button>
            <button class="select-button" data-sky="night">Night</button><button class="select-button" data-sky="mint">Mint</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Terrain</h2>
            <div class="control-group"><label class="control-label" for="height">Height scale</label><div class="control-row"><input id="height" type="range" min="0.5" max="4" step="0.1" value="2"><span class="value-chip" id="heightValue">2.0</span></div></div>
            <div class="control-group"><label class="control-label" for="frequency">Frequency</label><div class="control-row"><input id="frequency" type="range" min="0.5" max="4" step="0.1" value="1.2"><span class="value-chip" id="frequencyValue">1.2</span></div></div>
        </section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Terrain is often a displaced plane plus a custom color or splat strategy.</li><li>Skyboxes or sky domes establish mood before any objects are added.</li><li>Color gradients can sell atmosphere even without detailed textures.</li><li>Large scenes benefit from reusing procedural rules.</li></ul></section>
    `,
    statsContent: "",
});
shell.stats.remove();
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 8, z: 14 } });
const renderer = createRenderer(canvas, 0x7ea9ff);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5, 12, 6); scene.add(light);
scene.fog = new THREE.Fog(0x7ea9ff, 12, 32);
const terrainGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x5d8f49, wireframe: false, flatShading: true });
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial); terrain.rotation.x = -Math.PI / 2; scene.add(terrain);
const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 32), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x9fc7ff }));
scene.add(sky);
const sun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfff1b0 }));
sun.position.set(6, 10, -10);
scene.add(sun);
const stars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.0 }),
);
const starPositions = new Float32Array(180 * 3);
for (let i = 0; i < 180; i += 1) {
    const offset = i * 3;
    starPositions[offset] = (Math.random() - 0.5) * 70;
    starPositions[offset + 1] = 8 + Math.random() * 24;
    starPositions[offset + 2] = (Math.random() - 0.5) * 70;
}
stars.geometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
scene.add(stars);
const state = { sky: "day", height: 2, frequency: 1.2 };
const skyPresets = {
    day: {
        sky: 0x9fc7ff,
        fog: 0x8db3ff,
        terrain: 0x5d8f49,
        lightColor: 0xffffff,
        lightIntensity: 1.0,
        ambient: 0.7,
        sunColor: 0xfff1b0,
        sunY: 10,
        starOpacity: 0.0,
    },
    sunset: {
        sky: 0xff8c5a,
        fog: 0x7f3d5a,
        terrain: 0x7a5c45,
        lightColor: 0xffc38b,
        lightIntensity: 0.85,
        ambient: 0.45,
        sunColor: 0xffb067,
        sunY: 6.5,
        starOpacity: 0.08,
    },
    night: {
        sky: 0x121b3f,
        fog: 0x070b18,
        terrain: 0x243341,
        lightColor: 0x9bb7ff,
        lightIntensity: 0.35,
        ambient: 0.18,
        sunColor: 0xdfe9ff,
        sunY: 8.5,
        starOpacity: 0.95,
    },
    mint: {
        sky: 0x91f2dc,
        fog: 0x2f7a73,
        terrain: 0x4f8f7b,
        lightColor: 0xd7fff6,
        lightIntensity: 0.9,
        ambient: 0.58,
        sunColor: 0xe9fff7,
        sunY: 9.2,
        starOpacity: 0.02,
    },
};
const elements = { height: document.getElementById("height"), heightValue: document.getElementById("heightValue"), frequency: document.getElementById("frequency"), frequencyValue: document.getElementById("frequencyValue") };
function rebuildTerrain() {
    const positions = terrainGeometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = Math.sin(x * state.frequency * 0.4) * Math.cos(y * state.frequency * 0.35) * state.height;
        positions.setZ(i, z);
    }
    positions.needsUpdate = true;
    terrainGeometry.computeVertexNormals();
}
function applySky() {
    const preset = skyPresets[state.sky];
    sky.material.color.setHex(preset.sky);
    terrain.material.color.setHex(preset.terrain);
    renderer.setClearColor(preset.sky);
    scene.fog.color.setHex(preset.fog);
    light.color.setHex(preset.lightColor);
    light.intensity = preset.lightIntensity;
    scene.children.find((item) => item.isAmbientLight).intensity = preset.ambient;
    sun.material.color.setHex(preset.sunColor);
    sun.position.set(6, preset.sunY, -10);
    stars.material.opacity = preset.starOpacity;
}
Array.from(document.querySelectorAll("[data-sky]")).forEach((button) => button.addEventListener("click", () => {
    state.sky = button.dataset.sky;
    Array.from(document.querySelectorAll("[data-sky]")).forEach((item) => item.classList.toggle("is-active", item.dataset.sky === state.sky));
    applySky();
}));
["height", "frequency"].forEach((id) => elements[id].addEventListener("input", (event) => { state[id] = Number(event.target.value); elements[`${id}Value`].textContent = state[id].toFixed(1); rebuildTerrain(); }));
const loop = createAnimationLoop((time) => {
    sun.position.x = 6 + Math.sin(time * 0.00015) * 0.8;
    stars.rotation.y += 0.0008;
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
["height", "frequency"].forEach((id) => { elements[id].value = String(state[id]); elements[`${id}Value`].textContent = state[id].toFixed(1); });
rebuildTerrain(); applySky(); syncRendererSize(renderer, camera, container); loop.start();

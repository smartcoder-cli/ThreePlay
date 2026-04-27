import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SepiaShader } from "three/examples/jsm/shaders/SepiaShader.js";
import { FilmShader } from "three/examples/jsm/shaders/FilmShader.js";
import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Post Processing",
    lessonLabel: "Demo 09 - Post Processing",
    nextHref: "../10-model-loading/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Effect</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-effect="none">None</button><button class="select-button" data-effect="bloom">Bloom</button>
            <button class="select-button" data-effect="film">Film</button><button class="select-button" data-effect="sepia">Sepia</button>
        </div><div class="info-box">Post-processing modifies the rendered image after the scene has already been drawn.</div></section>
        <section class="panel"><h2 class="panel__title">Parameters</h2>
            <div class="control-group"><label class="control-label" for="bloomStrength">Bloom strength</label><div class="control-row"><input id="bloomStrength" type="range" min="0" max="3" step="0.1" value="1.5"><span class="value-chip" id="bloomStrengthValue">1.5</span></div></div>
            <div class="control-group"><label class="control-label" for="bloomRadius">Bloom radius</label><div class="control-row"><input id="bloomRadius" type="range" min="0" max="2" step="0.1" value="0.4"><span class="value-chip" id="bloomRadiusValue">0.4</span></div></div>
            <div class="control-group"><label class="control-label" for="noiseIntensity">Film noise</label><div class="control-row"><input id="noiseIntensity" type="range" min="0" max="1" step="0.1" value="0.5"><span class="value-chip" id="noiseIntensityValue">0.5</span></div></div>
        </section>
        <button class="primary-button" id="resetBtn">Reset Lesson</button>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>RenderPass draws the scene into a composer chain.</li><li>Each additional pass adds both visual depth and render cost.</li><li>Bloom highlights emissive and bright surfaces especially well.</li><li>Effect composition is order-dependent.</li></ul></section>
    `,
    statsContent: "",
});
shell.stats.remove();

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 5, z: 10 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const pointLight = new THREE.PointLight(0x4ecdc4, 2, 50); pointLight.position.set(0, 5, 0); scene.add(pointLight);
const pointLight2 = new THREE.PointLight(0xff6b6b, 1.5, 30); pointLight2.position.set(5, 3, 5); scene.add(pointLight2);
scene.add(new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshStandardMaterial({ color: 0x4ecdc4, emissive: 0x4ecdc4, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 })));
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.2, 16, 64), new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 0.3 })); ring.rotation.x = Math.PI / 2; scene.add(ring);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.5, 0.4, 0.85);
const filmPass = new ShaderPass(FilmShader);
const sepiaPass = new ShaderPass(SepiaShader);
composer.addPass(renderPass);

const elements = {
    effectButtons: Array.from(document.querySelectorAll("[data-effect]")),
    bloomStrength: document.getElementById("bloomStrength"), bloomStrengthValue: document.getElementById("bloomStrengthValue"),
    bloomRadius: document.getElementById("bloomRadius"), bloomRadiusValue: document.getElementById("bloomRadiusValue"),
    noiseIntensity: document.getElementById("noiseIntensity"), noiseIntensityValue: document.getElementById("noiseIntensityValue"),
    resetBtn: document.getElementById("resetBtn"),
};
const defaults = { effect: "none", bloomStrength: 1.5, bloomRadius: 0.4, noiseIntensity: 0.5 };
const state = { ...defaults };

function rebuildComposer() {
    composer.passes = [renderPass];
    bloomPass.strength = state.bloomStrength;
    bloomPass.radius = state.bloomRadius;
    filmPass.uniforms.nIntensity.value = state.noiseIntensity;
    filmPass.uniforms.sIntensity.value = 0.2;
    if (state.effect === "bloom") composer.addPass(bloomPass);
    if (state.effect === "film") composer.addPass(filmPass);
    if (state.effect === "sepia") composer.addPass(sepiaPass);
}

function syncUi() {
    elements.bloomStrength.value = String(state.bloomStrength); elements.bloomStrengthValue.textContent = state.bloomStrength.toFixed(1);
    elements.bloomRadius.value = String(state.bloomRadius); elements.bloomRadiusValue.textContent = state.bloomRadius.toFixed(1);
    elements.noiseIntensity.value = String(state.noiseIntensity); elements.noiseIntensityValue.textContent = state.noiseIntensity.toFixed(1);
    elements.effectButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.effect === state.effect));
}

elements.effectButtons.forEach((button) => button.addEventListener("click", () => { state.effect = button.dataset.effect; syncUi(); rebuildComposer(); }));
["bloomStrength", "bloomRadius", "noiseIntensity"].forEach((id) => elements[id].addEventListener("input", (event) => { state[id] = Number(event.target.value); syncUi(); rebuildComposer(); }));
elements.resetBtn.addEventListener("click", () => { Object.assign(state, defaults); syncUi(); rebuildComposer(); });
const loop = createAnimationLoop(() => { ring.rotation.z += 0.01; controls.update(); composer.render(); });
window.addEventListener("resize", () => { syncRendererSize(renderer, camera, container); composer.setSize(container.clientWidth, container.clientHeight); });
syncUi(); rebuildComposer(); syncRendererSize(renderer, camera, container); composer.setSize(container.clientWidth, container.clientHeight); loop.start();

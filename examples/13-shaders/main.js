import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Shaders",
    lessonLabel: "Demo 13 - Shaders",
    nextHref: "../14-vr-ar/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Shader Style</h2><div class="button-grid button-grid--two">
            <button class="select-button is-active" data-shader="gradient">Gradient</button><button class="select-button" data-shader="noise">Noise</button>
            <button class="select-button" data-shader="toon">Toon</button><button class="select-button" data-shader="fresnel">Fresnel</button>
        </div></section>
        <section class="panel"><h2 class="panel__title">Parameters</h2>
            <div class="control-group"><label class="control-label" for="speed">Speed</label><div class="control-row"><input id="speed" type="range" min="0" max="3" step="0.1" value="1"><span class="value-chip" id="speedValue">1.0</span></div></div>
            <div class="control-group"><label class="control-label" for="intensity">Intensity</label><div class="control-row"><input id="intensity" type="range" min="0" max="2" step="0.1" value="1"><span class="value-chip" id="intensityValue">1.0</span></div></div>
            <div class="control-group"><label class="control-label">Colors</label><div class="control-row"><input id="color1" type="color" value="#4ecdc4"><input id="color2" type="color" value="#ff6b6b"></div></div>
        </section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Vertex shaders move geometry before rasterization.</li><li>Fragment shaders define the final pixel color.</li><li>Uniforms are the bridge between JavaScript and GLSL.</li><li>Small math changes can produce very different visual results.</li></ul></section>
    `,
    statsContent: "",
});
shell.stats.remove();
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 0, z: 5 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
const geometry = new THREE.SphereGeometry(1.6, 96, 96);
let mesh = null;
const uniforms = { uTime: { value: 0 }, uIntensity: { value: 1 }, uColor1: { value: new THREE.Color("#4ecdc4") }, uColor2: { value: new THREE.Color("#ff6b6b") }, uMode: { value: 0 } };
const vertexShader = `
uniform float uTime;
uniform float uIntensity;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
  vec3 pos = position + normal * sin(position.y * 4.0 + uTime) * 0.1 * uIntensity;
  vPosition = pos;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;
const fragmentShader = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uIntensity;
uniform float uMode;
varying vec3 vPosition;
varying vec3 vNormal;
float random(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main() {
  float gradient = vPosition.y * 0.5 + 0.5;
  vec3 color = mix(uColor1, uColor2, gradient);
  if (uMode == 1.0) color = mix(uColor1, uColor2, random(vPosition.xy + uTime) * uIntensity);
  if (uMode == 2.0) color = mix(uColor1, uColor2, step(0.5, gradient + sin(uTime) * 0.1));
  if (uMode == 3.0) {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
    color = mix(uColor1, uColor2, fresnel * uIntensity);
  }
  gl_FragColor = vec4(color, 1.0);
}`;
const shaderModes = { gradient: 0, noise: 1, toon: 2, fresnel: 3 };
const elements = { buttons: Array.from(document.querySelectorAll("[data-shader]")), speed: document.getElementById("speed"), speedValue: document.getElementById("speedValue"), intensity: document.getElementById("intensity"), intensityValue: document.getElementById("intensityValue"), color1: document.getElementById("color1"), color2: document.getElementById("color2") };
const state = { shader: "gradient", speed: 1, intensity: 1, color1: "#4ecdc4", color2: "#ff6b6b" };
function rebuild() {
    if (mesh) { scene.remove(mesh); mesh.material.dispose(); }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}
function syncUi() {
    elements.speed.value = String(state.speed); elements.speedValue.textContent = state.speed.toFixed(1);
    elements.intensity.value = String(state.intensity); elements.intensityValue.textContent = state.intensity.toFixed(1);
    elements.color1.value = state.color1; elements.color2.value = state.color2;
    elements.buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.shader === state.shader));
}
elements.buttons.forEach((button) => button.addEventListener("click", () => { state.shader = button.dataset.shader; uniforms.uMode.value = shaderModes[state.shader]; syncUi(); }));
elements.speed.addEventListener("input", (event) => { state.speed = Number(event.target.value); syncUi(); });
elements.intensity.addEventListener("input", (event) => { state.intensity = Number(event.target.value); uniforms.uIntensity.value = state.intensity; syncUi(); });
elements.color1.addEventListener("input", (event) => { state.color1 = event.target.value; uniforms.uColor1.value.set(state.color1); });
elements.color2.addEventListener("input", (event) => { state.color2 = event.target.value; uniforms.uColor2.value.set(state.color2); });
const loop = createAnimationLoop((time) => { uniforms.uTime.value = time * 0.001 * state.speed; controls.update(); renderer.render(scene, camera); });
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncUi(); uniforms.uMode.value = shaderModes[state.shader]; uniforms.uIntensity.value = state.intensity; rebuild(); syncRendererSize(renderer, camera, container); loop.start();

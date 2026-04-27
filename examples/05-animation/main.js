import { renderLessonShell } from "../../src/shared/lesson-shell.js";
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
    title: "Animation",
    lessonLabel: "Demo 05 - Animation",
    nextHref: "../06-controls/index.html",
    sidebarContent: `
        <section class="panel">
            <h2 class="panel__title">Animation Mode</h2>
            <div class="button-grid button-grid--two">
                <button class="select-button is-active" data-anim="rotate">Rotate</button>
                <button class="select-button" data-anim="bounce">Bounce</button>
                <button class="select-button" data-anim="scale">Scale</button>
                <button class="select-button" data-anim="wave">Wave</button>
            </div>
            <div class="info-box">
                Animation in Three.js usually means updating object transforms inside a frame loop, then rendering the scene again.
            </div>
        </section>

        <section class="panel">
            <button class="secondary-button" id="playBtn">Pause animation</button>
            <div class="control-group">
                <label class="control-label" for="speed">Speed</label>
                <div class="control-row">
                    <input type="range" id="speed" min="0.1" max="3" step="0.1" value="1">
                    <span class="value-chip" id="speedValue">1.0</span>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="amplitude">Amplitude</label>
                <div class="control-row">
                    <input type="range" id="amplitude" min="0.1" max="2" step="0.1" value="0.5">
                    <span class="value-chip" id="amplitudeValue">0.5</span>
                </div>
            </div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Code Preview</h2>
            <div class="code-preview" id="codePreview"></div>
        </section>

        <section class="panel">
            <h2 class="panel__title">Study Notes</h2>
            <ul class="tips-list">
                <li>Animation is more stable when driven by time instead of fixed increments alone.</li>
                <li>Different motion patterns can reuse the same objects and render loop.</li>
                <li>Sine functions are a compact way to create smooth periodic motion.</li>
                <li>Avoid creating new objects every frame inside the animation loop.</li>
            </ul>
        </section>
    `,
    statsContent: "",
});

shell.stats.remove();

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, {
    fov: 60,
    position: { x: 3, y: 3, z: 3 },
});
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const group = new THREE.Group();

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
        color: 0x4ecdc4,
        metalness: 0.3,
        roughness: 0.5,
    }),
);
cube.position.y = 0.5;
group.add(cube);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.15, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b }),
);
torus.position.y = 0.4;
group.add(torus);
scene.add(group);

const elements = {
    buttons: Array.from(document.querySelectorAll("[data-anim]")),
    playBtn: document.getElementById("playBtn"),
    speed: document.getElementById("speed"),
    speedValue: document.getElementById("speedValue"),
    amplitude: document.getElementById("amplitude"),
    amplitudeValue: document.getElementById("amplitudeValue"),
    codePreview: document.getElementById("codePreview"),
};

const state = {
    isPlaying: true,
    currentAnimation: "rotate",
    speed: 1,
    amplitude: 0.5,
    time: 0,
};

const codeByMode = {
    rotate: [
        `<span class="keyword">function</span> animate() {`,
        `  cube.rotation.x += <span class="number">0.02</span> * speed;`,
        `  cube.rotation.y += <span class="number">0.03</span> * speed;`,
        `  renderer.render(scene, camera);`,
        `}`,
    ].join("\n"),
    bounce: [
        `<span class="keyword">function</span> animate() {`,
        `  <span class="keyword">const</span> y = Math.abs(Math.sin(time * <span class="number">2</span>)) * amplitude;`,
        `  cube.position.y = <span class="number">0.5</span> + y;`,
        `}`,
    ].join("\n"),
    scale: [
        `<span class="keyword">function</span> animate() {`,
        `  <span class="keyword">const</span> scale = <span class="number">1</span> + Math.sin(time * <span class="number">2</span>) * amplitude;`,
        `  cube.scale.set(scale, scale, scale);`,
        `}`,
    ].join("\n"),
    wave: [
        `<span class="keyword">function</span> animate() {`,
        `  cube.rotation.x = Math.sin(time) * amplitude;`,
        `  cube.rotation.z = Math.cos(time * <span class="number">0.7</span>) * amplitude;`,
        `}`,
    ].join("\n"),
};

function resetPose() {
    cube.position.set(0, 0.5, 0);
    cube.rotation.set(0, 0, 0);
    cube.scale.set(1, 1, 1);
    torus.position.set(0, 0.4, 0);
    torus.rotation.set(0, 0, 0);
    torus.scale.set(1, 1, 1);
}

function updateCodePreview() {
    elements.codePreview.innerHTML = codeByMode[state.currentAnimation];
}

function updateModeButtons() {
    elements.buttons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.anim === state.currentAnimation);
    });
}

function applyAnimation(deltaSeconds) {
    if (!state.isPlaying) {
        return;
    }

    state.time += deltaSeconds * state.speed;

    switch (state.currentAnimation) {
        case "bounce":
            cube.position.y = 0.5 + Math.abs(Math.sin(state.time * 2)) * state.amplitude;
            torus.position.y = 0.4 + Math.abs(Math.sin(state.time * 2 + 0.5)) * state.amplitude;
            break;
        case "scale": {
            const scale = 1 + Math.sin(state.time * 2) * state.amplitude * 0.5;
            cube.scale.set(scale, scale, scale);
            torus.scale.set(1.5 - scale, 1.5 - scale, 1.5 - scale);
            break;
        }
        case "wave":
            cube.rotation.x = Math.sin(state.time) * state.amplitude;
            cube.rotation.z = Math.cos(state.time * 0.7) * state.amplitude;
            torus.rotation.y = state.time;
            torus.position.x = Math.sin(state.time * 1.5) * state.amplitude;
            break;
        case "rotate":
        default:
            cube.rotation.x += 0.02 * state.speed;
            cube.rotation.y += 0.03 * state.speed;
            torus.rotation.x += 0.02 * state.speed;
            torus.rotation.y += 0.01 * state.speed;
            break;
    }
}

elements.buttons.forEach((button) => {
    button.addEventListener("click", () => {
        state.currentAnimation = button.dataset.anim;
        state.time = 0;
        resetPose();
        updateModeButtons();
        updateCodePreview();
    });
});

elements.playBtn.addEventListener("click", () => {
    state.isPlaying = !state.isPlaying;
    elements.playBtn.textContent = state.isPlaying ? "Pause animation" : "Play animation";
});

elements.speed.addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    elements.speedValue.textContent = state.speed.toFixed(1);
});

elements.amplitude.addEventListener("input", (event) => {
    state.amplitude = Number(event.target.value);
    elements.amplitudeValue.textContent = state.amplitude.toFixed(1);
});

let previousTime = performance.now();

const loop = createAnimationLoop((now) => {
    const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;

    applyAnimation(deltaSeconds);
    controls.update();
    renderer.render(scene, camera);
});

function handleResize() {
    syncRendererSize(renderer, camera, container);
}

window.addEventListener("resize", handleResize);

updateModeButtons();
updateCodePreview();
handleResize();
loop.start();

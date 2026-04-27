import { renderLessonShell, statsRows } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Physics",
    lessonLabel: "Demo 08 - Physics",
    nextHref: "../09-post-processing/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Physics Parameters</h2>
            <div class="control-group"><label class="control-label" for="gravity">Gravity</label><div class="control-row"><input id="gravity" type="range" min="0" max="30" step="1" value="10"><span class="value-chip" id="gravityValue">10</span></div></div>
            <div class="control-group"><label class="control-label" for="restitution">Restitution</label><div class="control-row"><input id="restitution" type="range" min="0" max="1" step="0.1" value="0.7"><span class="value-chip" id="restitutionValue">0.7</span></div></div>
            <div class="control-group"><label class="control-label" for="friction">Friction</label><div class="control-row"><input id="friction" type="range" min="0" max="1" step="0.1" value="0.3"><span class="value-chip" id="frictionValue">0.3</span></div></div>
            <button class="primary-button" id="dropBtn">Drop Object</button>
            <button class="secondary-button" id="clearBtn">Clear Scene</button>
            <button class="primary-button" id="resetBtn">Reset Lesson</button>
        </section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>This lesson uses a simple custom rigid-body approximation, not a full engine.</li><li>Gravity, restitution, and friction interact to shape the bounce behavior.</li><li>Bounding-box collisions are simple but limited.</li><li>Production apps usually delegate this job to dedicated physics libraries.</li></ul></section>
    `,
    statsContent: statsRows([{ id: "objectCount", label: "Bodies", value: "0" }, { id: "fps", label: "FPS", value: "0" }]),
});

const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 15, z: 25 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
renderer.shadowMap.enabled = true;
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 0.8); light.position.set(10, 20, 10); scene.add(light);
const ground = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 30), new THREE.MeshStandardMaterial({ color: 0x333344 })); ground.position.y = -0.5; scene.add(ground);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444455, transparent: true, opacity: 0.35 });
[
    [30, 5, 1, 0, 2, -15], [30, 5, 1, 0, 2, 15], [1, 5, 30, -15, 2, 0], [1, 5, 30, 15, 2, 0],
].forEach((item) => { const wall = new THREE.Mesh(new THREE.BoxGeometry(item[0], item[1], item[2]), wallMaterial); wall.position.set(item[3], item[4], item[5]); scene.add(wall); });

const elements = {
    gravity: document.getElementById("gravity"), gravityValue: document.getElementById("gravityValue"),
    restitution: document.getElementById("restitution"), restitutionValue: document.getElementById("restitutionValue"),
    friction: document.getElementById("friction"), frictionValue: document.getElementById("frictionValue"),
    dropBtn: document.getElementById("dropBtn"), clearBtn: document.getElementById("clearBtn"), resetBtn: document.getElementById("resetBtn"),
    objectCount: document.getElementById("objectCount"), fps: document.getElementById("fps"),
};
const defaults = { gravity: 10, restitution: 0.7, friction: 0.3 };
const state = { ...defaults };
const bodies = [];
let fpsFrames = 0;
let lastFps = performance.now();

function spawnBody() {
    const shapeType = Math.random() > 0.5 ? "box" : "sphere";
    const mesh = shapeType === "box"
        ? new THREE.Mesh(new THREE.BoxGeometry(1 + Math.random(), 1 + Math.random(), 1 + Math.random()), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }))
        : new THREE.Mesh(new THREE.SphereGeometry(0.6 + Math.random() * 0.6, 24, 24), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
    mesh.position.set((Math.random() - 0.5) * 8, 10 + Math.random() * 5, (Math.random() - 0.5) * 8);
    scene.add(mesh);
    bodies.push({ mesh, velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1), radius: 0.9 });
    elements.objectCount.textContent = String(bodies.length);
}

function clearBodies() {
    bodies.splice(0).forEach((body) => { scene.remove(body.mesh); body.mesh.geometry.dispose(); body.mesh.material.dispose(); });
    elements.objectCount.textContent = "0";
}

function syncUi() {
    elements.gravity.value = String(state.gravity); elements.gravityValue.textContent = String(state.gravity);
    elements.restitution.value = String(state.restitution); elements.restitutionValue.textContent = state.restitution.toFixed(1);
    elements.friction.value = String(state.friction); elements.frictionValue.textContent = state.friction.toFixed(1);
}

["gravity", "restitution", "friction"].forEach((key) => elements[key].addEventListener("input", (event) => { state[key] = Number(event.target.value); syncUi(); }));
elements.dropBtn.addEventListener("click", spawnBody);
elements.clearBtn.addEventListener("click", clearBodies);
elements.resetBtn.addEventListener("click", () => { Object.assign(state, defaults); syncUi(); clearBodies(); });

const loop = createAnimationLoop(() => {
    bodies.forEach((body) => {
        body.velocity.y -= state.gravity * 0.0015;
        body.mesh.position.add(body.velocity);
        if (body.mesh.position.y - body.radius < 0) {
            body.mesh.position.y = body.radius;
            body.velocity.y = Math.abs(body.velocity.y) * state.restitution;
            body.velocity.x *= 1 - state.friction * 0.1;
            body.velocity.z *= 1 - state.friction * 0.1;
        }
        ["x", "z"].forEach((axis) => {
            if (body.mesh.position[axis] > 14 || body.mesh.position[axis] < -14) {
                body.mesh.position[axis] = THREE.MathUtils.clamp(body.mesh.position[axis], -14, 14);
                body.velocity[axis] *= -state.restitution;
            }
        });
        body.mesh.rotation.x += body.velocity.x * 0.2;
        body.mesh.rotation.z += body.velocity.z * 0.2;
    });
    controls.update();
    renderer.render(scene, camera);
    fpsFrames += 1;
    const now = performance.now();
    if (now - lastFps > 1000) { elements.fps.textContent = String(fpsFrames); fpsFrames = 0; lastFps = now; }
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
syncUi(); syncRendererSize(renderer, camera, container); loop.start();

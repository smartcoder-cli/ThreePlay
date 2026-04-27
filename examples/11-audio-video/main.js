import { renderLessonShell } from "../../src/shared/lesson-shell.js";
import { THREE, createAnimationLoop, createOrbitControls, createPerspectiveCamera, createRenderer, syncRendererSize } from "../../src/shared/three-runtime.js";

const app = document.getElementById("app");
const shell = renderLessonShell(app, {
    title: "Audio and Video",
    lessonLabel: "Demo 11 - Audio and Video",
    nextHref: "../12-performance/index.html",
    sidebarContent: `
        <section class="panel"><h2 class="panel__title">Audio Reactive Ring</h2><div class="hint-box"><div id="audioVizText">Click play to start a soft generative loop and reactive motion.</div></div><button class="secondary-button" id="audioBtn">Play audio</button></section>
        <section class="panel"><h2 class="panel__title">Parameters</h2>
            <div class="control-group"><label class="control-label" for="sensitivity">Sensitivity</label><div class="control-row"><input id="sensitivity" type="range" min="0.1" max="3" step="0.1" value="1"><span class="value-chip" id="sensitivityValue">1.0</span></div></div>
            <div class="control-group"><label class="control-label" for="decay">Decay</label><div class="control-row"><input id="decay" type="range" min="0.1" max="0.9" step="0.1" value="0.5"><span class="value-chip" id="decayValue">0.5</span></div></div>
            <div class="control-group"><label class="control-label" for="objectScale">Center scale</label><div class="control-row"><input id="objectScale" type="range" min="0.5" max="3" step="0.1" value="1.5"><span class="value-chip" id="objectScaleValue">1.5</span></div></div>
            <div class="control-group"><label class="control-label" for="colorIntensity">Color intensity</label><div class="control-row"><input id="colorIntensity" type="range" min="0" max="1" step="0.1" value="0.8"><span class="value-chip" id="colorIntensityValue">0.8</span></div></div>
        </section>
        <section class="panel"><h2 class="panel__title">Study Notes</h2><ul class="tips-list"><li>Web Audio APIs require a user gesture before sound can start.</li><li>Frequency data can drive scale, color, or particle motion.</li><li>Video and canvas textures work like regular textures once updated.</li><li>Media-driven visuals usually need smoothing to avoid jitter.</li></ul></section>
    `,
    statsContent: "",
});
shell.stats.remove();
const canvas = shell.canvas;
const container = canvas.parentElement;
const scene = new THREE.Scene();
const camera = createPerspectiveCamera(container, { fov: 60, position: { x: 0, y: 2, z: 6 } });
const renderer = createRenderer(canvas, 0x1a1a2e);
const controls = createOrbitControls(camera, canvas);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x4ecdc4, 1.2, 18);
fillLight.position.set(-3, 2, 4);
scene.add(fillLight);
const ring = [];
for (let i = 0; i < 32; i += 1) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x4ecdc4,
            emissive: 0x16363a,
            emissiveIntensity: 0.35,
            metalness: 0.15,
            roughness: 0.45,
        }),
    );
    const angle = (i / 32) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * 2, 0, Math.sin(angle) * 2);
    scene.add(mesh);
    ring.push({ mesh, angle, energy: 0 });
}
const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 0.3 }));
scene.add(centerSphere);

const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
let masterGain = null;
let analyser = null;
let notesTimer = null;
let nextNoteAt = 0;
const notePattern = [220, 277.18, 329.63, 392.0, 329.63, 277.18];
let noteIndex = 0;
const elements = {
    audioBtn: document.getElementById("audioBtn"), audioVizText: document.getElementById("audioVizText"),
    sensitivity: document.getElementById("sensitivity"), sensitivityValue: document.getElementById("sensitivityValue"),
    decay: document.getElementById("decay"), decayValue: document.getElementById("decayValue"),
    objectScale: document.getElementById("objectScale"), objectScaleValue: document.getElementById("objectScaleValue"),
    colorIntensity: document.getElementById("colorIntensity"), colorIntensityValue: document.getElementById("colorIntensityValue"),
};
const state = { playing: false, sensitivity: 1, decay: 0.5, objectScale: 1.5, colorIntensity: 0.8 };

function ensureAudio() {
    if (!AudioContextCtor || audioContext) return;
    audioContext = new AudioContextCtor();
    masterGain = audioContext.createGain();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    masterGain.gain.value = 0.0;
    masterGain.connect(analyser);
    analyser.connect(audioContext.destination);
    nextNoteAt = audioContext.currentTime;
}

function scheduleSoftNote(frequency, startTime) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = noteIndex % 2 === 0 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.linearRampToValueAtTime(frequency * 1.01, startTime + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.linearRampToValueAtTime(900, startTime + 0.25);

    gain.gain.setValueAtTime(0.0, startTime);
    gain.gain.linearRampToValueAtTime(0.055, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.34);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.38);
}

function startNoteLoop() {
    if (notesTimer) return;
    notesTimer = window.setInterval(() => {
        if (!audioContext || !state.playing) return;
        while (nextNoteAt < audioContext.currentTime + 0.18) {
            scheduleSoftNote(notePattern[noteIndex % notePattern.length], nextNoteAt);
            noteIndex += 1;
            nextNoteAt += 0.24;
        }
    }, 80);
}

function stopNoteLoop() {
    if (!notesTimer) return;
    window.clearInterval(notesTimer);
    notesTimer = null;
}

elements.audioBtn.addEventListener("click", async () => {
    ensureAudio();
    if (!audioContext) return;
    if (audioContext.state === "suspended") await audioContext.resume();
    state.playing = !state.playing;
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(state.playing ? 1.0 : 0.0, audioContext.currentTime + 0.05);
    if (state.playing) {
        noteIndex = 0;
        nextNoteAt = audioContext.currentTime;
        startNoteLoop();
    } else {
        stopNoteLoop();
    }
    elements.audioBtn.textContent = state.playing ? "Pause audio" : "Play audio";
    elements.audioVizText.textContent = state.playing ? "Audio is running. The ring follows a soft repeating synth pattern." : "Audio paused.";
});
["sensitivity", "decay", "objectScale", "colorIntensity"].forEach((id) => elements[id].addEventListener("input", (event) => { state[id] = Number(event.target.value); elements[`${id}Value`].textContent = state[id].toFixed(1); }));

const loop = createAnimationLoop((time) => {
    const audioValues = new Uint8Array(32);
    if (analyser && state.playing) analyser.getByteFrequencyData(audioValues);
    ring.forEach((entry, index) => {
        const value = analyser && state.playing ? audioValues[index] / 255 : (Math.sin(time / 300 + index * 0.2) + 1) * 0.25;
        entry.energy = THREE.MathUtils.lerp(entry.energy, value * state.sensitivity, 1 - state.decay * 0.8);
        const radius = 2 + entry.energy * 1.5;
        entry.mesh.position.set(Math.cos(entry.angle) * radius, entry.energy * 1.5, Math.sin(entry.angle) * radius);
        const hue = 0.48 + entry.energy * state.colorIntensity * 0.2;
        entry.mesh.material.color.setHSL(hue, 0.7, 0.55);
        entry.mesh.material.emissive.setHSL(hue, 0.45, 0.18 + entry.energy * 0.12);
        entry.mesh.material.emissiveIntensity = 0.28 + entry.energy * 0.85;
    });
    const average = ring.reduce((sum, item) => sum + item.energy, 0) / ring.length;
    centerSphere.scale.setScalar(1 + average * state.objectScale);
    centerSphere.material.emissiveIntensity = 0.2 + average * state.colorIntensity;
    controls.update();
    renderer.render(scene, camera);
});
window.addEventListener("resize", () => syncRendererSize(renderer, camera, container));
["sensitivity", "decay", "objectScale", "colorIntensity"].forEach((id) => { elements[id].value = String(state[id]); elements[`${id}Value`].textContent = state[id].toFixed(1); });
syncRendererSize(renderer, camera, container); loop.start();

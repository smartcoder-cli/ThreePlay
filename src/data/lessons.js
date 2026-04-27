export const phases = [
    {
        id: "foundation",
        title: "Core Demos",
        description: "Scenes, geometry, materials, lighting, animation, and control experiments.",
    },
    {
        id: "applied",
        title: "Interactive Demos",
        description: "Particles, physics, media, post-processing, and performance-focused examples.",
    },
    {
        id: "advanced",
        title: "Advanced Demos",
        description: "Shaders, immersive concepts, terrain, WebGPU ideas, responsive layout, and a showcase scene.",
    },
];

export const lessons = [
    { id: "01", slug: "01-basic-scene", title: "Basic Scene", description: "Understand Scene, Camera, Renderer, and a minimal interactive setup.", phase: "foundation", status: "ready", migrated: true },
    { id: "02", slug: "02-geometries", title: "Geometries", description: "Compare common geometry types and parameter changes.", phase: "foundation", status: "ready", migrated: true },
    { id: "03", slug: "03-materials", title: "Materials", description: "Compare how different material types behave in the same scene.", phase: "foundation", status: "ready", migrated: true },
    { id: "04", slug: "04-lighting", title: "Lighting", description: "Learn the basics of ambient, point, and shadow-aware lighting.", phase: "foundation", status: "ready", migrated: true },
    { id: "05", slug: "05-animation", title: "Animation", description: "Practice requestAnimationFrame and time-based animation.", phase: "foundation", status: "ready", migrated: true },
    { id: "06", slug: "06-controls", title: "Controls", description: "Switch control modes and understand where each one fits.", phase: "foundation", status: "ready", migrated: true },
    { id: "07", slug: "07-particles", title: "Particles", description: "Build and tune basic particle effects.", phase: "applied", status: "ready", migrated: true },
    { id: "08", slug: "08-physics", title: "Physics", description: "Integrate physics simulation into a Three.js scene.", phase: "applied", status: "ready", migrated: true },
    { id: "09", slug: "09-post-processing", title: "Post Processing", description: "Add bloom and related post effects to a scene.", phase: "applied", status: "ready", migrated: true },
    { id: "10", slug: "10-model-loading", title: "Model Loading", description: "Load external 3D assets and display them cleanly.", phase: "applied", status: "ready", migrated: true },
    { id: "11", slug: "11-audio-video", title: "Audio and Video", description: "Use media content inside a Three.js experience.", phase: "applied", status: "ready", migrated: true },
    { id: "12", slug: "12-performance", title: "Performance", description: "Measure render cost and reason about optimization.", phase: "applied", status: "ready", migrated: true },
    { id: "13", slug: "13-shaders", title: "Shaders", description: "Start using GLSL and custom visual effects.", phase: "advanced", status: "ready", migrated: true },
    { id: "14", slug: "14-vr-ar", title: "VR and AR", description: "Lay groundwork for immersive interaction.", phase: "advanced", status: "ready", migrated: true },
    { id: "15", slug: "15-terrain-skybox", title: "Terrain and Skybox", description: "Create a more complete 3D environment.", phase: "advanced", status: "ready", migrated: true },
    { id: "16", slug: "16-webgpu", title: "WebGPU", description: "Compare next-generation rendering concepts with WebGL.", phase: "advanced", status: "ready", migrated: true },
    { id: "17", slug: "17-responsive", title: "Responsive", description: "Handle layout and rendering across viewport sizes.", phase: "advanced", status: "ready", migrated: true },
    { id: "18", slug: "18-project", title: "Final Project", description: "Combine the lessons into a larger showcase example.", phase: "advanced", status: "ready", migrated: true },
];

export function getLessonBySlug(slug) {
    return lessons.find((lesson) => lesson.slug === slug);
}

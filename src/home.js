import { lessons, phases } from "./data/lessons.js";

const app = document.getElementById("app");

app.innerHTML = `
    <main class="home-shell">
        <section class="hero">
            <h1 class="hero__title">ThreePlay</h1>
            <p class="hero__tagline">A compact gallery of interactive Three.js demos.</p>
            <div class="hero__note">
                Each page is a standalone demo with a shared shell, consistent controls, and lightweight navigation between examples.
            </div>
        </section>

        <section class="feature-grid">
            <article class="feature-card">
                <h2 class="feature-card__title">Shared shell</h2>
                <p class="feature-card__body">Common navigation, layout, and bootstrap logic keep the demos consistent without repeating the same scaffolding.</p>
            </article>
            <article class="feature-card">
                <h2 class="feature-card__title">Direct in browser</h2>
                <p class="feature-card__body">Every demo still opens directly in the browser without a build step, which keeps iteration simple.</p>
            </article>
            <article class="feature-card">
                <h2 class="feature-card__title">Single catalog</h2>
                <p class="feature-card__body">Titles, descriptions, ordering, and links live in one manifest instead of being hardcoded across the site.</p>
            </article>
        </section>

        <section class="phase-list">
            ${phases.map(renderPhase).join("")}
        </section>

        <p class="footer-note">Open any demo directly from this index and move between pages with the top navigation.</p>
    </main>
`;

function renderPhase(phase) {
    const phaseLessons = lessons.filter((lesson) => lesson.phase === phase.id);

    return `
        <section class="phase-section">
            <div class="phase-section__title">
                <h2>${phase.title}</h2>
                <span class="phase-section__badge">${phaseLessons.length} lessons</span>
            </div>
            <p class="feature-card__body">${phase.description}</p>
            <div class="lesson-grid">
                ${phaseLessons.map(renderLessonCard).join("")}
            </div>
        </section>
    `;
}

function renderLessonCard(lesson) {
    const cardClass = "lesson-card";

    return `
        <article class="${cardClass}">
            <div class="lesson-card__header">
                <h3 class="lesson-card__title">${lesson.title}</h3>
                <div class="lesson-card__number">${lesson.id}</div>
            </div>
            <p class="lesson-card__description">${lesson.description}</p>
            <a class="lesson-card__link" href="./examples/${lesson.slug}/index.html">
                <span>Open demo</span>
                <span class="lesson-card__arrow">→</span>
            </a>
        </article>
    `;
}

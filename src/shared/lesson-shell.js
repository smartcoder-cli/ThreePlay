import { lessons } from "../data/lessons.js";

export function renderLessonShell(target, config) {
    const {
        title,
        lessonLabel,
        nextHref,
        nextLabel = "Next demo",
        sidebarContent,
        statsContent = "",
    } = config;
    const { previousLink, nextLink } = resolveAdjacentLinks(nextHref, nextLabel);

    target.innerHTML = `
        <div class="lesson-shell">
            <header class="lesson-header">
                <div class="lesson-header__left">
                    <a class="lesson-logo" href="../../index.html">ThreePlay</a>
                    <span class="lesson-badge">${lessonLabel}</span>
                </div>
                <nav class="lesson-header__right" aria-label="Demo navigation">
                    <a class="lesson-nav" href="../../index.html">Back home</a>
                    ${previousLink}
                    ${nextLink}
                </nav>
            </header>
            <main class="lesson-main">
                <section class="lesson-canvas-pane" aria-label="${title} canvas">
                    <canvas id="lesson-canvas" class="lesson-canvas"></canvas>
                    <div class="overlay-stats">${statsContent}</div>
                </section>
                <aside class="lesson-sidebar">${sidebarContent}</aside>
            </main>
        </div>
    `;

    return {
        canvas: target.querySelector("#lesson-canvas"),
        stats: target.querySelector(".overlay-stats"),
        sidebar: target.querySelector(".lesson-sidebar"),
        };
}

function resolveAdjacentLinks(nextHref, nextLabel) {
    const match = window.location.pathname.match(/examples\/([^/]+)\/index\.html$/);
    if (!match) {
        return {
            previousLink: "",
            nextLink: nextHref ? `<a class="lesson-nav" href="${nextHref}">${nextLabel}</a>` : "",
        };
    }

    const currentIndex = lessons.findIndex((lesson) => lesson.slug === match[1]);
    if (currentIndex === -1) {
        return {
            previousLink: "",
            nextLink: nextHref ? `<a class="lesson-nav" href="${nextHref}">${nextLabel}</a>` : "",
        };
    }

    const previousLesson = lessons[currentIndex - 1];
    const nextLesson = lessons[currentIndex + 1];

    if (previousLesson) {
        registerLessonShortcut("ArrowLeft", `../${previousLesson.slug}/index.html`);
    }

    if (nextLesson) {
        registerLessonShortcut("ArrowRight", `../${nextLesson.slug}/index.html`);
    }

    return {
        previousLink: previousLesson
            ? `<a class="lesson-nav" href="../${previousLesson.slug}/index.html">Previous demo: ${previousLesson.id}</a>`
            : "",
        nextLink: nextLesson
            ? `<a class="lesson-nav" href="../${nextLesson.slug}/index.html">${nextLabel}: ${nextLesson.id}</a>`
            : (nextHref ? `<a class="lesson-nav" href="${nextHref}">${nextLabel}</a>` : ""),
    };
}

let shortcutRegistered = false;

function registerLessonShortcut(key, href) {
    if (shortcutRegistered) {
        return;
    }

    window.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLElement) {
            const tagName = event.target.tagName;
            if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
                return;
            }
        }

        if (event.key === "ArrowLeft") {
            const previous = document.querySelector('.lesson-nav[href*="../"][href*="index.html"]');
            if (previous && previous.textContent?.startsWith("Previous")) {
                window.location.href = previous.getAttribute("href");
            }
        }

        if (event.key === "ArrowRight") {
            const links = Array.from(document.querySelectorAll(".lesson-nav"));
            const next = links.find((link) => link.textContent?.startsWith("Next"));
            if (next) {
                window.location.href = next.getAttribute("href");
            }
        }
    });

    shortcutRegistered = true;
}

export function statsRows(rows) {
    return rows
        .map(
            (row) => `
                <div class="overlay-stats__row">
                    <span class="overlay-stats__label">${row.label}</span>
                    <span class="overlay-stats__value" id="${row.id}">${row.value}</span>
                </div>
            `,
        )
        .join("");
}

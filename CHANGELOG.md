# Changelog

## 2026-04-27

### Gallery refactor

- Repositioned ThreePlay as a browser-native Three.js demo gallery rather than a course platform.
- Replaced the hardcoded homepage with a metadata-driven index rendered from `src/data/lessons.js`.
- Migrated all 18 demo pages to a shared ES module structure.
- Standardized demo entrypoints around `index.html + main.js`.

### Shared infrastructure

- Added a shared page shell in `src/shared/lesson-shell.js`.
- Added common Three.js runtime helpers in `src/shared/three-runtime.js`.
- Consolidated shared visual styles into `style.css`.
- Enabled previous/next navigation and keyboard navigation across demo pages.

### Layout and UX

- Reworked demo pages into a desktop-friendly workspace layout with:
  - fixed-height canvas area
  - independently scrolling right-side control panel
  - improved first-view usability for side-by-side interaction
- Simplified homepage content to better match a demo gallery identity.
- Redesigned homepage cards to feel more like showcase tiles and less like course entries.
- Renamed page labels from `Lesson` to `Demo`.

### Demo quality pass

- Improved first-load framing for demos `01`, `02`, `03`, and `06`.
- Refined `11-audio-video` to use a softer generative audio loop and more readable reactive lighting.
- Strengthened `14-vr-ar` to make mode differences more visible.
- Strengthened `15-terrain-skybox` so environment presets affect atmosphere more than just background color.
- Strengthened `17-responsive` so layout modes create more obvious composition differences.

### Local workflow

- Added `start-local-site.bat` to launch a local static server and open the site automatically.
- Added `stop-local-site.bat` to stop the local server process on port `8000`.

### Documentation

- Rewrote `readme.md` for the new gallery positioning.
- Added `docs/architecture.md`.
- Added `docs/demo-guidelines.md`.
- Added `docs/demo-index.md`.

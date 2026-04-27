# ThreePlay

ThreePlay is a browser-native Three.js demo gallery with 18 interactive examples. Each page is a standalone demo with a shared shell, consistent controls, and lightweight previous/next navigation.

## What it is

ThreePlay is positioned as a demo site, not a course platform.

That means:

- the homepage acts as a gallery index
- each demo opens directly in the browser
- the project avoids a build step on purpose
- some demos are concept simulations rather than full production integrations of external APIs

## Local preview

From `C:\Users\smart\dev\ThreePlay` on Windows:

- double-click `start-local-site.bat`
- the browser should open automatically to `http://127.0.0.1:8000/`
- double-click `stop-local-site.bat` when finished

If the browser does not open automatically, visit:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/index.html`

## GitHub Pages

This project is suitable for GitHub Pages because it is a static site with relative links.

After pushing to GitHub and enabling Actions-based Pages deployment, the site can be published without a build step through the workflow in `.github/workflows/pages.yml`.

Recommended repository description:

`A browser-native Three.js demo gallery with 18 interactive examples.`

Recommended topics:

- `threejs`
- `webgl`
- `javascript`
- `graphics`
- `interactive`
- `demo-gallery`

## Project structure

```text
ThreePlay/
|-- .github/
|   `-- workflows/
|       `-- pages.yml
|-- docs/
|   |-- architecture.md
|   |-- demo-guidelines.md
|   `-- demo-index.md
|-- examples/
|   |-- 01-basic-scene/
|   |   |-- index.html
|   |   `-- main.js
|   |-- 02-geometries/
|   |-- ...
|   `-- 18-project/
|-- src/
|   |-- home.js
|   |-- data/
|   |   `-- lessons.js
|   `-- shared/
|       |-- lesson-shell.js
|       `-- three-runtime.js
|-- .gitignore
|-- CHANGELOG.md
|-- index.html
|-- LICENSE
|-- README.md
|-- start-local-site.bat
|-- stop-local-site.bat
`-- style.css
```

## Demo overview

The gallery currently includes:

1. Basic Scene
2. Geometries
3. Materials
4. Lighting
5. Animation
6. Controls
7. Particles
8. Physics
9. Post Processing
10. Model Loading
11. Audio and Video
12. Performance
13. Shaders
14. VR and AR
15. Terrain and Skybox
16. WebGPU
17. Responsive
18. Final Project

For short descriptions of all demos, see `docs/demo-index.md`.

## Screenshots

This repository is ready for screenshots or animated GIFs, but they are not included yet.

Recommended additions before public release:

- one homepage screenshot
- two to four representative demo screenshots
- one short GIF for a highly interactive demo such as `09`, `11`, or `18`

## Notes

- desktop demo pages use a fixed-height workspace layout with an independently scrolling side panel
- keyboard navigation is supported on demo pages:
  - `Left Arrow`: previous demo
  - `Right Arrow`: next demo
- the Windows `.bat` files are convenience scripts for local development and are not required for GitHub Pages

## Additional docs

- `docs/architecture.md`
- `docs/demo-guidelines.md`
- `docs/demo-index.md`
- `CHANGELOG.md`

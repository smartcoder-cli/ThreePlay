# Architecture

## Overview

ThreePlay uses a browser-native ES module architecture. The goal is to keep every demo independently runnable while avoiding repeated shell and runtime code.

There is no build step.

## Top-level flow

### Homepage

- `index.html` loads `src/home.js`
- `src/home.js` reads `src/data/lessons.js`
- The homepage is rendered from lesson metadata instead of hardcoded cards

### Demo pages

Each demo lives in `examples/<slug>/` and contains:

- `index.html`
- `main.js`

The demo `index.html` provides:

- the shared stylesheet
- any required import map entries
- the module entrypoint for the page

The demo `main.js` owns:

- scene content
- local UI wiring
- topic-specific logic

## Shared modules

### `src/data/lessons.js`

Defines:

- demo grouping metadata
- demo titles
- slugs
- short descriptions
- migration status

Used by:

- homepage rendering
- shared navigation logic

### `src/shared/lesson-shell.js`

Responsible for:

- rendering the common demo page shell
- top navigation
- previous/next demo links
- keyboard navigation between demos
- overlay stats block markup

It does not own:

- demo-specific controls
- scene logic
- any Three.js objects

### `src/shared/three-runtime.js`

Provides reusable Three.js helpers:

- renderer creation
- perspective/orthographic camera creation
- orbit controls creation
- resize synchronization
- animation loop helper
- mesh material/geometry replacement helpers

This file is intentionally small and utility-focused.

## Shared styling

### `style.css`

Contains:

- homepage layout
- demo page shell layout
- side panel styling
- controls styling
- button/grid patterns
- card styling for the homepage

Important layout behavior:

- desktop demo pages use a full-height workspace layout
- the page itself does not scroll on desktop
- the right panel scrolls independently
- mobile falls back to normal stacked layout and page scrolling

## Design decisions

### Why browser-native ES modules

The project favors:

- low setup friction
- direct file editing
- easy local hosting with a static server
- inspectable demo pages

This keeps the site simple to run and modify.

### Why a shared shell

Before refactoring, each demo duplicated:

- page header
- layout
- controls panel structure
- common renderer setup
- resize handling

The shared shell reduces maintenance cost without forcing a framework.

### Why metadata-driven homepage

The old homepage was a large hardcoded HTML page. The metadata-driven approach makes it easier to:

- reorder demos
- rename demos
- change descriptions
- build navigation consistently

## Runtime expectations

ThreePlay is designed to run from a simple static server.

Expected local environment:

- Python available for `python -m http.server`
- A modern browser with ES module support

## Limits

Some demos are simplified concept demonstrations rather than full production implementations. Examples:

- `08-physics` uses a lightweight custom approximation instead of a full external physics engine
- `10-model-loading` demonstrates model inspection with built-in primitives instead of loading remote assets
- `14-vr-ar` demonstrates immersive presentation ideas rather than full WebXR session management
- `16-webgpu` demonstrates WebGPU concepts in a compatibility-friendly way

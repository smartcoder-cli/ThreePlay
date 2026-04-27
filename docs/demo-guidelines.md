# Demo Guidelines

## Goal

A demo should communicate one clear idea quickly.

A good ThreePlay demo:

- has a visible topic
- responds immediately to interaction
- keeps controls understandable
- avoids unnecessary implementation weight

## Required structure

Each demo should live in:

```text
examples/XX-slug/
|-- index.html
`-- main.js
```

### `index.html`

Should:

- load `../../style.css`
- define any required import map entries
- mount a root container
- load `./main.js` as a module

### `main.js`

Should:

- call `renderLessonShell(...)`
- create the scene using helpers from `three-runtime.js` where appropriate
- keep demo-specific logic local to the file

## Naming

### Folder names

Format:

`XX-topic-name`

Examples:

- `01-basic-scene`
- `09-post-processing`
- `15-terrain-skybox`

### Demo labels

Use:

- `Demo 01 - Basic Scene`
- `Demo 09 - Post Processing`

Keep labels short and scannable.

## UI guidance

### Side panel

Use the side panel for:

- the main mode switch
- a small number of meaningful controls
- brief study/demo notes

Avoid:

- long technical essays
- excessive toggles
- redundant stats

### Controls

Prefer:

- sliders for continuous parameters
- compact toggle rows for booleans
- button grids for mutually exclusive modes

Avoid:

- deep control hierarchies
- hidden dependencies unless clearly explained

### Header navigation

All demos should retain:

- back to home
- previous demo
- next demo

This is handled by the shared shell.

## Visual guidance

Treat each page like a polished demo, not a raw test page.

That means:

- the main object should be visible on first load
- the canvas and controls should work together in one viewport
- mode switches should create obvious visual differences

If two modes look nearly identical, the demo is probably not communicating enough.

## Concept demo vs full integration

ThreePlay allows both, but they should be labeled by behavior rather than by documentation banners.

### Use a concept demo when

- full external assets are unnecessary
- the key idea can be shown with procedural content
- external dependencies would add complexity without improving the point

### Use a fuller integration when

- the API itself is part of the lesson
- the demo would be misleading without the real workflow

## Code guidance

### Prefer shared helpers for

- renderer creation
- camera setup
- orbit controls
- resize synchronization
- animation loops

### Keep local in the demo

- scene objects
- state
- event handlers
- specialized rendering behavior

### Avoid

- adding heavy abstractions for one demo
- copying large chunks of shell/layout code
- introducing build-only workflows unless the whole site needs them

## Documentation updates

When adding or replacing a demo:

1. update `src/data/lessons.js`
2. ensure homepage metadata remains accurate
3. update `docs/demo-index.md` if the description or intent changes

## Validation checklist

Before considering a demo done, verify:

- it opens from the homepage
- first load framing is usable
- main mode changes are visually obvious
- controls affect the scene as expected
- desktop side panel is usable without page scrolling
- previous/next navigation still works

# 🎨 Infinite Canvas X

An experimental infinite whiteboard built around a custom Canvas 2D engine.

It is a playground for the kind of architecture behind whiteboards, design tools, and map-like canvases: a scene made of interactive layers, a camera that transforms user input into world coordinates, selective redraws, spatial indexing, object serialization, and UI workflows built on top of those primitives.

The UI lives in framework adapters under `apps/` (Vue is the default); shared canvas logic lives in `@infinite-canvas-x/canvas-engine` and `@infinite-canvas-x/canvas-app`.

This is a work-in-progress playground. Future directions include local-first storage, more complete text transformation presets, undo/redo, asset upload, and experiments with lower-level rendering backends such as Rust, WebAssembly and WebGPU.

<img width="1400" height="929" alt="image" src="https://github.com/user-attachments/assets/ba8751be-390a-4704-aea5-2db90e8bc9e9" />

## **Features**

- Infinite, canvas-based whiteboard with panning and zooming.
- Selectable, movable, and resizable layers.
- Sticky-note style objects with in-place text editing and formatting.
- Copy, paste, escape-to-deselect, and backspace-to-delete shortcuts.
- Per-image filters such as brightness, contrast, saturation, vibrance, hue, blur, noise, and pixelation.
- Experimental text-on-curve editing based on Bezier spline control points to create aesthetically pleasing shapes.

## **Engineering**

- **Rendering System**: Tile-based rendering. Only re-renders dirty regions to maximize performance.
- **On-demand render loop** for minimal CPU consumption.
- **Text and image snapshot caching** to avoid re-rendering of unchanged content.

### Performance Optimizations

- **Tile-based indexing** divides canvas into 2048×2048 pixel tiles.
- **Dirty tile tracking** for minimal redraws and efficient hit testing.
- **Text and image snapshot caching** to avoid re-rendering of unchanged content.

### Graphics Primitives

- **Shapes**: Rectangles, rounded rectangles, circles, curves.
- **Image rendering** with filters and effects.
- **Text rendering** with alignment, decorations, font styles, and snapshot caching.
- **Text transformations** with highly interactive curves to create aesthetically pleasing shapes.
- **Selection handles** with interactive corner markers.

## **Getting Started**

```bash
# Install dependencies
pnpm install

# Start development server (Vue by default)
pnpm dev

# Run a specific UI adapter
pnpm dev:vue
pnpm dev:svelte
pnpm dev:solid
pnpm dev:react

# Build for production (Vue by default)
pnpm build

# Build a specific adapter
pnpm build:vue
pnpm build:svelte
pnpm build:solid
pnpm build:react

# Run linting
pnpm lint

# Format code
pnpm format
```

### Project layout

```
packages/
  canvas-engine/   # Canvas entities, renderer, camera, spatial index
  canvas-app/      # App state, tools, slices (framework-agnostic)
apps/
  vue/             # Default UI adapter
  svelte/
  solid/
  react/
```

# 🎨 Infinite Canvas X

An experimental infinite whiteboard built around a custom Canvas 2D engine.

It is a playground for the kind of architecture behind whiteboards, design tools, and map-like canvases: a scene made of interactive layers, a camera that transforms user input into world coordinates, selective redraws, spatial indexing, object serialization, and UI workflows built on top of those primitives.

The React app is the user-facing whiteboard; the internal `@infinite-canvas-x/canvas-engine` workspace package contains the reusable canvas entities, renderer, camera, render manager, spatial index, math utilities, and serialization code.

This is a work-in-progress playground. Future directions include local-first storage, more complete text transformation presets, undo/redo, asset upload, and experiments with lower-level rendering backends such as Rust, WebAssembly, and WebGPU.

<img width="1400" height="929" alt="image" src="https://github.com/user-attachments/assets/ba8751be-390a-4704-aea5-2db90e8bc9e9" />

## ✨ **Features**

- Infinite, canvas-based whiteboard with panning and zooming.
- Selectable, movable, and resizable layers.
- Sticky-note style objects with in-place text editing and formatting.
- Copy, paste, escape-to-deselect, and backspace-to-delete shortcuts.
- Per-image filters such as brightness, contrast, saturation, vibrance, hue, blur, noise, and pixelation.
- Experimental text-on-curve editing based on Bezier spline control points to create aesthetically pleasing shapes.

## 🛠️ **Engineering**

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

## 🚦 **Getting Started**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format
```

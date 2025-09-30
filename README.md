# 🎨 Mini Rendering Engine

I'm very interested in the rendering technologies used by graphic editors, design tools, geo-maps, and virtual whiteboards. This is my humble attempt to understand and recreate the core ideas behind these tools, which use technologies like Canvas2D/SVG to render and manipulate 2D graphics in browsers.

Many editors and design tools use low-level rendering technologies for 2D graphics with GPU acceleration to achieve better performance and experience.

I plan to rewrite the rendering part of the canvas with C++ or Rust in the future and turn this project into a WebGL/WebGPU + WASM rendering engine. However, the current project completion is still relatively low, and it's mainly a playground where I try different approaches and technologies:

## ✨ **Features**

- 🎨&nbsp;Infinite, canvas-based whiteboard.
- 🔍&nbsp;Zoom and panning support.
- 📋&nbsp;Copy-paste support.
- 🌃&nbsp;Photo editor with filters and effects.
- 📝&nbsp;Text transformations with highly interactive curves to create aesthetically pleasing shapes with less effort.
- ⚒️&nbsp;Movable and resizable stickers with in-place text editing and formatting.
- 💾&nbsp;Local-first support (autosaves to the browser) with online synchronization.

## 🛠️ **Engineering**

- **🎨&nbsp;Rendering System**: Tile-based rendering for minimal redraws. Only re-renders dirty regions to maximize performance.
- **🔍&nbsp;Spatial Indexing**: `O(log n)` lookup times for canvas objects to maximize pickup efficiency.
- **⚒️&nbsp;On-demand game loop** for minimal CPU consumption.
- **📝&nbsp;Text and image snapshot caching** to avoid heavy re-rendering of unchanged content.
- **💾&nbsp;State persistence** with IndexedDB integration and online synchronization via PouchDB.

### Graphics Primitives

- ✨ **Shapes**: Rectangles, rounded rectangles, circles, curves.
- 🖼️ **Image rendering** with filters and effects.
- 📝 **Text rendering** with alignment, decorations, font styles, and snapshot caching.
- 📝 **Text transformations** with smooth and highly interactive curves to create aesthetically pleasing shapes with less effort.
- 🎯 **Selection handles** with interactive corner markers.

### Interaction & Navigation

- 🎮 **Camera system** with pan, zoom, and smooth navigation.
- 🖱️ **Mouse/touch input** with proper coordinate transformation.
- 🎯 **Layer picking** and selection based on screen coordinates.
- ⌨️ **Keyboard shortcuts** for enhanced productivity.

### Data Management

- 💾 **Scene persistence** with IndexedDB.
- 🔄 **Real-time online synchronization** via PouchDB.
- 📦 **Layer serialization** for save/load functionality.

### Performance Optimizations

- 🗺️ **Tile-based indexing** divides canvas into 2048×2048 pixel tiles.
- 🎭 **Dirty tile tracking** for minimal redraws and efficient hit testing.
- 💾 **Text and image snapshot caching** to avoid heavy re-rendering of unchanged content.

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

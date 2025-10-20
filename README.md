# 🎨 2D Rendering Engine + Whiteboard X

I'm passionate about the low-level rendering technologies used by graphic editors, design tools, geo-maps, and virtual whiteboards. This is my implementation of a graphic editor / virtual whiteboard built with a homegrown 2D rendering engine (CPU-based).

The rendering engine is built with **zero dependencies** using pure Canvas API and math.  
The application itself is built with React and serves to demonstrate the capabilities of the engine.

I plan to rewrite the rendering part of the canvas with Rust in the future, as well as use more low-level rendering technologies for 2D graphics with GPU acceleration, and eventually turn this project into a Rust + WASM + WebGPU rendering engine to achieve better performance and experience.

<img width="1400" height="929" alt="image" src="https://github.com/user-attachments/assets/ba8751be-390a-4704-aea5-2db90e8bc9e9" />

## ✨ **Features**

- 🎨&nbsp;Infinite, canvas-based whiteboard.
- 🔍&nbsp;Zoom and panning support.
- 📋&nbsp;Copy-paste support.
- 🌃&nbsp;Photo editor with filters and effects.
- 📝&nbsp;Text transformations with highly interactive curves to create aesthetically pleasing shapes.
- ⚒️&nbsp;Movable and resizable stickers with in-place text editing and formatting.
- 💾&nbsp;Local-first support (autosaves to the browser).

## 🛠️ **Engineering**

- **🎨&nbsp;Rendering System**: Tile-based rendering. Only re-renders dirty regions to maximize performance.
- **🔍&nbsp;Spatial Indexing**: `O(log n)` lookup times for canvas objects to maximize pickup efficiency.
- **⚒️&nbsp;On-demand game loop** for minimal CPU consumption.
- **📝&nbsp;Text and image snapshot caching** to avoid re-rendering of unchanged content.
- **💾&nbsp;State persistence** with IndexedDB browser storage via PouchDB.

### Performance Optimizations

- 🗺️ **Tile-based indexing** divides canvas into 2048×2048 pixel tiles.
- 🎭 **Dirty tile tracking** for minimal redraws and efficient hit testing.
- 💾 **Text and image snapshot caching** to avoid re-rendering of unchanged content.

### Graphics Primitives

- ✨ **Shapes**: Rectangles, rounded rectangles, circles, curves.
- 🖼️ **Image rendering** with filters and effects.
- 🔤 **Text rendering** with alignment, decorations, font styles, and snapshot caching.
- 📝 **Text transformations** with highly interactive curves to create aesthetically pleasing shapes.
- 🎯 **Selection handles** with interactive corner markers.

### Interaction & Navigation

- 🎮 **Camera system** with pan, zoom, and smooth navigation.
- 🖱️ **Mouse input** with proper coordinate transformation.
- 🎯 **Layer picking** and selection based on screen coordinates.
- ⌨️ **Keyboard shortcuts** for enhanced productivity.

### Data Management

- 💾 **Scene persistence** with IndexedDB.
- 📦 **Layer serialization** for save/load functionality.

## 🚀 **Next steps**

- Complete real-time online synchronization via PouchDB.

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

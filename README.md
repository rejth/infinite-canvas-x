# 🎨 Mini Rendering Engine

I'm very interested in the rendering technologies of graphic editors, design tools, geo maps, and virtual whiteboards. This is my humble attempt to understand and recreate the core ideas behind tldraw, excalidraw, kittl, and other tools that use technologies like Canvas2D/SVG for rendering 2D graphics in browser.

Many editors and design tools use low-level rendering technologies for 2D graphics with GPU acceleration to achieve better performance and experience.

I plan to rewrite the rendering part of the canvas with C++ or Rust in the future and turn this project into a WebGL/WebGPU + WebAssembly rendering engine. However, the current project completion is still relatively low, and it's mainly a playground where I try different approaches and technologies:

### ✨ **Features**

- 🎨&nbsp;Infinite, canvas-based whiteboard.
- 🔍&nbsp;Zoom and panning support.
- ⚒️&nbsp;Movable and resizable stickers with in-place text editing and formatting.
- 📋&nbsp;Copy-pase support.
- 💾&nbsp;Local-first support (autosaves to the browser) - in progress.

### 🛠️ **Engineering**

- **🎨&nbsp;Rendering System**: Tile-based rendering. Only re-renders dirty regions to maximize performance.
- **🔍&nbsp;Spatial Indexing**: `O(log n)` lookup times for object to maximize pickup efficiency.
- **💾&nbsp;IndexedDB Storage**: Local browser storage for canvas state persistence.

### 🚀 **Next steps**

- Using Bezier curves to render and shape text.

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

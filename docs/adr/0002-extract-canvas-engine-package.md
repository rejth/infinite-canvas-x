# Extract Canvas Engine as an Internal Workspace Package

The app's headless canvas engine lived under `src/core` while React UI, hooks, persistence, and editor workflows consumed its internals directly. We decided to extract the reusable engine into the private workspace package `@infinite-canvas-x/canvas-engine`, built to ESM and TypeScript declarations, while leaving React/app glue and storage adapters in the app. The old `src/core` files remain as temporary compatibility shims so the package becomes the source of truth without forcing a risky all-at-once import rewrite.

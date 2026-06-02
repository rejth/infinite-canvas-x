# Extract IndexedDB Store as an Internal Workspace Package

The app had a generic IndexedDB store wrapper mixed into `src/core/storage`, alongside canvas-specific database setup and seed data. We decided to extract the reusable IndexedDB Store primitive into the private workspace package `@infinite-canvas-x/indexed-db-store`, built to ESM and TypeScript declarations, while keeping canvas database schema and app-specific storage services in the app. This gives the utility a real package boundary and test suite without the release overhead of a separate repository or public package.

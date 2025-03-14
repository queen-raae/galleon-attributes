import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.js",
      name: "GalleonAttributes",
      formats: ["iife"],
      fileName: () => `script.js`,
    },
  },
  server: {
    open: true, // Opens the browser on dev server start
  },
});

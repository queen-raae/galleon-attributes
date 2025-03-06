import { defineConfig } from "vite";
import htmlInject from "vite-plugin-html-inject";

export default defineConfig({
  plugins: [htmlInject()],
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

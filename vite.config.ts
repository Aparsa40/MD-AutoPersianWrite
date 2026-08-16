import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Mermaid is intentionally lazy-loaded because its renderer is a large,
    // optional feature. Keep the normal application chunks on the default
    // 500 kB budget while allowing the isolated Mermaid async chunk.
    chunkSizeWarningLimit: 1500,
   /* rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react(?:-dom)?[\\/]/,
              priority: 30,
            },
            {
              name: "mermaid-vendor",
              test: /node_modules[\\/]mermaid[\\/]/,
              maxSize: 400 * 1024,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              maxSize: 400 * 1024,
              priority: 10,
            },
          ],
        },
      },
    },*/
  },
});

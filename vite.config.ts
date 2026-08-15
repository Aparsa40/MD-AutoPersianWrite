import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
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
    },
  },
});

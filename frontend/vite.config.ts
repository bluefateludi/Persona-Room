import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] },
    // Browser artifacts and alternate builds must not become source watchers on Windows.
    watch: { ignored: ["**/output/**", "**/.playwright-cli/**"] },
  },
  build: { chunkSizeWarningLimit: 1400 },
});

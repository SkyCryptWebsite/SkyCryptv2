import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      // Allow serving files from static/resourcepacks
      allow: [".."]
    }
  },
  build: {
    sourcemap: true
  }
});

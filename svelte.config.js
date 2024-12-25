import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors

  preprocess: vitePreprocess({ script: true }),
  ssr: {
    noExternal: process.env.NODE_ENV === "production" ? ["@napi-rs/canvas"] : []
  },
  optimizeDeps: {
    include: ["fs"]
  },

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $params: "./src/params",
      $types: "./src/lib/types",
      $db: "./src/db",
      $constants: "./src/lib/server/constants",
      $ctx: "./src/context"
    },
    csrf: {
      checkOrigin: true
    }
  },
  // Hide build warnings from node_modules
  onwarn: (warning, handler) => {
    if (warning.filename.includes("node_modules")) return;
    handler(warning);
  }
};

export default config;

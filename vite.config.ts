import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      org: "skycrypt",
      project: "skycrypt-sveltekit",
      adapter: "node"
    }),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      compilerOptions: { experimental: { async: true }, runes: true },
      experimental: {
        remoteFunctions: true,
        tracing: { server: true },
        instrumentation: { server: true }
      },
      adapter: adapter(),
      alias: {
        $params: "./src/params",
        $types: "./src/lib/types",
        $db: "./src/db",
        $constants: "./src/lib/server/constants",
        $ctx: "./src/context",
        $routes: "./src/routes",
        $src: "./src",
        $ui: "./src/lib/components/ui",
        $lib: "./src/lib",
        $utils: "./src/lib/shared/utils.ts",
        $hooks: "./src/lib/hooks",
        $components: "./src/lib/components",
        "$utils.js": "./src/lib/shared/utils.ts"
      },
      csrf: {
        trustedOrigins: [
          "https://cupcake.shiiyu.moe",
          "https://sky.shiiyu.moe",
          "http://localhost:5173",
          "http://localhost:4173",
          "http://localhost:3000",
          "http://localhost:8080"
        ]
      },
      csp: {
        mode: "auto",
        directives: {
          "script-src": ["self", "unsafe-inline"],
          "worker-src": ["self", "blob:"],
          "style-src": ["self", "unsafe-inline", "https://fonts.googleapis.com"],
          "img-src": [
            "self",
            "data:",
            "https://textures.minecraft.net",
            "http://localhost:8080",
            "https://cupcake.shiiyu.moe",
            "https://sky.shiiyu.moe",
            "https://nmsr.nickac.dev",
            "https://cms.shiiyu.moe",
            "http://localhost:3000",
            "https://eliteskyblock.com"
          ],
          "connect-src": [
            "self",
            "https://mowojang.matdoes.dev",
            "https://mowojang.seraph.si",
            "http://localhost:8080",
            "https://cupcake.shiiyu.moe",
            "https://sky.shiiyu.moe",
            "https://cms.shiiyu.moe",
            "http://localhost:3000"
          ],
          "font-src": ["self", "https://fonts.gstatic.com"],
          "frame-ancestors": ["self", "https://cms.shiiyu.moe", "http://localhost:3000"],
          "frame-src": ["self"]
        }
      },
      version: {
        name: process.env.PUBLIC_COMMIT_HASH,
        // in ms
        pollInterval: 1000 * 60 // 1 minute
      },
      typescript: {
        config: (config) => ({
          ...config,
          include: [...config.include, "../drizzle.config.ts"]
        })
      },
      vitePlugin: {
        experimental: {
          sendWarningsToBrowser: process.env.NODE_ENV === "development"
        },
        inspector: process.env.NODE_ENV === "development"
      }
    }),
    tailwindcss()
  ],
  build: { sourcemap: true },
  test: {
    expect: { requireAssertions: true },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }]
          },
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"]
        }
      },

      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}", "scripts/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"]
        }
      }
    ]
  },
  define: {
    __NPM_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version || "")
  }
});

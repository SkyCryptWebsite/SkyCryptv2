import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { sentrySvelteKit } from "@sentry/sveltekit/vite";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

const env = loadEnv(process.env.NODE_ENV ?? "production", root, "");

// SvelteKit reloads this config for the client build; both bundles need the same prerender ID.
const prerenderVersion = (env.SKYCRYPT_PRERENDER_VERSION ??= randomUUID());

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      org: "skycrypt",
      project: "skycrypt-sveltekit",
      adapter: "node",
      authToken: env.SENTRY_AUTH_TOKEN
    }),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      compilerOptions: { experimental: { async: true }, runes: true },
      experimental: {
        remoteFunctions: true,
        sendWarningsToBrowser: env.NODE_ENV === "development"
      },
      tracing: { server: true },
      inspector: env.NODE_ENV === "development",
      adapter: adapter(),
      paths: {
        origin: env.PUBLIC_ORIGIN || env.ORIGIN
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
          "script-src": ["self", "unsafe-inline", "https://challenges.cloudflare.com"],
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
            "https://eliteskyblock.com",
            "https://cdn.discordapp.com"
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
          "frame-src": ["self", "https://challenges.cloudflare.com"]
        }
      },
      version: {
        name: env.PUBLIC_COMMIT_HASH,
        // in ms
        pollInterval: 1000 * 60 // 1 minute
      }
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      $params: `${root}/src/params`,
      $types: `${root}/src/lib/types`,
      $db: `${root}/src/db`,
      $constants: `${root}/src/lib/server/constants`,
      $ctx: `${root}/src/context`,
      $routes: `${root}/src/routes`,
      $src: `${root}/src`,
      $ui: `${root}/src/lib/components/ui`,
      $utils: `${root}/src/lib/shared/utils.ts`,
      $hooks: `${root}/src/lib/hooks`,
      $components: `${root}/src/lib/components`,
      "$utils.js": `${root}/src/lib/shared/utils.ts`
    }
  },
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
    __PRERENDER_VERSION__: JSON.stringify(prerenderVersion),
    __NPM_PACKAGE_VERSION__: JSON.stringify(env.npm_package_version || "")
  }
});

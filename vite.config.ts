import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import evlog from "evlog/vite";
import { mdsvex } from "mdsvex";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

const env = loadEnv(process.env.NODE_ENV ?? "production", root, "");

// SvelteKit reloads this config for the client build; both bundles need the same prerender ID.
const prerenderVersion = (process.env.SKYCRYPT_PRERENDER_VERSION ??= randomUUID());

export default defineConfig({
  plugins: [
    // Strips log.debug() from production builds and tags dev logs with file:line. Logger config lives in evlog.config.ts.
    evlog({ strip: ["debug"], sourceLocation: "dev" }),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: [vitePreprocess(), mdsvex({ extensions: [".svx", ".md"] })],
      compilerOptions: { experimental: { async: true }, runes: true },
      experimental: {
        remoteFunctions: true,
        sendWarningsToBrowser: process.env.NODE_ENV === "development"
      },
      inspector: process.env.NODE_ENV === "development",
      adapter: adapter(),
      paths: {
        origin: env.PUBLIC_ORIGIN || env.ORIGIN || process.env.PUBLIC_ORIGIN || process.env.ORIGIN
      },
      csrf: {
        trustedOrigins: [
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
            "https://sky.shiiyu.moe",
            "https://nmsr.nickac.dev",
            "https://media.shiiyu.moe",
            "https://eliteskyblock.com",
            "https://cdn.discordapp.com"
          ],
          "connect-src": [
            "self",
            "https://mowojang.matdoes.dev",
            "https://mowojang.seraph.si",
            "http://localhost:8080",
            "https://sky.shiiyu.moe",
            "https://*.r2.cloudflarestorage.com"
          ],
          "media-src": ["self", "https://media.shiiyu.moe"],
          "font-src": ["self", "https://fonts.gstatic.com"],
          "frame-ancestors": ["none"],
          // Keep the embed hosts in sync with EMBED_HOSTS in src/lib/server/rich-text.ts.
          "frame-src": [
            "self",
            "https://challenges.cloudflare.com",
            "https://www.youtube.com",
            "https://youtube.com",
            "https://www.youtube-nocookie.com",
            "https://player.vimeo.com",
            "https://streamable.com",
            "https://open.spotify.com"
          ]
        }
      },
      version: {
        name: process.env.PUBLIC_COMMIT_HASH,
        // in ms
        pollInterval: 1000 * 60 // 1 minute
      },
      extensions: [".svelte", ".svx", ".md"]
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      // Mirrors the `#lib` import map in package.json, but lets Vite resolve imports without file extensions.
      "#lib": `${root}/src/lib`,
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
    __NPM_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version || "")
  }
});

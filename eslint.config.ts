import path from "node:path";
import js from "@eslint/js";
import { plugin as shadcn } from "@shadcn/lint";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off"
    }
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser
      }
    },
    plugins: {
      shadcn
    },
    rules: {
      "shadcn/no-raw-colors": "error",
      "shadcn/no-unknown-classes": "warn"
    }
  },
  // Override or add rule settings here, such as:
  // 'svelte/button-has-type': 'error'
  {
    rules: {
      "svelte/no-at-html-tags": "off",
      "svelte/no-useless-mustaches": "off",
      "no-nested-ternary": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],
      "no-console": [
        "error",
        {
          allow: [
            "info",
            "warn",
            "dir",
            "timeLog",
            "assert",
            "clear",
            "count",
            "countReset",
            "group",
            "groupEnd",
            "table",
            "dirxml",
            "error",
            "groupCollapsed",
            "Console",
            "profile",
            "profileEnd",
            "timeStamp",
            "context",
            "debug"
          ]
        }
      ]
    }
  },
  {
    // Server code logs through evlog (`log` / `locals.log`) so output reaches HyperDX and stays readable in Dokploy.
    files: [
      "src/hooks.server.ts",
      "src/lib/server/**/*.ts",
      "src/**/*.remote.ts",
      "src/**/+server.ts",
      "src/**/+page.server.ts",
      "src/**/+layout.server.ts"
    ],
    ignores: ["**/*.spec.ts"],
    rules: { "no-console": "error" }
  },
  {
    ignores: [
      "**/.DS_Store",
      "**/node_modules/",
      "**/build/",
      "**/.svelte-kit/",
      "**/package/",
      "**/.env",
      "**/.env.*",
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/static/",
      "**/cache/",
      "**/api/*-generated-zod.ts",
      "**/api/cms-generated.ts",
      "**/components/ui/**"
    ]
  }
);

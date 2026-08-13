import path from "node:path";
import js from "@eslint/js";
import { loadConfig } from "@sveltejs/load-config";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const svelteConfig = await loadConfig(process.cwd());

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
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  // Override or add rule settings here, such as:
  // 'svelte/button-has-type': 'error'
  {
    rules: {
      "svelte/no-at-html-tags": "off",
      "svelte/no-useless-mustaches": "off",
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

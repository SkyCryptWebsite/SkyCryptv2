import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

/** @type { import("eslint").Linter.FlatConfig } */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    rules: {
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
      "svelte/no-at-html-tags": "off"
    }
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2017,
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  { ignores: ["**/.DS_Store", "**/node_modules/", "**/build/", "**/.svelte-kit/", "**/package/", "**/.env", "**/.env.*", "**/pnpm-lock.yaml", "**/package-lock.json", "**/yarn.lock", "**/NotEnoughUpdates-REPO/", "**/static/", "**/cache/"] }
];

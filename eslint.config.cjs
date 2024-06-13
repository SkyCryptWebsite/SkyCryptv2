// extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:svelte3/recommended", "prettier"],
import eslintRecommended from "eslint:recommended";
import typescriptEslintRecommended from "plugin:@typescript-eslint/recommended";
import svelte3Recommended from "plugin:svelte3/recommended";
import prettier from "prettier";

export default [
  {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"]
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ["*.svelte"]
    }
  ],
  ignorePatterns: ["node_modules/", "build/", ".svelte-kit/", "package/", ".env", ".env.*", "pnpm-lock.yaml", "package-lock.json", "yarn.lock"]
}]


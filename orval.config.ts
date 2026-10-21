import { defineConfig } from "orval";

export default defineConfig({
  skycrypt: {
    input: "http://localhost:8080/api/openapi/doc.json",
    output: {
      target: "./src/lib/shared/api/orval-generated.ts",
      client: "fetch",
      tsconfig: "./tsconfig.json",
      override: {
        mutator: {
          path: "./src/lib/shared/api/mutator/custom-instance.ts",
          name: "customFetch"
        }
      }
    },
    hooks: {
      afterAllFilesWrite: "oxfmt ./src/lib/shared/api/orval-generated.ts"
    }
  },
  skycryptZod: {
    input: "http://localhost:8080/api/openapi/doc.json",
    output: {
      target: "./src/lib/shared/api/orval-generated-zod.ts",
      client: "zod",
      tsconfig: "./tsconfig.json",
      fileExtension: ".zod.ts"
    },
    hooks: {
      afterAllFilesWrite: "oxfmt ./src/lib/shared/api/orval-generated-zod.ts"
    }
  },
  patreon: {
    input: "https://raw.githubusercontent.com/ghostrider-05/patreon-api-spec/refs/heads/main/specs/openapi.json",
    output: {
      target: "./src/lib/shared/api/patreon-generated.ts",
      client: "fetch",
      tsconfig: "./tsconfig.json"
    },
    hooks: {
      afterAllFilesWrite: "oxfmt ./src/lib/shared/api/patreon-generated.ts"
    }
  }
});

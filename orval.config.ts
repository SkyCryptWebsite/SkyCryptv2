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
  cms: {
    input: "http://localhost:3000/api/openapi.json",
    output: {
      target: "./src/lib/shared/api/cms-generated.ts",
      client: "fetch",
      tsconfig: "./tsconfig.json",
      override: {
        mutator: {
          path: "./src/lib/shared/api/mutator/cms-instance.ts",
          name: "cmsFetch"
        }
      }
    },
    hooks: {
      afterAllFilesWrite: "oxfmt ./src/lib/shared/api/cms-generated.ts"
    }
  }
});

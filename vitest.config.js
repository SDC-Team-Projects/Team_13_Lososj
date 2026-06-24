import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],

    coverage: {
      exclude: [
    "src/**/*.css"
    ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
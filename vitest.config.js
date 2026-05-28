import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
    provider: "v8",
    reporter: ["text", "html"],
  },
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js'],


    coverage: {
      reporter: ["text", "html"],
    },
}
})
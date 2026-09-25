import { defineConfig } from "vitest/config";

// Only pure rule modules are unit tested (constitution, principle III).
// They must never touch Foundry globals, so a plain Node environment is enough.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.mjs"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["module/rules/**", "module/config.mjs"],
      reporter: ["text", "html"]
    }
  }
});

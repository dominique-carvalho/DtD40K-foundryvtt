import js from "@eslint/js";
import globals from "globals";

// Foundry VTT runtime globals, read-only for linting purposes.
const foundryGlobals = {
  foundry: "readonly",
  game: "readonly",
  CONFIG: "readonly",
  CONST: "readonly",
  Hooks: "readonly",
  ui: "readonly",
  Actor: "readonly",
  ChatMessage: "readonly",
  Roll: "readonly"
};

export default [
  {
    ignores: ["node_modules/", "coverage/", "dist/", "build/", "graphify-out/", "*.min.js"]
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...foundryGlobals }
    }
  },
  {
    // Pure rule modules must not depend on Foundry (constitution, principle III).
    files: ["module/rules/**/*.mjs", "module/config.mjs"],
    languageOptions: {
      globals: {}
    }
  },
  {
    files: ["tests/**/*.mjs", "*.config.mjs"],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
];

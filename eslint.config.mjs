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
  Item: "readonly",
  ActiveEffect: "readonly",
  ChatMessage: "readonly",
  Combat: "readonly",
  Combatant: "readonly",
  canvas: "readonly",
  Roll: "readonly"
};

// Pure rule modules must not depend on Foundry (constitution, principle III).
// Flat config merges `languageOptions.globals` across matching blocks, so the
// only way to keep these files free of browser/Foundry globals is to never
// match them with the block that declares those globals.
const pureFiles = ["module/rules/**", "module/config.mjs"];
const nodeFiles = ["tests/**", "scripts/**", "*.config.mjs"];

export default [
  {
    ignores: ["node_modules/", "coverage/", "dist/", "build/", "graphify-out/", "*.min.js"]
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    }
  },
  {
    files: ["**/*.mjs", "**/*.js"],
    ignores: [...pureFiles, ...nodeFiles],
    languageOptions: {
      globals: { ...globals.browser, ...foundryGlobals }
    }
  },
  {
    // Host-agnostic APIs available in both Node (tests) and the browser (Foundry).
    files: pureFiles,
    languageOptions: {
      globals: { structuredClone: "readonly" }
    }
  },
  {
    files: nodeFiles,
    languageOptions: {
      globals: { ...globals.node }
    }
  }
];

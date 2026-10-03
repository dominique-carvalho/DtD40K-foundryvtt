import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Design system checks (spec 021, contracts/rules-api.md): text contrast of both token variants, style files listed in
 * system.json, bundled fonts and their licenses. Reads the files only; no Foundry.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(root, path), "utf8");

/**
 * Hex colors of the block that follows a `@variant <name>` marker in tokens.css.
 * @param {string} name
 * @returns {Record<string, string>}
 */
function variant(name) {
  const css = read("styles/tokens.css");
  const start = css.indexOf(`@variant ${name}`);
  if (start < 0) return {};
  const open = css.indexOf("{", start);
  const block = css.slice(open, css.indexOf("}", open));
  return Object.fromEntries([...block.matchAll(/--dtd-([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map(([, key, hex]) => [key, hex]));
}

/** WCAG relative luminance. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio. */
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("design tokens: text contrast (SC-003)", () => {
  const cases = {
    vellum: ["ink", "ink-muted", "ink-subtle", "lapis", "seal", "phosphor"],
    cogitator: ["ink", "ink-muted", "ink-subtle", "lapis", "brass", "phosphor"]
  };
  for (const [name, texts] of Object.entries(cases)) {
    it(`${name}: text tokens reach 4.5:1 on paper and raised paper`, () => {
      const tokens = variant(name);
      for (const surface of ["paper", "paper-raised"]) {
        expect(tokens[surface], `${name} ${surface}`).toMatch(/^#/);
        for (const text of texts) {
          expect(tokens[text], `${name} ${text}`).toMatch(/^#/);
          expect(contrast(tokens[text], tokens[surface]), `${name} ${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

describe("design system files (SC-005)", () => {
  it("lists only existing style files in system.json", () => {
    const styles = JSON.parse(read("system.json")).styles;
    expect(styles).toContain("styles/tokens.css");
    for (const path of styles) expect(existsSync(join(root, path)), path).toBe(true);
  });

  it("points every @font-face to a bundled font", () => {
    const urls = [...read("styles/fonts.css").matchAll(/url\("\.\.\/(fonts\/[^"]+)"\)/g)].map(([, path]) => path);
    expect(urls.length).toBeGreaterThanOrEqual(8);
    for (const path of urls) expect(existsSync(join(root, path)), path).toBe(true);
  });

  it("ships the OFL license of every font family", () => {
    const files = readdirSync(join(root, "fonts"));
    const families = new Set(files.filter((f) => f.endsWith(".woff2")).map((f) => f.replace(/-latin-.*$/, "")));
    for (const family of families) expect(files, family).toContain(`OFL-${family}.txt`);
  });
});

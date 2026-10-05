/**
 * Icon pipeline helpers (spec 024, contracts/icon-pipeline.md). Pure: no file system, no Foundry.
 * Each compendium document gets a Cogitator plate (research R2): an iron octagon, a brass ring with four rivets, an
 * inner fillet and a flat glyph from game-icons.net, both in the color of the document's category.
 */

/** Category colors: only design tokens of styles/tokens.css (dark variant, research R3). */
export const ICON_COLORS = {
  seal: "#c8372f",
  warning: "#e0963a",
  phosphor: "#62f08f",
  brassBright: "#e2bd66",
  brass: "#c09a48",
  ink: "#e8dfca",
  inkMuted: "#b3a88f"
};

const PLATE = "#1c2124";
const RIM = "#c09a48";
const BACKGROUND = "M0 0h512v512H0z";
const RIVETS = [[50, 4], [96, 50], [50, 96], [4, 50]];

/**
 * Stable kebab-case ASCII name of a document.
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
  return String(name).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Fill paths of a game-icons.net SVG, without its black background square.
 * @param {string} glyphSvg
 * @returns {{d: string, fillRule?: string}[]}
 */
export function glyphPaths(glyphSvg) {
  const paths = [];
  for (const [, attrs] of String(glyphSvg).matchAll(/<path\b([^>]*?)\/?>/g)) {
    const d = attrs.match(/\sd="([^"]+)"/)?.[1];
    if (!d || d === BACKGROUND) continue;
    const fillRule = attrs.match(/\sfill-rule="([^"]+)"/)?.[1];
    paths.push(fillRule ? { d, fillRule } : { d });
  }
  if (!paths.length) throw new Error("The glyph has no paths.");
  return paths;
}

/**
 * Path data with one decimal: the glyph is drawn at ~1/10 of its 512 grid, so the rest is invisible and only weighs on
 * the release package (SC-006).
 * @param {string} d
 * @returns {string}
 */
export function compactPath(d) {
  // SVG numbers may touch ("1.2.04", "5-3"): tokenize, round, and write each one so it cannot merge with the last.
  let out = "";
  let last = null;
  for (const [token, number] of d.matchAll(/([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)|[a-df-z]|[^\s,]/gi)) {
    if (number === undefined) {
      out += token;
      last = null;
      continue;
    }
    const value = Math.round(Number(number) * 10) / 10;
    const text = String(value === 0 ? 0 : value).replace(/^(-?)0\./, "$1.");
    const merges = last !== null && (/^\d/.test(text) || (text.startsWith(".") && !last.includes(".")));
    out += (merges ? " " : "") + text;
    last = text;
  }
  return out;
}

/**
 * The final SVG of an icon: plate, rim, fillet, rivets and glyph (research R2). 512 px wide so tokens stay sharp.
 * @param {{glyphSvg: string, color: string}} input
 * @returns {string}
 */
export function composeIcon({ glyphSvg, color }) {
  if (!Object.values(ICON_COLORS).includes(color)) throw new Error(`Color ${color} is not a design token.`);
  const glyph = glyphPaths(glyphSvg).map(({ d, fillRule }) => `<path d="${compactPath(d)}" fill="${color}"${fillRule ? ` fill-rule="${fillRule}"` : ""}/>`).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">'
    + `<path d="M30 2H70L98 30V70L70 98H30L2 70V30Z" fill="${PLATE}"/>`
    + `<path d="M31 6H69L94 31V69L69 94H31L6 69V31Z" fill="none" stroke="${RIM}" stroke-width="2.5"/>`
    + `<path d="M33 11H67L89 33V67L67 89H33L11 67V33Z" fill="none" stroke="${color}" stroke-width="1" opacity=".55"/>`
    + `<g transform="translate(23 23) scale(.105)">${glyph}</g>`
    + RIVETS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${RIM}"/>`).join("")
    + "</svg>\n";
}

/**
 * Round seal of a condition or effect (spec 025, research R1): iron disc, a ring in the color of its severity group and a
 * light glyph, readable at 20 px over a token.
 * @param {{glyphSvg: string, color: string}} input
 * @returns {string}
 */
export function composeSeal({ glyphSvg, color }) {
  if (!Object.values(ICON_COLORS).includes(color)) throw new Error(`Color ${color} is not a design token.`);
  const glyph = glyphPaths(glyphSvg).map(({ d, fillRule }) => `<path d="${compactPath(d)}" fill="${ICON_COLORS.ink}"${fillRule ? ` fill-rule="${fillRule}"` : ""}/>`).join("");
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">'
    + `<circle cx="50" cy="50" r="48" fill="${PLATE}"/>`
    + `<circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="6"/>`
    + `<g transform="translate(20 20) scale(.117)">${glyph}</g>`
    + "</svg>\n";
}

/**
 * Value a rule field reads from a document.
 * @param {object} doc
 * @param {{pack: string, parentType?: string}} where
 * @param {string} field
 */
function fieldOf(doc, where, field) {
  switch (field) {
    case "pack": return where.pack;
    case "parentType": return where.parentType ?? "";
    case "kind": return Array.isArray(doc.results) ? "table" : doc.items !== undefined || doc.prototypeToken ? "actor" : "item";
    case "type": return doc.type;
    default: return doc.system?.[field];
  }
}

/**
 * Category of a document: the first one with a rule whose fields all match (a field may list several values).
 * @param {object} doc  compendium document (or an item embedded in an actor)
 * @param {{pack: string, parentType?: string}} where  its pack; for embedded items the type of the actor
 * @param {object[]} categories
 * @returns {object|null}
 */
export function categoryFor(doc, where, categories) {
  return categories.find((category) => category.match.some((rule) => Object.entries(rule).every(([field, wanted]) => {
    const value = fieldOf(doc, where, field);
    return Array.isArray(wanted) ? wanted.includes(value) : value === wanted;
  }))) ?? null;
}

/**
 * Glyph of a document: its curated one, then the one of its compendium twin (same type and name, for embedded items),
 * then the category default.
 * @param {{key: string, name: string, type: string, category: object, curation: Record<string, string>,
 *   compendiumGlyphs: Record<string, string>}} input
 * @returns {{glyph: string, curated: boolean}}
 */
export function glyphFor({ key, name, type, category, curation, compendiumGlyphs }) {
  if (curation[key]) return { glyph: curation[key], curated: true };
  const twin = compendiumGlyphs[`${type}/${name}`];
  if (twin) return { glyph: twin, curated: true };
  return { glyph: category.glyph, curated: false };
}

/**
 * File path of each document, relative to assets/icons (research R5). Documents of one category with the same name and
 * glyph share a file; a second glyph under the same name gets the pack as suffix. Deterministic whatever the order.
 * @param {{key: string, name: string, category: string, glyph: string, pack: string}[]} entries
 * @returns {Map<string, string>}
 */
export function assignPaths(entries) {
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key, "en"));
  const taken = new Map();
  const byGlyph = new Map();
  const paths = new Map();
  for (const entry of sorted) {
    const base = `${entry.category}/${slugify(entry.name) || "unnamed"}`;
    const glyphKey = `${base}|${entry.glyph}`;
    let path = byGlyph.get(glyphKey);
    if (!path) {
      path = `${base}.svg`;
      for (let n = 1; taken.has(path); n++) path = `${base}-${entry.pack}${n > 1 ? `-${n}` : ""}.svg`;
      taken.set(path, entry.glyph);
      byGlyph.set(glyphKey, path);
    }
    paths.set(entry.key, path);
  }
  return paths;
}

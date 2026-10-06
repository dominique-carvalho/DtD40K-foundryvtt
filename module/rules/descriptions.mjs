/**
 * Short descriptions for the character builder (spec 026, contracts/descriptions.md). Pure: reads compendium data and
 * returns short text and facts; the builder translates the fact keys.
 */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…" };

/**
 * Plain text of an HTML description.
 * @param {string} html
 * @returns {string}
 */
export function plainText(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|h\d|li|div)>/gi, " ").replace(/<[^>]+>/g, "")
    .replace(/&(#\d+|[a-z]+);/gi, (match, code) => (code.startsWith("#") ? String.fromCharCode(Number(code.slice(1))) : ENTITIES[code.toLowerCase()] ?? match))
    .replace(/\s+/g, " ").trim();
}

/** Cut at a word boundary with an ellipsis. */
function clip(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:—-]+$/, "")}…`;
}

/** Sentences of a text (a period, ! or ? followed by a space). */
const sentences = (text) => text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [];

/**
 * One line: the first sentence, plus the next one when the first is only a label (under 30 characters), within `max`.
 * @param {string} html
 * @param {number} [max]
 * @returns {string}
 */
export function shortLine(html, max = 180) {
  const parts = sentences(plainText(html));
  if (!parts.length) return "";
  let line = parts[0];
  if (line.length < 30 && parts[1] && line.length + parts[1].length + 1 <= max) line = `${line} ${parts[1]}`;
  return clip(line, max);
}

/**
 * The first paragraph with text, skipping headings.
 * @param {string} html
 * @param {number} [max]
 * @returns {string}
 */
export function firstParagraph(html, max = 420) {
  const paragraph = [...String(html ?? "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => plainText(m[1])).find(Boolean);
  return clip(paragraph ?? plainText(html), max);
}

/**
 * Facts of a race: characteristic bonus, skills, skill choice, size and power.
 * @param {object} system  race system data
 * @returns {{key: string, value: any}[]}
 */
export function raceFacts(system) {
  const facts = [];
  const bonus = system.characteristicBonus ?? {};
  if (bonus.any) facts.push({ key: "characteristic", value: "any" });
  else if (bonus.options?.length) facts.push({ key: "characteristic", value: [...bonus.options] });
  if (system.skillBonus?.skills?.length) facts.push({ key: "skills", value: [...system.skillBonus.skills] });
  if (system.skillBonus?.choose) facts.push({ key: "chooseSkills", value: system.skillBonus.choose });
  if (system.size) facts.push({ key: "size", value: system.size });
  if (system.power?.name) facts.push({ key: "power", value: { name: system.power.name, text: shortLine(system.power.text ?? system.power.description, 160) } });
  return facts;
}

/**
 * Facts of an exaltation: Power Stat, resource and the rank 1 powers.
 * @param {object} system  exaltation system data
 * @returns {{key: string, value: any}[]}
 */
export function exaltationFacts(system) {
  const facts = [];
  if (system.powerStat?.name) facts.push({ key: "powerStat", value: { name: system.powerStat.name, cap: system.powerStat.cap ?? "" } });
  if (system.resource?.name) facts.push({ key: "resource", value: system.resource.name });
  const powers = (system.powers ?? []).filter((p) => (p.rank ?? 1) <= 1).map((p) => p.name);
  if (powers.length) facts.push({ key: "powers", value: powers });
  return facts;
}

/**
 * XP and prerequisites of a feat, Asset, Hindrance or Exalted Asset (Assets, feats and Exalted Assets cost 100 at
 * creation; a Hindrance gives its XP, p. 179).
 * @param {{system: object}} feat
 * @returns {{xp: number|null, requires: string[]}}
 */
export function featFacts(feat) {
  const s = feat.system ?? {};
  const xp = s.category === "hindrance" ? s.xpGranted || 100
    : ["asset", "exaltedAsset", "feat", "racialFeat"].includes(s.category) ? -100 : null;
  const req = s.prerequisites ?? {};
  return { xp, requires: [req.race, req.exaltation, req.deity].filter(Boolean) };
}

/**
 * Level and prerequisites of a class.
 * @param {object} system  class system data
 * @returns {{level: number, skills: {keys: string[], value: number}[], feats: string[]}}
 */
export function classFacts(system) {
  const req = system.prerequisites ?? {};
  return { level: system.level ?? 1, skills: (req.skills ?? []).map((s) => ({ keys: [...s.keys], value: s.value })), feats: [...(req.feats ?? [])] };
}

/**
 * Main numbers of a starting item: weapons (damage, Pen, range, rate of fire), armor (AP, type, Max Dex), drugs
 * (addictivity).
 * @param {{type: string, system: object}} item
 * @returns {string}
 */
export function itemNumbers(item) {
  const s = item.system ?? {};
  if (item.type === "weapon") {
    const parts = [`${s.damage?.rolled ?? 0}k${s.damage?.kept ?? 0} ${s.damage?.type ?? ""}`.trim(), `Pen ${s.pen ?? 0}`];
    if (s.range?.value) parts.push(`${s.range.value} m`);
    else if (s.range?.strMultiplier) parts.push(`Str × ${s.range.strMultiplier} m`);
    const rof = [s.rof?.single ? "S" : "", s.rof?.auto ? String(s.rof.auto) : ""].filter(Boolean);
    if (s.weaponType !== "melee" && rof.length) parts.push(`ROF ${rof.join("/")}`);
    return parts.join(" · ");
  }
  if (item.type === "armor") return [`AP ${s.ap ?? 0}`, s.armorType, s.maxDex ? `Max Dex ${s.maxDex}` : ""].filter(Boolean).join(" · ");
  if (s.category === "drug" && s.addictivity) return `Addictivity ${s.addictivity}`;
  return "";
}

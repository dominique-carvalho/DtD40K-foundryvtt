// Sample character for the mockups: Jane, the example of DtD 7.7a p. 18 (Tiefling Werewolf Monk).
window.JANE = {
  name: "Jane",
  epithet: "of the Black Spiral",
  race: "Tiefling", exaltation: "Werewolf", cls: "Monk", alignment: "Malal",
  level: 1, size: 4, xp: { available: 50, total: 800 },
  hp: [11, 14], resolve: [5, 6], fatigue: [1, 3], hero: [2, 2], devotion: 6,
  power: { name: "Rage", value: 1, pool: [3, 5] },
  derived: { staticDefense: 31, mentalDefense: 22, resilience: 5, initiative: 6, socialInitiative: 4, move: 8 },
  conditions: ["Fatigued"],
  chars: { int: ["Intelligence", 2], wis: ["Wisdom", 3], wil: ["Willpower", 2], str: ["Strength", 3], dex: ["Dexterity", 4, 1], con: ["Constitution", 3], cha: ["Charisma", 2], fel: ["Fellowship", 2], cmp: ["Composure", 2] },
  // Classic layout (p. 17): rows Power/Finesse/Resistance, columns Mental/Physical/Social.
  grid: {
    rows: ["Power", "Finesse", "Resistance"],
    columns: ["Mental", "Physical", "Social"],
    cells: [["int", "str", "cha"], ["wis", "dex", "fel"], ["wil", "con", "cmp"]]
  },
  // [name, value, default characteristic, advanced]
  skills: {
    Mental: [["Academic Lore", 0, "int", true], ["Arcana", 1, "int"], ["Common Lore", 1, "int", true], ["Crafts", 0, "wis"], ["Forbidden Lore", 1, "int", true], ["Medicae", 0, "wis", true], ["Perception", 2, "wis"], ["Politics", 0, "wis", true], ["Tech-Use", 0, "int", true]],
    Physical: [["Acrobatics", 2, "dex"], ["Athletics", 2, "str"], ["Ballistics", 0, "dex"], ["Brawl", 4, "dex"], ["Drive", 0, "dex"], ["Larceny", 0, "dex"], ["Pilot", 0, "dex", true], ["Stealth", 1, "dex"], ["Weaponry", 1, "dex"]],
    Social: [["Animal Ken", 1, "cmp"], ["Charm", 0, "fel"], ["Command", 0, "cha"], ["Deceive", 1, "cha"], ["Disguise", 0, "fel"], ["Intimidation", 2, "cha"], ["Performer", 0, "fel"], ["Persuasion", 1, "cha"], ["Scrutiny", 1, "cmp"]]
  },
  specialties: { Brawl: "Claws", Intimidation: "Snarling" },
  tabs: ["Características e Perícias", "Traços", "Equipamento", "Combate", "Magia", "Marcial", "Classe e XP"],
  tabIcons: ["fa-chess-rook", "fa-dna", "fa-shield-halved", "fa-crosshairs", "fa-hat-wizard", "fa-hand-fist", "fa-scroll"]
};

/** Roll & Keep pool of a skill (rules/pool.mjs): (skill + char) k char; untrained (char − 1) k (char − 1); advanced untrained: none. */
window.pool = ([, value, char, advanced]) => {
  const c = JANE.chars[char][1];
  if (value > 0) return `${value + c}k${c}`;
  return advanced ? "—" : `${c - 1}k${c - 1}`;
};

/** Gem row: value dots out of 5 (6 when allowed); the last `bonus` dots come from race or exaltation. */
window.gems = (value, { max = 5, bonus = 0 } = {}) => {
  let out = '<span class="sm-gems">';
  for (let i = 1; i <= max; i++) {
    const cls = ["sm-gem", i <= value ? "on" : "", i > value - bonus && i <= value ? "bonus" : "", i === 6 ? "six" : ""].join(" ");
    out += `<i class="${cls}"></i>`;
  }
  return out + "</span>";
};

/** Theme toggle shared by the mockups. */
window.themeToggle = (root) => {
  const button = document.createElement("button");
  button.className = "theme-toggle";
  const sync = () => { button.textContent = root.dataset.theme === "vellum" ? "◐ Tema escuro" : "◑ Tema claro"; };
  button.addEventListener("click", () => { root.dataset.theme = root.dataset.theme === "vellum" ? "cogitator" : "vellum"; sync(); });
  const params = new URLSearchParams(location.search);
  if (params.get("theme")) root.dataset.theme = params.get("theme");
  sync();
  document.body.append(button);
};

/** Roll card of Brawl (Dexterity): 8k4 against TN 15. */
window.rollCard = () => `
  <div class="sm-card sm-surface">
    <div class="sm-card-head"><h3>Brawl · Dexterity</h3><span class="sm-data">8k4</span></div>
    <div class="sm-card-body">
      <ol class="sm-dice">
        <li class="sm-die exploded">10+6</li><li class="sm-die kept">9</li><li class="sm-die kept">8</li><li class="sm-die kept">7</li>
        <li class="sm-die dropped">5</li><li class="sm-die dropped">3</li><li class="sm-die dropped">2</li><li class="sm-die dropped">1</li>
      </ol>
      <div class="sm-total"><span class="sm-caps">Total · TN 15</span><strong>40</strong></div>
      <div class="sm-outcome">Sucesso · 5 raises</div>
    </div>
  </div>`;

/** Hooded, horned figure placeholder portrait. */
window.portrait = () => `<svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="100" height="120" fill="var(--dtd-paper-sunken)"/>
  <path d="M50 18c-17 0-27 14-27 30 0 9 3 15 6 20-9 5-19 13-22 52h86c-3-39-13-47-22-52 3-5 6-11 6-20 0-16-10-30-27-30z" fill="var(--dtd-ink)" opacity=".82"/>
  <path d="M38 40 30 26M62 40 70 26" stroke="var(--dtd-seal)" stroke-width="4" stroke-linecap="round"/>
  <circle cx="42" cy="56" r="2.4" fill="var(--dtd-seal)"/><circle cx="58" cy="56" r="2.4" fill="var(--dtd-seal)"/>
</svg>`;

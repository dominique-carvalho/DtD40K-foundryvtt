# Contrato — regras puras (007)

Módulos sem globais do Foundry (constituição III). Casos de teste obrigatórios em `tests/unit/`.

## `rules/equipment.mjs`

### `armorProfile({ armors, proficiencies, squat, bonuses })`
- `armors`: `[{ name, armorType, ap, maxDex, piece, suitOnly, craftsmanship, material }]` (só vestidas).
- `proficiencies`: tipos de armadura com Armor Proficiency; `squat`: tem Squat Armor Proficiency.
- `bonuses`: `{ apAll, gizzards, locations: { <loc>: ap } }` (biônicos entram em `locations`).
- Retorna `{ locations: { head, body, gizzards, arms, legs }, sdPenalty, maxDex, sources: { penalty, maxDex } }`.
- Casos:
  - Carapace sem proficiência → AP 7 em tudo, `sdPenalty` 7, `maxDex` 4.
  - Carapace com Heavy → `sdPenalty` 3; Flak com Medium → 0; Power Armor com Power → 6 + 2 = 8; sem → 12 + 2.
  - Squat com Heavy → 0; Squat sem → 3.
  - Capacete de Carapace (`piece: head`) + Mesh → head 7, demais 4; penalidade pela de maior AP.
  - Peça de Power Armor avulsa → ignorada.
  - Best → +1 AP e Max Dex +1; Poor → Max Dex −1; Orichalcum → +2 AP e Max Dex +1; Mithril → Max Dex +2.
  - `bonuses.gizzards` 2 → gizzards = AP do corpo + 2; `apAll` soma em todas.
  - Sem armadura → AP 0, penalidade 0, `maxDex` nulo.

### `artifactRating(rarity, { primitive })`
- VCom 1, Com 2, UnCom 3, Rare 4, VRare 5; primitiva um degrau abaixo; acima de VRare → `{ rating: 5, capped: true }`;
  abaixo de VCom → 1.

### `mechadendriteCheck({ installed, con })` → `{ ok, max }`.

## `rules/weapon.mjs`

### `attackSkill(weapon, { thrown })` → `"weaponry" | "ballistics" | "brawl"`.
### `isProficient(weapon, choices)` → booleano (interseção de `weapon.proficiencies` com as escolhas de Weapon Proficiency).
### `attackPool({ weapon, skill, level, proficient, focus, options })`
- `options`: `{ range: "pointBlank"|"short"|"normal"|"long"|"extreme", aim: 0|1|2, mode: "single"|"auto", braced, oneHanded, thrown }`.
- Retorna `{ rolled, kept, requiredRaises, notes[] }`.
- Casos: Ballistics 3, Level 2, proficiente → 5k3; não → 3k3; point blank +2k1; curto +1k0; longo `requiredRaises` 1,
  extremo 3; mira meia +1k0, completa +2k1; Accurate +1k0 extra na mira; Inaccurate sem bônus de mira; full auto +2k1;
  Heavy sem brace −3k1 e sem full auto; Basic com uma mão −2k0 (Compact 0); Defensive −2k0 (sem proficiência, o
  livro estende os −2k0 aos outros ataques: texto); Twin Linked +1k0 em tiro único; Weapon Focus +2k0; Orichalcum melee +2k0, ranged +1k1; Mithril melee
  +1k1, ranged ignora brace e uma mão.

### `damagePool({ weapon, str, options, extraHits, specialization, raises })`
- Retorna `{ rolled, kept, explodeOn, rerollBelow, pen, type, notes[] }`.
- Casos: melee 1k2 com Str 3 → 4k2; pistola 2k2 → 2k2; granada (X) não soma Str; melee Poor −1k0, Good/Best +1k0;
  Best ganha Proven (2) (ou +1 no Proven existente); Proven (3) → `rerollBelow` 3; Volatile → `explodeOn` 9;
  full auto com 2 acertos extras → +2k0 (Storm +4k0); Weapon Specialization +2k0; Twin Linked com 2+ raises +2k0;
  Razor Sharp com 2+ raises dobra a Pen; Darksteel melee Pen +8; Orichalcum melee +2k0; Necrodermis +1k0;
  Unarmed padrão 0k1 + Str.

### `fullAutoHits(raises, auto)` → `min(1 + raises, auto)`.
### `isJammed({ keptFaces, level, reliable, unreliable })` → 1s mantidos (Unreliable: 1s e 2s) > Level; Reliable nunca.
### `hitLocation(d10)` → chave de `HIT_LOCATIONS`.
### `effectiveQualities(weapon)` → qualidades com a qualidade (craftsmanship) e o material aplicados (Poor ranged: Unreliable e sem Reliable; Good ranged: Reliable; Best: Proven).

## `rules/acquisition.mjs`

### `acquisitionTn({ rarity, piece, craftsmanship, attempts })` → `{ tn, rarity, time }`.
- Casos: Common → 10; peça avulsa de Carapace (UnCom) → Com 10; UnCom Best → 25; Common com 1 tentativa → 15; Poor → −5.

### `strainRoll({ tn, wealth, raises, d10 })` → `{ strained, roll, penalty }`.
- Casos: TN 25, Wealth 3 → strained, roll = d10 + 2 − raises; faixa 1–6 → 0, 7–9 → 1, 10 → 3, 11+ → 5; TN ≤ Wealth × 5 → sem strain.

### `startingSlots(items)` → `{ rare: {used, max}, uncommon, common, veryCommon }` e `startingSlotFor(rarity, craftsmanship)` (raridade ajustada; fora das vagas → `null`).
### `effectiveWealth({ value, strain })` → `max(0, value − strain)`.

## `rules/dice.mjs` (estendido)
- `rollAndKeep(pool, { rerollBelow })`: rerrola uma vez dados com face < `rerollBelow`; `rerollOnes` = `rerollBelow: 2`.
  Casos: rng fixo mostra o reroll do 2 com Proven (3) e não do 3.

## `rules/pool.mjs` (estendido)
- `rollModifiers(rolls, skillKey)` → `{ rolled, kept, freeRaises, noExplode }` de `rolls.all` + `rolls.skills[skillKey]`;
  `DtdActor#withRollModifiers` soma aos modificadores do diálogo.

## `rules/derived.mjs` (estendido)
- `computeDerived(..., modifiers)`: `modifiers.armorPenalty` subtrai da Static Defense; `modifiers.maxDex` limita a Dex
  da Speed. Casos: Dex 5, Str 2, maxDex 4 → Speed 6; SD sem mudança pela Dex.

# Contract — Regras puras de raça (`module/rules/race.mjs`, `derived.mjs`, `sheet.mjs`)

Sem dependência de `foundry`, `game` ou `CONFIG` (constituição III). Cobertura obrigatória por
Vitest (`tests/unit/race.test.mjs`, `tests/unit/derived.test.mjs`, `tests/unit/sheet.test.mjs`,
`tests/unit/packs.test.mjs`).

## Tipos

```js
/**
 * @typedef {object} RaceSystem   // subset de RaceData usado pelas regras
 * @property {{options: string[], any: boolean}} characteristicBonus
 * @property {{skills: string[], choose: number}} skillBonus
 * @property {number} size
 * @property {{automation: "none"|"usesPerScene"|"heroicHeritage"|"shifty"|"squatToughness"}} power
 */
/** @typedef {{characteristic: string, skills: string[]}} RaceChoice */
/**
 * @typedef {object} RacialEffectData
 * @property {string} racial        "size" | "characteristic" | "skill.<key>" | "power"
 * @property {{key: string, mode: number, value: string}[]} changes   mode: 2 = ADD, 5 = OVERRIDE
 * @property {{type: string, key?: string}} label   para o adaptador montar o nome i18n
 */
```

As constantes de modo (`ADD = 2`, `OVERRIDE = 5`) são declaradas no próprio módulo, com os
mesmos valores de `CONST.ACTIVE_EFFECT_MODES` (conferido no 13.351), para ele continuar puro.

## `race.mjs`

| Função | Contrato |
|---|---|
| `usesPerScene(level)` → 1\|2\|3 | Level ≤ 2 → 1; 3–4 → 2; ≥ 5 → 3 (inclui Level < 1 → 1) |
| `remainingUses(level, spent)` → inteiro | `max(0, usesPerScene(level) − spent)` |
| `characteristicOptions(race)` → string[] | `any` → as 9 chaves de `CHARACTERISTICS`; senão `options` |
| `needsChoice(race)` → boolean | verdadeiro se `characteristicOptions` tem > 1 opção ou `skillBonus.choose > 0` |
| `defaultChoice(race)` → RaceChoice | característica = primeira opção; `skills = []` |
| `validateRaceChoice(race, choice)` → `{valid: true} \| {valid: false, error}` | `error` ∈ `"characteristic"` (fora das opções), `"skillCount"` (≠ `choose`), `"skillDuplicate"` (repetida ou já fixa), `"skillUnknown"` (chave inexistente) |
| `buildRaceEffects(race, choice)` → RacialEffectData[] | tabela "Active Effects raciais" de [data-model.md](../data-model.md); lança erro se a escolha for inválida |
| `capValue(value, max = 6)` → `{value, capped}` | `capped = value > max` |

**Casos obrigatórios**:
- `usesPerScene`: 0→1, 1→1, 2→1, 3→2, 4→2, 5→3, 6→3, 10→3; `remainingUses(1, 1)` = 0; `remainingUses(1, 5)` = 0.
- Eldarin + `wis`: efeitos `size` (OVERRIDE `system.size` = 3), `characteristic` (ADD
  `system.characteristics.wis.value` +1), `skill.academicLore`, `skill.arcana`; sem `power`.
- Human + `cha` + `["pilot", "command"]`: `size` 4, `characteristic`, `skill.pilot`,
  `skill.command`, `power` (ADD `system.heroPoints.max` +1). `["pilot", "pilot"]` → `skillDuplicate`;
  `["pilot"]` → `skillCount`.
- Halfling: `power` = OVERRIDE `system.modifiers.staticDefenseFormula` = `"shifty"`.
- Squat: `power` = ADD `system.modifiers.resilience` +1.
- Ork + `int` → `characteristic` inválida.
- `needsChoice`: Eldarin → true; raça com uma opção e `choose: 0` → false.
- `capValue(7)` → `{value: 6, capped: true}`; `capValue(5)` → `{value: 5, capped: false}`.

## `derived.mjs` (alteração)

`computeDerived(source, derivedMods = {}, modifiers = {})`, com
`modifiers = { staticDefenseFormula = "standard", resilience = 0 }`:

- `standard`: SD = 10 + 3×Dex + 3×Wis − 2×Size (inalterado).
- `shifty`: SD = 10 + 6×Dex − 2×Size (7.7a p. 45).
- Resilience base = ⌈(Size + Level)/2⌉ + 1 + `modifiers.resilience`, depois bônus/override do
  Mestre, mínimo 1.

**Casos obrigatórios**: Halfling Dex 3, Wis 4, Size 2 → SD 24; Squat Size 3, Level 1 → Resilience 4;
Squat com override de Resilience 2 → 2; chamada sem `modifiers` mantém todos os resultados da 001.

## `sheet.mjs` (alteração)

| Função | Contrato |
|---|---|
| `buildDots(value, max = 6, base = value)` → `Dot[]` | igual à 001; cada ponto ganha `racial: index > base && index <= value`. Sem `base`, nenhum ponto é racial (chamadas da 001 inalteradas) |
| `nextBaseValue({ base, final, clicked, max = 6 })` → inteiro | `clamp(nextDotValue(final, clicked) − (final − base), 0, max)`: o ponto N vira o valor final; o bônus usado é o já limitado (`final − base`) |

**Casos obrigatórios**:
- `buildDots(3, 6, 2)` → pontos 1–2 cheios e não raciais, ponto 3 cheio e `racial`, 4–6 vazios;
  `buildDots(3)` → nenhum `racial`; testes da 001 continuam passando.
- `nextBaseValue`: base 2, final 3, clique 3 → 1; base 2, final 3, clique 5 → 4; base 0, final 1,
  clique 1 → 0; base 6, final 6 (limitado), clique 6 → 5; sem bônus (base = final = 3), clique 3 → 2
  (mesmo resultado de `nextDotValue`).

## `tests/unit/packs.test.mjs` (dados do compêndio)

Lê `src/packs/races/*.json` e verifica: exatamente 12 raças com os nomes da spec; `_id` com
16 caracteres alfanuméricos e únicos; `_key === "!items!" + _id`; `type === "race"`; bônus de
característica, perícias, `choose`, `size`, `power.name`, `power.automation` e `source.page`
iguais à Tabela de referência da spec (SC-001); toda chave de característica/perícia existe em
`module/config.mjs`; `choice` vazio; `description` e `power.description` não vazios.

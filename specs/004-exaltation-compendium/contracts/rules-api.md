# Contract — Regras puras de exaltação (`module/rules/exaltation.mjs`, `asset.mjs`, `derived.mjs`)

Sem dependência de `foundry`, `game` ou `CONFIG` (constituição III). Cobertura obrigatória por
Vitest (`tests/unit/exaltation.test.mjs`, `tests/unit/asset.test.mjs`, `tests/unit/derived.test.mjs`,
`tests/unit/packs.test.mjs`). Modos `ADD = 2` / `OVERRIDE = 5` reaproveitados de `rules/race.mjs`.

## Constantes (`module/config.mjs`)

`EXALTATION_FORMULAS`, `EXALTATION_POWER_AUTOMATION`, `RESOURCE_ACTIONS`, `RESOURCE_HEALING`,
`FEAT_CATEGORIES`, `ASSET_GROUPS`, `ASSET_AUTOMATION`, `LIMIT_EXEMPT_GROUPS = ["paragon",
"paragonRacial"]`, `GENERIC_SPENDS = ["heal", "skill", "reaction", "stunned", "dazed"]` (p. 65).

## `exaltation.mjs`

| Função | Contrato |
|---|---|
| `powerStatMax({cap, level, devotion})` → inteiro ≥ 1 | `level` → `max(1, level)`; `levelAndDevotion` → `max(1, min(level, ⌈devotion/2⌉))` |
| `effectivePowerStat(purchased, max)` → inteiro | `clamp(purchased, 1, max)` |
| `resourceMax({formula, fixedMax}, stats, ps, mods)` → inteiro ≥ 0 | tabela de research R3 + `mods.resourceBonus + mods.resourcePerPowerStat × ps` |
| `resourceValue(max, spent)` → inteiro | `max(0, max − spent)` |
| `roundSpent(stored, marker, currentMarker)` → inteiro | `marker === currentMarker ? stored : 0` |
| `tellLevel(sceneSpent)` → 0–4 | 0 → 0; 1 → 1; 2–3 → 2; 4–5 → 3; ≥ 6 → 4 |
| `pressureMax(ps, enabled)` → inteiro \| null | `enabled` → `5 × ps`; senão `null` |
| `unlockedPowers(powers, ps)` → `[{rank, name, unlocked}]` | `unlocked = rank ≤ ps` |
| `applyResourceAction(state, action, ps, max)` → novo `spent` | `restoreAll` → 0; `regain n\|"powerStat"` → `max(0, spent − n)`; `unravel` → `max(0, spent − 1)`; `lose n` → `min(max, spent + n)` |
| `spendCheck({value, roundSpent, ps})` → `"ok"\|"empty"\|"overLimit"` | `value ≤ 0` → `empty`; `roundSpent ≥ ps` → `overLimit` |
| `statuesqueOptions(race)` → string[] | sem raça → 9 chaves; senão `characteristicOptions(race)` − `race.choice.characteristic` |
| `needsSelection(exaltation, race)` → boolean | Paragon com > 1 opção de Statuesque; Dragonblooded com > 1 elemento |
| `validateExaltationSelection(exaltation, selection, race)` → `{valid} \| {valid:false, error}` | `error` ∈ `statuesque`, `element` |
| `buildExaltationEffects(exaltation, selection)` → EffectData[] | tabela R5; lança erro se a escolha for inválida |
| `computeExaltation(exaltation, stats, mods, {currentMarker})` → objeto | forma em data-model.md; usa as funções acima |

**Casos obrigatórios** (exemplos da spec e do livro):
- Traya (Werewolf, Cmp 2, Wil 4, Level 1, PS 1): Rage máx 7, atual 7, poderes `[1 ✓, 2–5 ✗]`.
- Werewolf Level 3, PS 3: Rage máx 9; `applyResourceAction` `regain "powerStat"` de spent 6 → 3.
- Atlantean Cha 3, Int 4, PS 2: Motes 11; spent 2 → atual 9, dívida 2; `unravel` → spent 1.
- Chosen Level 5, Devotion 5: `powerStatMax` = 3; comprado 4 → efetivo 3; Favor 8; Devotion 3 →
  máx 2, poderes 3–5 bloqueados.
- Vampire PS 1 → Vitae 5; Promethean PS 2 → Pyros 6; Paragon Level 2, PS 1 → AP 3, Pressure 5;
  Dragonblooded Level 2 → Breath 4, com `resourcePerPowerStat` 1 e PS 1 → 5; Wraith PS 1, Resolve
  máx 6 → Plasm 7; Daemonhost Wil 3, Cha 2, PS 1 → Essence 7; `fixed` 4 → 4.
- `tellLevel`: 0→0, 1→1, 2→2, 3→2, 4→3, 5→3, 6→4, 9→4.
- `roundSpent(2, "c1:3", "c1:4")` = 0; `roundSpent(2, "c1:3", "c1:3")` = 2; `spendCheck` com
  `roundSpent 2, ps 2` → `overLimit`; `value 0` → `empty`.
- `lose 1` com spent = max → spent inalterado.
- Paragon + Human com escolha racial `cha`: `statuesqueOptions` tem 8 chaves sem `cha`; Paragon +
  Eldarin (`wis`/`int`, escolheu `wis`) → `["int"]` (sem diálogo); efeitos `destiny` (heroPoints.max
  +2) e `statuesque` (int +1).
- Dragonblooded + `earth`: `element` (con +1) e `element.hp` (`system.modifiers.hpMax` +2);
  `"lava"` → erro `element`.

## `asset.mjs`

| Função | Contrato |
|---|---|
| `countsTowardLimit(asset)` → boolean | `group ∉ LIMIT_EXEMPT_GROUPS` |
| `validateAssetAdd({asset, exaltation, race, assets})` → `{valid} \| {valid:false, error}` | ordem: `noExaltation` (sem exaltação) → `wrongExaltation` (≠ `prerequisites.exaltation`) → `wrongRace` (`paragonRacial` e raça ≠ `prerequisites.race`) → `duplicate` (mesmo nome) → `limit` (conta no limite e já existe outro que conta) |
| `buildAssetEffects(asset)` → EffectData[] | tabela R6; `none` → `[]`; Warboss com `priority: 60` |
| `perfectionAsset(assets, raceName)` → asset \| null | primeiro `paragonRacial` com `prerequisites.race === raceName` |

**Casos obrigatórios**: Blood of Io em Dragonblooded sem assets → válido; + Double Dragon → `limit`;
Paragon com Extra Action + Action Hero → ambos válidos; Mark of Khorne em Werewolf →
`wrongExaltation`; Warboss em Paragon Elf → `wrongRace`; qualquer asset sem exaltação →
`noExaltation`; `perfectionAsset(..., "Tiefling")` → `null`; `perfectionAsset(..., "Human")` →
Multiclass.

## `derived.mjs` (alteração)

`modifiers` ganha `hpMax = 0` e `staticDefenseSize = true`:
- `hpMax` base = 2×(Con + Wil) + `modifiers.hpMax`, antes do bônus/override do Mestre.
- `staticDefenseSize = false` → SD sem o termo −2×Size (vale para `standard` e `shifty`).
- Casos: Sloth (+2) com Con 3, Wil 3 → HP 14; Elusive Halfling Dex 3, Size 2 → SD 28; override do
  Mestre continua vencendo.

## `packs.test.mjs` (acréscimo)

- `exaltations`: 9 entradas; por nome, `powerStat.name`, `powerStat.cap`, `resource.name`,
  `resource.formula`, nomes das 5 `powers` em ordem, `source.page` = Tabela de referência (SC-001);
  `powers` com ranks 1–5; Dragonblooded com 5 `elements`.
- `exalted-assets`: 75 feats + 10 pastas; contagem por `group` = 5/21/5/5/4/15/5/5/5/5; todo feat com
  `folder` existente, `xpCost` 100, `prerequisites.exaltation` válido; os 15 `paragonRacial` com
  `prerequisites.race` entre as 16 raças do pack `races` (sem Tiefling); `automation` da tabela R6
  nos 8 assets automatizados (SC-002).
- Ambos: `_id` de 16 caracteres e únicos; `_key` coerente com o tipo do documento.

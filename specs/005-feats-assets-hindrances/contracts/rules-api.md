# Contract — Regras puras de feats (`module/rules/feat.mjs`, `derived.mjs`)

Sem globais do Foundry (constituição III). Testes: `tests/unit/feat.test.mjs`, `derived.test.mjs`,
`config.test.mjs`, `packs.test.mjs`. Modos `ADD = 2` / `OVERRIDE = 5` de `rules/race.mjs`.

## Constantes (`module/config.mjs`)

`FEAT_CATEGORIES = ["feat", "racialFeat", "asset", "hindrance", "exaltedAsset"]`,
`FEAT_AUTOMATION` (ver data-model), `HINDRANCE_LIMIT = 2`, `FEAT_REQUIREMENT_TYPES = ["feat", "racePower"]`.
`ASSET_AUTOMATION` da 004 continua exportado (subconjunto).

## `feat.mjs`

| Função | Contrato |
|---|---|
| `fullName({name, selection})` → string | `"Peer (Nobility)"`; sem subcategoria → `name` |
| `needsFeatSelection(system)` → `{subcategory, characteristic, characteristic2, skill, specialty}` (booleans) | grupo sem subcategoria já definida (concessão com subcategoria fixa); madeOfMettle/beneficialMutation (característica, e 2ª para beneficial); veteran (característica + perícia); skillFocus (perícia + especialidade) |
| `lowestCharacteristics(characteristics)` → string[] | chaves com o menor valor final |
| `characteristicOptions(system, characteristics)` → string[] | madeOfMettle/beneficialMutation → `lowestCharacteristics`; veteran → todas |
| `validateFeatSelection(system, selection, ctx)` → `{valid} \| {valid:false, error}` | `noSubcategory`, `characteristic`, `characteristic2`, `skill`, `specialty` |
| `validateFeatAdd({feat, selection, owned, race})` → `{errors, warnings, notices}` | R3; `owned` = feats do ator com `{name, system, flags}`; `race` = `{name, power: {name}}` ou null |
| `buildFeatEffects(system, selection)` → EffectData[] | tabela R4; asset automations delegam a `buildAssetEffects`; `none` → `[]` |
| `grantPlan(grants, owned, originId)` → `{create: grant[], attach: itemIds[]}` | grants cujo `fullName` já existe → `attach`; demais → `create` |
| `releasePlan(owned, originId)` → `{update: [{id, grantedBy}], remove: ids}` | tira `originId`; remove os sem origem e sem `purchased` |
| `activeGrants(exaltationSystem, ps)` → grant[] | `grants` com `rank ≤ ps` |

**Casos obrigatórios**:
- `fullName`: Peer + Nobility → "Peer (Nobility)"; Sound Constitution → "Sound Constitution".
- `validateFeatAdd`: Sound Constitution presente → `notRepeatable`; Peer (Nobility) presente + Peer (Nobility) → `duplicate`; + Peer (Underworld) → ok; I'm Da Boss! em Halfling → `wrongRace`; sem raça → `noRace`; 3º hindrance → `hindranceLimit`; Battle Rage sem Frenzy → warning `missingDependency` ["Frenzy"]; Elven Precision em Elf (poder Elven Accuracy) → sem aviso; asset → notice `creationOnly`; Sturdy → notices `creationOnly` e `extraHindrances` (2).
- `lowestCharacteristics`: {str 1, dex 2, con 1, …} → ["str", "con"].
- `buildFeatEffects`: soundConstitution → `system.modifiers.hpMax` +1; farsighted → resolveMax +3 e mentalDefense +5; noOneTougher → OVERRIDE `staticDefenseCharacteristic` = "con"; matron → 4 changes, size com `priority: 60`; beneficialMutation (con, dex) → con +2, dex −1; veteran (wis, stealth) → wis +1, stealth +1; skillFocus (pilot, "Starships") → ADD `system.skills.pilot.specialties` "Starships"; noisyCricket → acrobatics "Jumping"; actionHero (004) → heroPoints.max +1.
- `grantPlan`: Aasimar grants com Jaded já comprado → attach Jaded, create Fearless.
- `releasePlan`: item com grantedBy [race, exaltation] ao remover race → update com [exaltation]; item com [race] e purchased → update [] (fica); item com [race] → remove.
- `activeGrants`: Promethean rank 1 com PS 1 → 5 Armor Proficiency.

## `derived.mjs` (alteração)

`modifiers` ganha `resolveMax = 0`, `mentalDefense = 0`, `staticDefense = 0`, `fatigueMax = 0`,
`staticDefenseCharacteristic = "dex"`:
- `staticDefense`: fórmula com `c(staticDefenseCharacteristic)` no lugar de `c("dex")` (padrão e shifty) + `modifiers.staticDefense`.
- `resolveMax`, `mentalDefense`, `fatigueMax`: base + modificador.
- Casos: Halfling Dex 3, Size 2, shifty + staticDefense 4 → 28; Squat Con 4, Wis 2, Size 3, con → 10+12+6−6 = 22; Wil 3 Cmp 2 + resolveMax 3 → 8; Cmp 2 + mentalDefense 5 → 20; Con 3 + fatigueMax 2 → 5; overrides do Mestre vencem; sem modificadores os resultados da 001/002/004 não mudam.

## `packs.test.mjs` (acréscimo)

- `feats`: 274 feats + 21 pastas (Feats, Racial Feats, 16 raças, Assets, Hindrances); por categoria 181/49/22/22; 3 feats raciais por raça (Kobold 4), `prerequisites.race` = nome do pack Races e pasta da raça; nomes iguais às listas da spec (assets, hindrances, raciais); grupos e opções dos 22 repetíveis; XP (100 / hindrance `xpCost` 0, `xpGranted` 100); `automation` nos 15 automatizados; `grants` de Academy, Kenjutsu, K'sten'mannav, Lightning Bug; `requires` da tabela de dependências; `_id`/`_key` únicos.
- `races`: Aasimar e Gnome com os `grants` da spec; demais `[]`.
- `exaltations`: Atlantean e Promethean com `grants` (rank 1); demais `[]`.
- `exalted-assets`: You Will Not Falter, Tuning, Ventrue com `grants`; todo nome concedido existe no pack `feats`.

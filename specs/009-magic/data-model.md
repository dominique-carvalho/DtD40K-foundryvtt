# Data Model — 009-magic

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `MAGIC_SCHOOLS` | `abjuration wil · conjuration wil · divination wis · enchantment cha · evocation cha · healing wis · illusion int · necromancy int · transmutation wis` (chave → `{ label, characteristic, name }`) |
| `SPELL_KEYWORDS` | `attack, comboOk, focus, languageDependent, material, mindAffecting, rangedTouch, savingThrow, social, somatic, subtle, touch, verbal` (rótulo e dica i18n) |
| `SPELL_ACTIONS` | `half, full, reaction, free, halfOrReaction` |
| `SPELL_DURATIONS` | `instant, scene, rounds, minutes, hours, days, indefinite, concentration, special` |
| `CAST_STRENGTHS` | `fettered, unfettered, push` |
| `MAX_PUSH` | `{ sanctioned: 3, unsanctioned: 4 }` |
| `MAGIC_XP` | `newSchool: 200`, `perRank: 100` (× valor atual), `comboPerLevel: 50` (× soma dos níveis) |
| `XP_KINDS` | + `school`, `combo` |

## `spell`

| Campo | Tipo |
|---|---|
| `description`, `source` | HTML; `{ book, page }` |
| `school` | `MAGIC_SCHOOLS` |
| `level` | 1–5 |
| `tn` | `{ value: int\|null, special: "" \| "none" \| "mentalDefense" }` |
| `action` | `SPELL_ACTIONS` |
| `keywords` | `SPELL_KEYWORDS[]` |
| `range`, `target`, `area` | strings |
| `duration` | `{ type, value, perLevel: bool, expendable: bool, concentration: "" \| "half" \| "reaction", text }` |
| `damage` | `{ rolled, kept, type, perLevelRolled, perLevelKept }` |
| `save` | `""` ou característica (resistência com Arcana + ela) |
| `effect`, `perRaise` | strings (redação própria) |
| `automation` | `{ target: self\|target\|"", changes: [{ key, value, perRaise, capLevelMultiplier }], statuses: [] }` |
| `learnedAt` | inteiro (valor da escola quando aprendida; no personagem) |

## Personagem

| Campo | Tipo |
|---|---|
| `magic.schools.<key>.value` | 0–6 |
| `magic.combos` | `[{ id, name, spells: [nome] }]` |
| `magic.sustained` | `[{ id, name, spellId, action: half\|reaction, targetUuids: [], effectIds: [] }]` |
| `modifiers.magic` | `{ casterLevel, tn, rolled, kept }` (alvos de efeito: drogas, classes, Implement) |
| `magic` (derivado) | `{ casterLevel, sanctioned, hasImplement, slots: {<key>: {used, max}} }` |

## Tabelas (`combat-tables`)

- "Psychic Phenomena" (1d100, 26 resultados, `flags.dtd40k.table.kind = "phenomena"`), "Perils of the Warp" (1d100,
  18 resultados, `kind = "perils"`), com `flags.dtd40k.effect` (statuses, rounds, fatigue, insanity, perils, damage).

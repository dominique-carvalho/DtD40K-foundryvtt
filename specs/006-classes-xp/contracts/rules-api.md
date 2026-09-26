# Contract — Regras puras (`module/rules/class.mjs`, `xp.mjs`)

Sem globais do Foundry. Testes: `tests/unit/class.test.mjs`, `xp.test.mjs`, `config.test.mjs`, `packs.test.mjs`.

## Constantes (`config.mjs`)

`CLASS_COMPLETION = ["none", "hpMax", "initiative", "resolveMax", "staticDefense", "specialty", "skillDot"]`,
`CLASS_STATUS = ["current", "completed"]`, `XP_COSTS = { characteristic: 200, newSkill: 100, skill: 50, feat: 100,
asset: 100, powerStat: 300 }`, `STARTING_XP = 600`, `FREE_STUDY_MULTIPLIER = 2`, `XP_KINDS`.

## `class.mjs`

| Função | Contrato |
|---|---|
| `matchesListFeat(entry, feat)` → bool | mesmo nome base sem maiúsculas; subcategoria fixa (≠ "", "Any") precisa bater |
| `classProgress(cls, ownedFeats)` → `{ entries, required, done, complete }` | R3; grupo "A ou B" obrigatório conta 1; alternativas não escolhidas `blocked` |
| `checkClassEntry({ cls, level, classes, skills, feats })` → `{ errors, warnings }` | `levelTooHigh`, `currentIncomplete`, `alreadyTaken`, `missingSkills` (lista), `missingFeats` (lista); warnings `schools`, `text` |
| `characterLevel(classes, stored)` → inteiro | máx. Level das classes; sem classes → `stored` |
| `buildCompletionEffects(completion)` → EffectData[] | hpMax/initiative/resolveMax/staticDefense → ADD `value` no modificador; specialty → ADD em `skills.<k>.specialties`; skillDot → ADD 1 em `skills.<k>.value`; none → [] |
| `completionSkillOptions(completion, skills, level)` → string[] | specialty any → 27; social → perícias do grupo social; skillDot → valor final < Level |

**Casos**: Swordsman com Quick Draw, Hardy → 2/4, incompleta; + Fast Reflexes, Power Attack → completa; grupo
"A ou B" obrigatório (Nighthawk) com A → cumprido e B `blocked`; "A ou B" opcional não conta; Weapon Proficiency
(Any) cumprido por Weapon Proficiency (Basic); Peer (Religious Organization) não cumprido por Peer (Nobility);
entrada: Level 1 + classe Level 3 → `levelTooHigh`; Swordsman com Weaponry 1 → `missingSkills` [Weaponry 2];
"Weaponry or Ballistics 3" cumprido por Ballistics 3; classe atual incompleta → `currentIncomplete`; mesma classe →
`alreadyTaken`; escolas → warning; `characterLevel` [1, 2, 4] → 4, [] com 3 → 3; bônus Mercenary → hpMax +2.

## `xp.mjs`

| Função | Contrato |
|---|---|
| `advanceCost(kind, from)` → inteiro | tabela `XP_COSTS`; skill `from 0` → 100 |
| `canAdvance({ kind, key, classes, race, feat })` → `{ allowed, multiplier, reason }` | R5; `reason` ∈ `noClass`, `offList`, `notOnList`, `ownedOrBlocked`, `atMax` |
| `xpTotals({ starting, log, hindranceXp })` → `{ total, spent, available, hindranceXp }` | total = starting + awards + hindranceXp |
| `undoPlan(entry, current)` → `{ restore: {path, value}\|null, deleteItem: id\|null, refund }` | restaura só se o valor atual = `to` |

**Casos**: Strength (lista Swordsman) → allowed ×1, custo 200; Stealth na Swordsman → `offList`; Stealth em Free
Study (fora das concluídas) → allowed ×2, custo 200 (100 × 2); Weaponry 2→3 → 50; feat Power Attack na
Swordsman → allowed; feat fora da lista → `notOnList`; feat racial da raça → allowed; sem classes → `noClass`;
totais: 600 + award 150 + 1 hindrance − 350 gastos → total 850, disponível 500; undo de Strength 3→4 com valor
atual 4 → restore 3; com valor atual 5 → restore null, refund.

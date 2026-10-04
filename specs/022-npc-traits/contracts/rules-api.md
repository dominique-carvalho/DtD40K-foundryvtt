# Contract: `module/rules/npc-traits.mjs` (puro)

| Função | Entrada | Saída | Casos |
|---|---|---|---|
| `npcSpeeds` | `{ speed, fixed, traits }` | `{ walk, fly, swim }` | fixado 16 + Quadruped → walk 16; calculado 8 + Quadruped → 16; Crawler 8 → 4; Flyer "22" → fly 22; Flyer sem valor e speed 6 → 12; sem Flyer → fly 0; Amphibious 6 → swim 12 |
| `darknessModifier` | `{ darkness, attackerDarkSight }` | `0 \| 5` | escuro sem Dark Sight → 5; com → 0; sem escuro → 0 |
| `distance3d` | `{ planar, elevation }` | número | 3/4 → 5; 10/0 → 10 |
| `outOfRange` | `{ distance, melee, reach, range }` | `"" \| "reach" \| "long" \| "beyond"` | corpo a corpo 3 m com reach 2 → "reach"; à distância 120 com alcance 30 → "beyond" (> 4×), 70 → "long" |
| `incorporealBlocks` | `{ incorporeal, magic, qualities, spell }` | boolean | incorpóreo + espada comum → true; + Power Field → false; + mágica → false; magia → false |
| `minionActionCost` | `{ action, threatRating }` | `{ type, distance }` | move-half TR 3 → {half, 3}; move-full → {full, 6}; run → {full}; attack → {half} |
| `minionCanAttack` | `{ attacksThisTurn }` | boolean | 0 → true; 1 → false |
| `abilityOutcome` | `{ save: {success}, onFail }` | `{ condition, rounds, fatigue, damage }` ou nulo | falha Mind Blast → stunned 1; sucesso → nulo |
| `applyForm` | `{ base, form }` | `{ characteristics, size, derived, armor, traits }` | Warform troca STR/CON, soma armadura e traits; `derived` nulo mantém |
| `flyingFall` | `{ elevation, status }` | boolean | 10 + stunned → true; 0 → false; 10 + bleeding → false |

Extensões: `rules/defense.mjs#situationModifiers` aceita `darkness` e `attackerDarkSight`; `rules/feat.mjs`
ganha `npcFeatNames(list)` (normaliza "×2" e especialização).

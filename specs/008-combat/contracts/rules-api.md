# Contrato — regras puras (008)

Módulos sem globais do Foundry (constituição III). Casos obrigatórios em `tests/unit/`.

## `rules/damage.mjs` — `resolveDamage(input)`
- Entrada: `{ total, pen, type, location, magic, tearing, unarmed, armor: {head, body, gizzards, arms, legs}, aura,
  resilience, hp, critical, cover: { ap, locations } | null }`.
- Saída: `{ effective, wounds, hpLoss, criticalGain, critical, row, fatigue, coverHit, steps[] }`.
- Casos: 19 Pen 2 contra AP 7, Res 4 → 14 → 3; efetivo ≤ 0 → nada; Tearing 13/4 → 4; HP 2 recebendo 5 → hpLoss 2,
  criticalGain 3, row 3; crítico acumulado 4 + 2 → row 5; Resilience 0 → 1; magia usa Aura e ignora AP; cobertura AP 8
  no corpo coberto → cobertura primeiro, `coverHit` quando atravessada; desarmado com HP perdido → fadiga 1;
  localização `leftArm` → AP `arms`.

## `rules/critical.mjs`
- `criticalTableKey(type, location)` → `{ type: energy|explosive|impact|rending, location: arm|body|gizzards|head|legs }`
  (fogo sem localização → energy/body).
- `criticalPlan(effect)` → `{ statuses, rounds, fatigue, tests, dead, halfAction, text }` a partir da flag do resultado.

## `rules/turn.mjs`
- `canUse(state, action, { reactionsMax })` → `{ ok, reason: fullUsed|halfRepeated|noHalfLeft|freeRepeated|noReaction }`.
- `spend(state, action)` → novo estado. `resetForRound(state, round)`.
- Casos: completa bloqueia meia; duas meias iguais recusadas; duas diferentes ok; livre repetida recusada; reação além
  do máximo recusada; `varies` tratada como meia.

## `rules/defense.mjs`
- `dodgePool({ dex, acrobatics, prone, difficultTerrain })`, `parryPool({ skill, level, proficient })`.
- `defendedSd(sd, total)` → `sd + floor(total / 2)`; `stillHits({ attackTotal, sd })`.
- `reactionsMax(statuses, mods)` (1 + Full Defense 2 + Fight Defensively 1 + mods; All Out Attack → 0).
- `situationModifiers(options)` (ganging up +2k0/+3k0, alvo correndo ±2k0, atirar em corpo a corpo +2 raises, terreno,
  Combat Advantage +1 free raise, Called Shot −2k0, Prone do alvo).
- `multipleAttackPenalty({ twoWeapons, ambidextrous, twoWeaponFighting })` → k0 (3, 2, 1, 0).

## `rules/healing.mjs`
- `woundState({ hpLost, wil, critical })` → `light|heavy|critical`.
- `rest({ state, period: day|week, full, medical, con })` → `{ hp, critical }` curados.
- `fatigueCheck({ fatigue, con })` → `{ unconscious, fatigue }`.

## `rules/social.mjs`
- `socialOutcome({ drained, limit })` → `{ canDrain, jaded }`; `refuteBonus(total)`.

## `rules/mental.mjs`
- `fearTn(rating)`, `shockRoll({ d10, checks })`, `traumaTn(insanity)` (10 + ⌊insanity/5⌋),
  `insanityThresholds(before, after)` → `{ traumaTests: n, derangements: n, removed }`.

## `rules/combat-actions.mjs`
- 38 ações; chaves únicas; tipos em `ACTION_TYPES`; subtipos em `ACTION_SUBTYPES`.
- `initiativeDie({ initiative, dex, cmp, mod })` e `compareInitiative(a, b)` (iniciativa, d10, Dex).

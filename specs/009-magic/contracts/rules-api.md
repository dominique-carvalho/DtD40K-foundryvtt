# Contrato — regras puras (009)

## `rules/magic.mjs`
- `castPool({ school, characteristic, strength, push })` → `{ rolled, kept }`.
  Casos: Evocation 2 + Cha 3 Unfettered 5k3; Fettered 3k3; Push 2 → 7k3; Fettered com poucos dados: rolled 1, kept 1.
- `maxPush(tested)` → 3 / 4; `validPush(push, tested)`.
- `phenomenaModifier({ strength, push, tested, level, keptExploded, comboSize })` → `{ roll, mod }`.
  Casos: Fettered → não; Unfettered sem dado explodido → não; com → sim, mod 0 (Tested) ou 5 × nível; Push 2 → sim, +10
  (Tested) / +20; combo de 2 → +10 a mais.
- `spellTn(spell, { targetMd })` → número ou null (sem TN); `mentalDefense` usa a do alvo.
- `spellDamage(spell, { casterLevel })` → `{ rolled, kept, type }` (escala por Level).
- `perRaiseChange(change, { raises, casterLevel })` → valor (ex.: Aura 1 + 1 por raise, teto 3 × Level).
- `keywordCheck(spell, { statuses, inCombat })` → `{ blocked: [somatic|social], warnings: [verbal|focus|material] }`.
- `comboTest(spells, schools, characteristics)` → `{ school, characteristic, tn, fetteredAllowed: false }`.
- `spellSlots({ schools, spells, extra })` e `canLearn({ spell, schools, spells, extra })` → `{ ok, reason }`.
- `tableRow(results, total)` → resultado (acima do máximo = último).

## `rules/xp.mjs` (estendido)
- `advanceCost("school", from)` → 200 / 100 × from; `advanceCost("combo", levels)` → 50 × levels.
- `canAdvance({ kind: "school", key, classes, level, from })` → lista da classe atual ou das concluídas (Free Study);
  `atCap` quando from + 1 > level.
- `undoPlan` restaura o valor da escola.

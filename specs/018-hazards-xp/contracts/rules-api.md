# Contract: `module/rules/hazards.mjs` (puro) e extensões

| Função | Entrada | Saída | Casos de teste |
|---|---|---|---|
| `fallCategory({ category, catfall })` | categoria, Catfall | categoria final ou `null` | fatal + Catfall → long; short + Catfall → null |
| `fallWounds({ category, d10, d5a, d5b })` | dados | `{ wounds, extraCritical }` | short 1/0; long d10; fatal d5a/d5b |
| `fallReduction({ category, intentional, success, raises })` | | ferimentos a menos | intencional sucesso 2 raises → 3; fatal → 0; não intencional → 0 |
| `breathLimit({ con, mode })` | | intervalos | Con 3 esforço 6; poupar 3 |
| `suffocationStep({ step, limit, state })` | intervalo resolvido (1-based) | `{ test: bool, unconscious: bool, hpLoss: 0\|1 }` | step ≤ limit → teste; step = limit + 1 → unconscious; depois → hpLoss 1 |
| `marchTn(hour)` | 1-based | TN | 1 → 10; 3 → 20 |
| `marchDistance({ speed, hours })` | | km | Speed 4, 3 horas → 24 |
| `hazardImmunity({ exaltation, traits, equipped, underwater, amphibious })` | nomes | `{ breath, fatigue }` | Vampire breath; Promethean ambos; undead breath; Rebreather breath; Amphibious só debaixo d'água |
| `encounterXp(kind, difficulty)` | | XP | hard 200; session 500 |

`rules/damage.mjs` `resolveDamage`: `direct` (ferimentos = total, sem cobertura/armadura/Resilience), `extraCritical`
(somado ao Critical Damage); casos: total 7 direto com armadura 4 e Resilience 4 → 7 ferimentos; fatal com HP 10 e
extraCritical 3 → Critical +3, linha 3.

`rules/healing.mjs` `fatigueCheck({ fatigue, max, con })`: acima de `max` → unconscious, volta a `max`, horas 10 − con.

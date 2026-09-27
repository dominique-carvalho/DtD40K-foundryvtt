# Contract — regras puras (012)

Sem globais do Foundry. Testes em `tests/unit/npc.test.mjs`, `minions.test.mjs`, `packs.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `traitValue(traits, key)` | → número ou null | Armor Plating 6 → 6; ausente → null |
| `traitArmor(traits, con)` | → AP extra em todos os locais | Armor Plating 4 → 4; Machine 6 → 6; Daemonic com Con 5 → 5; soma |
| `traitAura(traits)` | → Aura | Aura 4 → 4 |
| `immunities(traits)` | → status ids | Undead → [stunned, bloodLoss]; Stuff of Nightmares → idem; sem → [] |
| `regeneration(traits)` | → HP por turno | Regeneration 1 → 1 |
| `fearRating(traits)` | → 0–5 | Fear 2 → 2 |
| `isAmorphous`, `isMindless` | → bool | — |
| `squadDerived({ threatRating })` | → `{ staticDefense, speed, range }` | TR 3 → 15, 3, 30 |
| `squadPool({ count, attacking, threatRating })` | → `{ rolled, kept }` | 5/5/3 → 5k3; 5/2/3 → 2k2; 1/5/1 → 1k1 |
| `minionDamage({ rating, raises })` | → dano | 3/1 → 20; 5/0 → 25 |
| `casualties({ raises, blast })` | → minions removidos | 0/0 → 1; 2/0 → 3; 0/4 → 4 |
| `allyBonus(squads, fellowship)` | → bônus | [TR 2 ×1, TR 3 ×2], Fel 4 → 3 + 2 = 5; Fel 2 → 3 + 1 = 4; [] → 0 |

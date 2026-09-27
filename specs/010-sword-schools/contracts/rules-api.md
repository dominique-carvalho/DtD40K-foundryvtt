# Contract — `module/rules/martial.mjs` (puro) e extensões

Sem globais do Foundry. Testes em `tests/unit/martial.test.mjs`, `xp.test.mjs`, `damage.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `adeptLevels(ranks)` | `{ <key>: n }` → `{ adeptLevel, gunslingerLevel }` | Setting Sun 2 + Iron Heart 3 → 3/0; Clay Pigeon 3 + Point Blank 2 → 0/3 |
| `options({ schools, ranks, kind })` | dados das escolas + valores → `{ actions, advantages, restrictions }` | Standard Attack sempre; Called Shot com Stone Dragon 1; vantagem de nível 3 ausente com valor 2; Gun Kata fora de `special` |
| `points(entry, count, choice)` | → int | repetível × 2; Revitalizing Strike escolha 3; Exit Wound Kata X = 2 |
| `budget({ advantages, restrictions, level })` | pontos → `{ ok, reason, missing }` | exemplo p. 261 (6 / 3 / 3) ok; 5 / 1 / 3 → `needRestrictions` 1; 7 / 4 / 3 → `overCap`; nível 0 → `noLevel` |
| `attackCost({ points, paid })` | → XP | 6 / 0 → 300; 5 / 4 → 50; 3 / 4 → 0 |
| `usageCheck(attack, ctx)` | ataque + `{ weapon, round, inCombat, targetStatuses, hp, entries }` → `{ blocked: [], reminders: [] }` | Syrneth com espada comum bloqueia; Difficult Strike na rodada seguinte; Last Resort usado; Death Blow sem alvo Helpless; Eagle's Claw com arma |
| `attackModifiers(attack, entries)` | → modificadores (data-model) | First Accuracy ×2 + Penetration ×1 → +2k0, Pen +2; Burning Blade → Incendiary; Blistering Flourish → Dazed perRaise; Opening the Path → self SD −10; Non-Penetrating → `penZero` |
| `advanceCost("martial", from)` | → XP | 0 → 200; 2 → 200; 1 → 100 |
| `canAdvance({ kind: "martial", ... })` | → allowed/reason | lista da classe; Free Study; `atCap` |
| `resolveDamage({ ..., ignoreArmor, resilienceMod, resilienceMultiplier, noCritical })` | → resultado | armadura ignorada; Res 4 − 2 = 2; Res 4 × ½ = 2; sem crítico |

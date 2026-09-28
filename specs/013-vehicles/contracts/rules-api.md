# Contract — `module/rules/vehicle.mjs` (puro)

Sem globais do Foundry. Testes em `tests/unit/vehicle.test.mjs`, `packs.test.mjs`, `weapon.test.mjs`.

| Função | Entrada → saída | Casos de teste |
|---|---|---|
| `baseCost({ maneuver, acceleration, speed, size })` | → VP | carro Man 0, Acc 1, Speed 4, Size 8 → 0 + 5 + 11 + 8 = 24 |
| `vehicleCost(stats, components)` | → VP | carro + Wheeled 5 + Standard Frame 15 + Armor 3 (6) + 8 × 0 = 50 |
| `slotsUsed(components)` | → slots | 4 Cargo + 4 Passenger → 8; Cockpit null → 0 |
| `budgetVp(tier)` | → VP | uncommon 50; holdings5 450 |
| `staticDefense({ size, speed, maneuver, momentum })` | → SD | 8/4/0/0 → −6; 8/4/0/1 → 2 |
| `moveRange({ speed, driveRating, momentum })` | → m | 4 × 5 × 10 = 200 |
| `moveMomentum({ momentum, delta })` | → 0–10 | 2 +1 → 3; 10 +1 → 10; 0 −1 → 0 |
| `punchIt({ momentum, acceleration, mode, delta })` | → Momentum | Boost 2, Acc 2 → 5; Drift 5, −1 → 4 |
| `controlTn(momentum)` | → TN | 3 → 15 |
| `outOfControl(d10)` | → linha | 4 Straight Edge; 7 Swerve; 9 Wild Stallion; 10 Turn Over |
| `ramming({ size, momentum, speed })` | → pool | 14/3/4 → 7k3+4; 30/2/1 → 10k2+1 |
| `evasiveBonus(total)` | → SD extra | 17 → 8 |
| `critCount(before, added)` | → críticos | 3 + 2 → 1; 4 + 7 → 2; 0 + 4 → 0 |
| `vehicleCrit(d10)` | → linha | 1 pintura; 3 só meia ação; 10 explosão |
| `juryRigHp(raises)` | → HP temp | 2 → 3 |
| `repairTn({ size, hpLost })` / `repairDays({ size, success, raises })` / `repairDice({ dots, crafts })` | → TN / dias / dados | 8+6 = 14; 8, sucesso, 2 raises → 1; 2 + 3 = 5 |
| `chaseModifiers({ obstacle, repeated })` | → `{ freeRaises, checks }` | obstáculo → +2 raises; repetida → 2 checks |
| `chaseLeader(results)` | → índice do maior (empate: ninguém) | — |
| `damagePool` (weapon.mjs) | `damage.bonus` → `flat` | AC/2 4k2+10 → flat 10, sem Força em armas de veículo |

# Data Model — 013-vehicles

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `VEHICLE_CATEGORIES` | `drivetrain, frame, armor, control, accommodation, accessory, modification, weaponUpgrade` |
| `VEHICLE_BUDGETS` | `uncommon 50, rare 100, veryRare 150, mythicRare 200, holdings1 250 … holdings5 450` |
| `VEHICLE_COSTS` | tabelas de Maneuver (0–10), Acceleration (0–5), Speed (1–15), Size (1–30) |
| `VEHICLE_CREW_ROLES` | `pilot, gunner, engineer, passenger` |

## Regras puras

- `rules/vehicle.mjs` (research R3) e as tabelas `OUT_OF_CONTROL`, `VEHICLE_CRIT` (efeito próprio e automação).

## `vehicleComponent` (Item)

| Campo | Tipo |
|---|---|
| `category` | `VEHICLE_CATEGORIES` |
| `cost` | inteiro (VP; pode ser negativo) |
| `slots` | inteiro ou null (sem slot) |
| `perPurchase` | bool (repetível) |
| `quantity` | inteiro ≥ 1 |
| `drive` | `{ rating, controlSkill, minMomentum, flying }` |
| `frame` | `{ hp, resilience }` |
| `armor` | `{ ap }` |
| `effect`, `description`, `source` | texto próprio; HTML; `{ book, page }` |
| `automation` | objeto livre |

## `weapon` (extensão aditiva da 007)

- `damage.bonus` (inteiro, 0) — "+10" das armas de veículo.
- `vehicle { scale: "" \| "Vhcl" \| "Hybrid", slots, cost }`.

## `vehicle` (Actor)

| Campo | Tipo |
|---|---|
| `size`, `speed`, `acceleration`, `maneuver` | inteiros (1–30, 1–15, 0–5, 0–10) |
| `momentum` | 0–10 |
| `budget` | `{ tier }` (`VEHICLE_BUDGETS`) |
| `hp` | `{ value, temp }` |
| `activeDrive` | id do drivetrain |
| `crew` | `[{ role, actorUuid, weaponIds: [] }]` |
| `state` | `{ flipped, destroyed, sceneWounds, juryRigUsed, stalled, lockedRounds, disabled: [], explodeRound, extraReaction, lastMoveRound }` |
| `printed` | `{ vp, slots }` (exemplos do livro) |
| `description`, `source` | HTML; `{ book, page }` |
| derivado | `hp.max`, `derived { staticDefense, resilience, speed }`, `armor.locations`, `drive`, `move`, `slots { used, max }`, `vp { cost, budget }`, `warnings` |

## Flags

- Cartão de ataque de arma montada: `flags.dtd40k.attack.vehicleUuid`.
- Perseguição: `flags.dtd40k.chase = { rounds, round, participants: [{ uuid, name, skill, legs, lastSkill, obstacle }] }`.

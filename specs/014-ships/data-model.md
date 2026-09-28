# Data Model — 014-ships

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `SHIP_CATEGORIES` | `hull, customHull, officer, console, shield, weapon, weaponType, torpedoTube, torpedo` |
| `SHIP_BUDGETS` | `{ 1: 50, 2: 85, 3: 130, 4: 185, 5: 250 }` (Holdings) |
| `HULL_CLASSES` | `escort, destroyer, cruiser, battleship` |
| `CONSOLE_TYPES` | `arcana, command, engineering, tactical, universal` |
| `SHIP_DEPARTMENTS` | `command, manoeuver, tactical, engineering, arcana` com posto e perícia (R12) |
| `OFFICER_POSTS` | 12 postos (5 primários, 3 secundários, 4 especialistas) |
| `SHIELD_TYPES` | `standard, covariant, regenerative, resilient, multiphasic` |
| `SHIP_WEAPON_TYPES` | 7 tipos com os modificadores (Las … Antimeson) |
| `CUSTOMIZATION` | 10 linhas: custo em CP, Upgrade Limit, Total Limit, passo |
| `SHIP_NPC_KEPT` | 4 |

## Regras puras

- `rules/ship.mjs` (contrato em [contracts/rules-api.md](contracts/rules-api.md)) com as tabelas `SHIP_ACTIONS`,
  `SHIP_CRIT`, `RAM_DAMAGE`, `WARP_VOYAGE`, `WARP_ENCOUNTERS`, `WARP_PERILOUS`, `BOMBARD_TORPEDOES` (efeitos em texto
  próprio e mecânica).

## `shipComponent` (Item)

| Campo | Tipo |
|---|---|
| `category` | `SHIP_CATEGORIES` |
| `cost` | inteiro (BP) |
| `quantity` | inteiro ≥ 1 (Hardened Armor, torpedos) |
| `hull` | `{ class, crew, hullStrength, maneuverability, acceleration, speed, sensors, consoles { arcana, command, engineering, tactical, universal, nonUniversal }, weapons { forward, rear }, customizationPoints }` |
| `officer` | `{ post, department, rank, skill, actorUuid }` |
| `console` | `{ type }` |
| `shield` | `{ type, mark, capacity, regen, layers }` |
| `weapon` | `{ pattern, kind: lance\|array, dam { rolled, kept }, dis, acc, crit, range, arc: fixed\|flexible\|omni, typeKey, mount: forward\|rear }` |
| `weaponType` | `{ key }` (referência; na nave o tipo é `weapon.typeKey`) |
| `torpedo` | `{ dam, dis, acc, crit, range, arc }` |
| `tube` | `{ mount, capacity: 5 }` |
| `effect`, `description`, `source`, `automation` | texto próprio; HTML; `{ book, page }`; objeto livre (bônus de console) |

## `ship` (Actor)

| Campo | Tipo |
|---|---|
| `budget.holdings` | 0–5 |
| `custom.upgrades` | contagens por linha de `CUSTOMIZATION` |
| `custom.nonUniversal` | `{ arcana, command, engineering, tactical }` (distribuição livre dos slots não universais da base) |
| `hull` | `{ value, temp }` |
| `crew` | `{ lost, temp, committed, committedRound, deployed }` |
| `shield` | `{ value, disruption, collapsed, layers: [{ value, disruption }] }` |
| `state` | `{ destroyed, crits: [{ key, tn }], disabled: [itemId], adrift, silentRunning, jamming { targetUuid, total }, braced, picardUsed, overcharge { weapons, engines }, suppliesUsed }` |
| `hangar` | `[vehicleUuid]` |
| `printed.cost` | inteiro ou null (naves de NPC) |
| `description`, `source` | HTML; `{ book, page }` |

**Derivados** (`prepareDerivedData`): `stats { hullClass, crew, hullStrength, maneuverability, acceleration, speed,
sensors }` (casco padrão, ou base + customização, + consoles, − críticos), `derived.staticDefense`,
`initiativeBonus`, `crew { max, available }`, `shield { max, regen }`, `bp { spent, budget }`, `slots { consoles
{ tipo: { used, max } }, weapons { forward, rear } }`, `officers { departamento: { name, actorUuid, kept, skill } }`,
`critModifier`, `blocked { command, overcharge, heading, weapons, manoeuver }`, `warnings[]`.

**Estados**: `crew.committed` zera quando `committedRound` ≠ rodada atual; `shield.collapsed` só volta com Restart
Shields; `destroyed` com Hull 0; críticos saem com Emergency Repair, reparo de campo ou Full Repair.

## `squadron` (Actor)

| Campo | Tipo |
|---|---|
| `count` | 0–10 |
| `shipUuid` | nave de origem |
| `profile` | `{ staticDefense: 25, hull: 1, speed: 10, range: 5 }` |

Derivados: `derived.staticDefense` 25; `attack { rolled: count, kept: Ballistics do Tactical Officer da nave }`;
`damage { rolled: ⌊count/2⌋ mín. 1, kept: igual }`.

## Estado de combate no `Combatant`

- `flags.dtd40k.shipTurn { round, manoeuver: bool, departments: [], reactions }` (R4).

## Mensagens

- `flags.dtd40k.shipAttack { shipUuid, targetUuid, weaponIds, total, tn, hit, acc, evasive }`
- `flags.dtd40k.shipDamage { shipUuid, total, dis, crit, targetSubsystem, fighter }`
- `flags.dtd40k.shipApplied { targetUuid, before }` (Desfazer)
- `flags.dtd40k.boarding { attackerUuid, defenderUuid, round, attackerCrew, defenderCrew, officer, done }`
- `flags.dtd40k.warp { shipUuid, distance, relay, step, modifier, time, encounter, done }`

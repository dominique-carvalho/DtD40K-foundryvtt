# Contract — Interfaces no Foundry (013)

## Tipos e packs

- Item `vehicleComponent`; Actor `vehicle` (`VehicleData`, ficha `VehicleSheet` com abas Resumo, Componentes,
  Tripulação e Combate).
- Pack `vehicle-components` (Item, 8 pastas; OBSERVER para jogadores); pack `vehicles` (Actor, 16 exemplos).

## `vehicle-service` (`module/documents/vehicle-service.mjs`)

| Função | Comportamento |
|---|---|
| `addComponent(vehicle, item)` | drop: embute (repetível soma quantidade); avisa slots/orçamento |
| `setCrew(vehicle, actor, role)` / `embark` / `disembark` | tripulação; meia ação do tripulante em combate |
| `move(vehicle, delta, { stunt })`, `punchIt(vehicle, mode, { delta, stunt })` | Momentum, alcance no chat, ação do piloto |
| `fire(vehicle, weaponIds, gunner)` | Skirmish (1) ou Barrage (2) pelo `rollAttack` com a arma do veículo |
| `evasive(message)` | reação do piloto contra o ataque |
| `controlTest(vehicle, { reason })` | Drive/Pilot + Maneuver vs 5 × Momentum; Out of Control |
| `ram(vehicle, target)` | dois cartões de dano XkY+Z; Out of Control ou Control Test |
| `juryRig(vehicle, engineer, { condition })` | HP temporários ou encerra a condição |
| `switchDrive(vehicle, id)` | meia ação |
| `vehicleCritical(vehicle, n)` | rola e aplica o crítico |
| `repair(vehicle, engineer, { dots })` | ciclo de reparo |
| `newScene(vehicle)` | zera ferimentos na cena |

## `chase-service` (`module/documents/chase-service.mjs`)

| Função | Comportamento |
|---|---|
| `startChase(participants, { rounds })` | cartão da perseguição |
| `rollChaseRound(message)` | rola a rodada (Mestre) e atualiza as pernas |
| `markObstacle(message, uuid)` | obstáculo bem resolvido (+2 raises) |

## Extensões

- `attack-service.rollAttack(actor, itemId, { weaponOwner, vehicle })`, `rollDamage` com `damage.bonus` e arma de
  veículo sem Força; cartão com "Evasive" quando o alvo é veículo.
- `damage-service.applyTo`: `vehicle` sem crítico, destruído em 0, ferimentos na cena, críticos de veículo.
- `DtdCombat#_onEndTurn`: Momentum 0 sem Move/Punch It do piloto; `deleteCombat`: `newScene` dos veículos.
- `CHAT_ACTIONS`: `vehicleEvasive`, `chaseRound`, `chaseObstacle`.

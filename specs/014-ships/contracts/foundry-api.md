# Contract — Interfaces no Foundry (014)

## Tipos e packs

- Item `shipComponent` (ficha `ShipComponentSheet`); Actor `ship` (`ShipData`, ficha `ShipSheet` com abas Resumo,
  Componentes, Oficiais, Combate e Viagem) e `squadron` (`SquadronData`, ficha `SquadronSheet`).
- Pack `ship-components` (Item, pastas por categoria e tipo de console; OBSERVER para jogadores); pack `ships` (Actor,
  6 naves de NPC; OBSERVER).
- Tokens de nave vinculados por padrão (como os veículos da 013).

## `ship-service` (`module/documents/ship-service.mjs`)

| Função | Comportamento |
|---|---|
| `addComponent(ship, data)` | drop: casco/base troca o anterior; escudo troca o anterior; Hardened Armor e torpedos somam quantidade; arma pede tipo e montagem (diálogo); tipo de arma avisa para escolher na arma; avisa BP e slots |
| `assignOfficer(ship, itemId, actor)` / `clearOfficer` | liga o posto a um personagem/NPC |
| `setUpgrade(ship, key, delta)` / `setNonUniversal(ship, type, n)` | customização com avisos |
| `addToHangar(ship, vehicle)` / `removeFromHangar` | hangar de referência |
| `fieldRepair(ship)` | Chief Engineer Crafts TN 25; Hull e críticos |
| `portService(ship, kind)` | Mestre: `fullRepair`, `recruitCrew`, `resupply` |
| `newScene(ship)` | Crew temporária, Brace, Picard, Overcharge e estados da rodada zerados |

## `ship-combat-service` (`module/documents/ship-combat-service.mjs`)

| Função | Comportamento |
|---|---|
| `shipAction(ship, key, options)` | confere turno (Manoeuver/departamento), bloqueios de crítico e Crew; diálogo de Crew; rola `crew k oficial + stat`; aplica o efeito simples; cartão |
| `fire(ship, { mode: "everything"\|"snipe"\|"subsystem" })` | diálogo de armas, grupos de Arrays, Crew por rolagem e alvo; cartões de ataque |
| `rollShipDamage(message)` | cartão de dano com Overcharge/Capacitor |
| `applyShipDamage(message, targetUuid)` | escudo → Hull temporário → Hull → Crit Chart; esquadrão perde 1 caça; Desfazer |
| `evasive(message)` | reação do Helmsman com Crew livre contra o cartão de ataque |
| `rollCrit(ship, { bonus })` | rola e aplica a Crit Chart |
| `ram(ship)` | Ramming Speed! (teste contra SD; dois cartões de dano e críticos) |
| `startBoarding(ship, target)` / `boardingRound(message)` | abordagem por rodadas num cartão |
| `startOfShipTurn(combat, combatant)` / `endOfShipRound(combat)` | regeneração do escudo; Radiation Leak; aviso de Manoeuver não usada |

## `squadron-service` (`module/documents/squadron-service.mjs`)

| Função | Comportamento |
|---|---|
| `deploy(ship, n)` | Deploy Fightercraft: cria/atualiza o esquadrão, token ao lado da nave, Crew em `deployed` |
| `squadronAttack(squadron)` | ataque do esquadrão contra o alvo; cartão de dano de nave |
| `dock(squadron)` | devolve a Crew dos caças restantes; remove o token |

## `warp-service` (`module/documents/warp-service.mjs`)

| Função | Comportamento |
|---|---|
| `startVoyage(ship, { distance, relay })` | confere requisitos; cartão da viagem |
| `warpStep(message)` | rola o passo atual (1 portal, 2 curso, 3 condução) e avança |
| `rollEncounter(message)` | encontro com modificadores; perigoso em 11+; subtabelas |
| `bombard(ship, { torpedoId })` | TN 30; desvio; cartão de dano pessoal (Aplicar da 008) |

## Extensões

- `DtdCombatant._getInitiativeFormula`: `ship` → `1d10 + @initiativeBonus`; `squadron` → `1d10`.
- `DtdCombat#_onStartTurn`: `startOfShipTurn`; `#_onEndTurn`: aviso de Manoeuver; `_onStartRound`: `endOfShipRound` da
  rodada anterior; `deleteCombat`: `newScene` das naves.
- `CHAT_ACTIONS`: `shipDamage`, `shipApply`, `shipEvasive`, `shipUndo`, `boardingRound`, `warpStep`, `warpEncounter`.

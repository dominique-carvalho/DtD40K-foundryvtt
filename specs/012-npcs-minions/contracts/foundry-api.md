# Contract — Interfaces no Foundry (012)

## Tipos de ator

- `npc` (`NpcData`, ficha `NpcSheet` herdando a do personagem: abas Principal, Combate, Magia, Antagonista).
- `minionSquad` (`MinionSquadData`, ficha `MinionSheet`).

## Pack `antagonists`

Actor, 47 `npc` + 4 `minionSquad` em 11 pastas; só o Mestre (e Assistente) vê — antagonistas não são para os jogadores.

## `npc-service` (`module/documents/npc-service.mjs`)

| Função | Comportamento |
|---|---|
| `regenerate(combatant)` | início do turno: cura Regeneration até o máximo, posta no chat |
| `fearCard(actor)` | cartão "Fear Test (X)" com botão |
| `fearFromCard(message)` | o personagem do usuário (ou o token controlado) faz o Fear Test da 008 |

## `minion-service` (`module/documents/minion-service.mjs`)

| Função | Comportamento |
|---|---|
| `attack(squad, kind, { attacking })` | (minions)k(TR) contra a SD do alvo; cartão com botão de dano |
| `rollMinionDamage(message)` | cartão de dano da 008 com 5 × (DR + raises) |
| `removeMinions(squad, n)` | baixa; 0 = derrotada |
| `setAlly(squad, actor)` | liga/desliga o herói aliado |

## Extensões

- `damage-service.applyDamage`: `npc` como alvo normal; `minionSquad` → `removeMinions(casualties)`.
- `attack-service.rollAttack`: proficiente e Amorphous; `rollDamage`: Força 0 com `npcDamage`, `raises`/`blast` na flag.
- `condition-service.toggleCondition`: imunidades; `turn-service`/`combat.mjs`: fim e início de turno para `npc`,
  Regeneration; `social-service`: alvo `npc`, Mindless recusado; `magic-service`: `npc` aprende e conjura.
- `actor.withRollModifiers`: bônus dos minions aliados em testes de perícia.
- `CHAT_ACTIONS`: `minionDamage`, `npcFear`.

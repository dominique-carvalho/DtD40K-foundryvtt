# Contract — Interfaces no Foundry (010)

## Pack `martial-schools`

Item `martialSchool`, 15 documentos em 2 pastas; OBSERVER para jogadores.

## `martial-service` (`module/documents/martial-service.mjs`)

| Função | Comportamento |
|---|---|
| `schoolData()` | os 15 documentos do pack (cache) |
| `syncPassives(actor)` | cria/remove os Active Effects das passivas conforme os valores |
| `saveAttack(actor, definition, { id })` | confere `budget`, cobra `attackCost` (confirmação, histórico `specialAttack`), grava em `martial.attacks` (edição guarda a anterior em `history`) |
| `deleteAttack(actor, id)` | apaga após confirmação (sem reembolso; o desfazer do histórico reembolsa) |
| `useAttack(actor, id, { weaponId, prepared })` | `usageCheck` → ação-base (`useAction` com `special`) → teste de perícia → ataque; efeitos no atacante; estado |
| `applyAttackEffects(message)` | efeitos `onHit` no alvo (dono ou Mestre por socket) |
| `newScene(actor)` | zera `usedScene` (Mestre) |

## Extensões

- `turn-service.useAction(actor, key, { weaponId, as, special })`; `multipleAttacks` com `special` só no primeiro.
- `attack-service.rollAttack(..., { special })` e `rollDamage` com os modificadores; `damage-service.applyTo` passa
  `resolve` para `resolveDamage`.
- `xp-service.advance(actor, "martial", key)` e desfazer (`martial`, `specialAttack`); chama `syncPassives`.
- `CHAT_ACTIONS.martialEffects`; hook `deleteCombat` (Mestre) zera `usedScene`.
- Ficha: aba `martial` (escolas com valor e botão de Evolução, níveis liberados, passivas, universais, ataques com
  Usar/Editar/Apagar, montador em diálogo `martial-builder`).

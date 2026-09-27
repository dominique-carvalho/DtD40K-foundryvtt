# Quickstart — validação da feature 012-npcs-minions

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-012`; mundo relançado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.antagonists").index.size === 51` (47 NPCs + 4 squads) em 11 pastas.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Antagonists | 47 NPCs e 4 squads em pastas | US1-1 |
| 2 | Importar Regular Troops/Rebels | Valores da spec; ficha com as abas | US1-2 |
| 3 | Incarnate Lesser Daemon | Traits com valor e dica | US1-3 |
| 4 | NPC rola Weaponry | (perícia + característica) k característica | US2-1 |
| 5 | NPC ataca herói com Lasgun | TN = SD do herói; dano 3k2 E sem Força | US2-2 |
| 6 | Herói acerta o NPC | Aplicar desconta 5 AP e divide pela Resilience | US2-3 |
| 7 | Dano de magia no Daemon (Aura) | Aura reduz | US2-4 |
| 8 | Regeneration no turno | +1 HP, chat | US2-5 |
| 9 | Acerto em Amorphous | Localização corpo | US2-6 |
| 10 | Ataque social em Mindless | Recusado | US2-7 |
| 11 | Stunned em Undead | Não aplicado | US2-8 |
| 12 | Botão de medo (Fear 2) | Cartão; herói faz o Fear Test | US2-9 |
| 13 | NPC Caster aprende e conjura | Como na 009, sancionado | US2-10 |
| 14 | Space Pirate Crew | SD 15, Speed 3 | US3-1 |
| 15 | Squad ataca (5 e 2 minions) | 5k3; 2k2 | US3-2 |
| 16 | Dano da squad com 1 raise | 20, aplicado pela 008 | US3-3 |
| 17 | Herói acerta a squad (2 raises; Blast 4) | 3 saem; 4 saem; derrotada em 0 | US3-4 |
| 18 | Minions aliados | Bônus 5; limite pela Fellowship | US3-5/6 |

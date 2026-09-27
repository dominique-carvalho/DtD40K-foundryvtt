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
| 7 | Dano de magia no Monodrone Modron (Aura 4) | Aura reduz | US2-4 |
| 8 | Regeneration do Modron no turno | +1 HP, chat | US2-5 |
| 9 | Acerto no Elemental (Amorphous) | Localização corpo | US2-6 |
| 10 | Ataque social no Walkin' Dead (Mindless) | Recusado | US2-7 |
| 11 | Stunned em Undead | Não aplicado | US2-8 |
| 12 | Botão de medo (Fear 2) | Cartão; herói faz o Fear Test | US2-9 |
| 13 | NPC Caster aprende e conjura | Como na 009, sancionado | US2-10 |
| 14 | Space Pirate Crew | SD 15, Speed 3 | US3-1 |
| 15 | Squad ataca (5 e 2 minions) | 5k3; 2k2 | US3-2 |
| 16 | Dano da squad com 1 raise | 20, aplicado pela 008 | US3-3 |
| 17 | Herói acerta a squad (2 raises; Blast 4) | 3 saem; 4 saem; derrotada em 0 | US3-4 |
| 18 | Minions aliados | Bônus 5; limite pela Fellowship | US3-5/6 |

## Registro de validação

### 2026-09-27 — Foundry 13.351, mundo "teste-dtd" (título "Mist of Imlarin"), usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-012` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `antagonists` com `index.size` = 51
(47 `npc` + 4 `minionSquad`) em 11 pastas, só para o Mestre; tipos `npc` e `minionSquad` registrados. NPCs importados
do compêndio com o prefixo "T012", herói temporário "T012 Herói", cena "T012 Cena" com tokens vinculados e um combate.
Os passos foram executados pelos serviços que a ficha e os cartões chamam, com os diálogos respondidos por script e os
dados controlados; pela interface: fichas do NPC (abas Principal, Combate, Antagonista) e da Minion Squad, botão
"Fear Test" do cartão de medo e o seletor de herói aliado. Cena, combate, atores e mensagens de teste apagados no fim
(o ator "Aldred Kain" do usuário não foi tocado).

| # | Resultado |
|---|---|
| 1 | ✅ 47 NPCs e 4 Minion Squads em 11 pastas |
| 2 | ✅ Regular Troops/Rebels: Str/Dex/Con 3; Weaponry 3, Ballistics 3; Speed 6; Size 4; Res 4; SD 17; HP 12/12; Level 2; 5 AP em todos os locais; Knife 4k2 R, Lasgun 3k2 E; ficha com Principal, Combate, Magia, Antagonista |
| 3 | ✅ Incarnate Lesser Daemon: Daemonic, Dark Sight, Fear 1, Resource Stat Essence 8 (reserva 8/8 no cabeçalho), botão de medo; aba Combate com condições e ações |
| 4 | ✅ Weaponry do NPC: 6k3 (Weaponry 3 + Str 3) |
| 5 | ✅ Lasgun contra o herói: TN 14 (SD do herói) no diálogo; ataque 5k3 (Ballistics 3 + Level 2, proficiente); dano 3k2 E sem Força |
| 6 | ✅ 20 de dano no NPC: 20 − 5 AP = 15 ÷ Res 4 = 3 HP (12 → 9) |
| 7 | ✅ Monodrone Modron (Aura 4): 10 de dano de magia → 6 ÷ Res 5 = 1 HP |
| 8 | ✅ Início do turno do Modron: +1 HP (19 → 20) e mensagem |
| 9 | ✅ Acerto no Elemental (Amorphous): localização corpo com o d10 que daria outro local |
| 10 | ✅ Ataque social no Walkin' Dead (Mindless): recusado, sem rolagem |
| 11 | ✅ Walkin' Dead (Undead): Stunned e Blood Loss não aplicados (mensagem); Prone aplicado |
| 12 | ✅ Cartão "Fear 2" do Modron; clique com o token do herói selecionado: Fear Test da 008 (e Shock/Trauma na falha em combate) |
| 13 | ✅ Dragonfire Adept (Caster Evocation 3): aprende Magic Missile (vaga 1/3), sancionado, conjura 8k5 (Evocation 3 + Cha 5) |
| 14 | ✅ Space Pirate Crew: SD 15, Speed 3, alcance 30 m na ficha |
| 15 | ✅ Ataque com 5 minions: 5k3 = 21 contra SD 14 (1 raise); com 2: 2k2 |
| 16 | ✅ Dano 5 × (3 + 1) = 20 R, cartão com Aplicar; aplicado no herói |
| 17 | ✅ Lasgun do NPC contra a squad (SD 15): 27, 2 raises → 3 minions removidos (6 → 3); Blast 4 → os 3 restantes, squad derrotada (selo na ficha) |
| 18 | ✅ Aliados TR 3 ×2 (pelo seletor da ficha) e TR 2 ×1: bônus 5 com Fel 4, 4 com Fel 2 (só em testes de perícia); teste de Athletics 1k1 = 5 + 4 = 9; a ficha mostra o bônus |

Correção da validação: o cabeçalho da ficha da Minion Squad herdava o estilo fixo do cabeçalho do personagem (bloco
escuro, nome estreito); passa a usar um cabeçalho em linha.

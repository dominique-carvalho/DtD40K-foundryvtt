# Quickstart — validação da feature 009-magic

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-009`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.spells").index.size === 126` e `combat-tables` com 24 tabelas.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Spells | 126 magias, 9 pastas, 3/3/3/3/2 por escola | US1-1 |
| 2 | Abrir Magic Missile; tooltip de keyword | Dados da spec | US1-2/3 |
| 3 | Comprar Evocation 0 → 1 → 2 (Level 2, Apprentice) | 200, 100; 2 → 3 recusado | US2-1/2 |
| 4 | Escola fora da lista | Recusa; Mestre inclui | US2-3 |
| 5 | Aprender magias | Vaga 1/1; segunda recusada; nível acima recusado | US2-4/5 |
| 6 | Desfazer Evocation 2 | Valor e XP voltam; aviso de vaga | US2-6 |
| 7 | Magic Missile Unfettered / Fettered / Push 2 | 5k3 / 3k3 / 7k3 + Phenomena +20 | US3-1/2/4 |
| 8 | Unfettered com dado explodido mantido | Phenomena (+5 × nível sem Tested) | US3-3 |
| 9 | Phenomena 75+ | Perils rolados | US3-5 |
| 10 | Dano de magia | Cartão de dano com magia; Aplicar usa a Aura | US3-6 |
| 11 | Saving Throw | Botão Resistir do alvo | US3-7 |
| 12 | Agarrado + Somatic; Social em combate | Recusas | US3-8 |
| 13 | Em combate | Ação da magia gasta | US3-9 |
| 14 | Armoring Aura com 2 raises | Aura 3 no alvo | US3-10 |
| 15 | Sustentar Scry | Meia ação por turno; encerrar remove | US4-1/2 |
| 16 | Aprender e conjurar combo | 150 XP; TN maior + 5; sem Fettered; Phenomena +10 quando ocorrem | US4-3/4 |
| 17 | Implement + Implement Focus | Reroll oferecido | US4-5 |

## Registro de validação

### 2026-09-27 — Foundry 13.351, mundo "teste-dtd" (título "Mist of Imlarin"), usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-009` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `spells` com `index.size` = 126 em 9
pastas; `combat-tables` com 24 tabelas em 3 pastas (Psychic Phenomena e Perils of the Warp na pasta Warp). Ator
temporário "T009 Mage" (Cha 3, Wil 2), alvo "T009 Alvo" e cena "T009 Cena" com tokens vinculados; os passos foram
executados pelos serviços que a ficha e os cartões chamam, com os diálogos respondidos por script e os dados
controlados; clicados no DOM: aprender combo (caixas e nome na aba Magia) e Conjurar (diálogo real conferido na tela).
Magias de outras escolas (Armoring Aura, Blindness, Detect Thoughts, Scry) aprendidas pelo override do Mestre. Cena,
combate, atores e mensagens de teste apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 126 magias em 9 pastas; 24 tabelas em 3 pastas |
| 2 | ✅ Magic Missile com os dados da spec; dica das keywords no tooltip |
| 3 | ✅ Apprentice (Level 1): Evocation 0 → 1 por 200; 1 → 2 recusado ("não pode passar do Level"). Com Aspirant (Level 2): 1 → 2 por 100; teto no Level |
| 4 | ✅ Enchantment recusada (fora da lista da classe); override do Mestre funciona |
| 5 | ✅ Magic Missile aprendida (vaga 1/1); Battering Ram recusada ("não há vaga"); Energy Grasp (nível 2) recusada ("acima do valor") |
| 6 | ✅ Desfazer Evocation 2: valor 1 e XP de volta; aba mostra vagas 2/1 em aviso |
| 7 | ✅ Unfettered 5k3, Fettered 3k3, Push 2 7k3; Push rolou Phenomena +20 (56 + 20 = 76 → Perils) |
| 8 | ✅ Unfettered com 10 explodido mantido: Phenomena +5 (56 + 5 = 61, Tech Scorn); sem explosão, sem Phenomena |
| 9 | ✅ Phenomena 76 → Perils 56 (Locked In): Helpless aplicado |
| 10 | ✅ Cartão de dano com "Aura no lugar da armadura"; Aplicar no alvo com Aura 3: 8 − 3 = 5 ÷ Res 4 = −1 HP |
| 11 | ✅ Blindness com alvo: botão Resistir; Arcana + Wil falhou (1 contra 27): Blinded no alvo |
| 12 | ✅ Agarrado: Armoring Aura recusada (Somatic); em combate: Detect Thoughts recusada (Social) |
| 13 | ✅ Em combate: meia ação `spell:<id>` gasta; a mesma meia de novo recusada (regra da 008) |
| 14 | ✅ Armoring Aura com 2 raises (total 20, TN 10): Aura 3 no alvo |
| 15 | ✅ Scry (Social; override em combate): ação completa gasta; no turno seguinte "Sustentando Scry", meia `sustain:<id>` cobrada; encerrar remove |
| 16 | ✅ Combo Magic Missile + Energy Grasp pela aba: 150 XP, entrada `combo` no histórico; diálogo sem Fettered, TN 25 (20 + 5); Phenomena com +10 do combo quando ocorrem (Push 1: +20). Conforme o livro (p. 230), o +5 por magia só vale "se ocorrerem" Phenomena |
| 17 | ✅ Implement equipado (selo na aba) + Implement Focus: caixa de reroll no diálogo; o 1 rerrolado (1 → 5) |

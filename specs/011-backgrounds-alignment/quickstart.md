# Quickstart — validação da feature 011-backgrounds-alignment

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-011`; mundo relançado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.deities").index.size === 21` em 3 pastas e a tabela Degeneration no
`combat-tables` (16 resultados).

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Deities | 21 deuses, 3 pastas, 7 em cada | US1-1 |
| 2 | Abrir Slaanesh; tabela Degeneration | Dados da spec; 16 linhas | US1-2/3 |
| 3 | Criação: Contacts 3, Wealth 2, Fame 2 | 7/7, 0 XP | US2-1 |
| 4 | Mais um ponto (≤ 3) e Fame 4 | 50 e 100 XP no histórico | US2-2 |
| 5 | Fora da criação | Jogador recusado; Mestre edita | US2-3 |
| 6 | Artifacts somando 6 na criação | Recusa acima de 5 | US2-4 |
| 7 | Aquisição com Wealth 2 | Usa Wealth 2 | US2-5 |
| 8 | Inheritance 1 "2 Common" | +2 vagas Common nos itens iniciais | US2-6 |
| 9 | Rolar Contacts com Fellowship | (Contacts + Fel) k Fel | US2-7 |
| 10 | Desfazer compra de Background | Valor e XP voltam | US2-8 |
| 11 | Arrastar Sigmar | Alinhamento na ficha | US3-1 |
| 12 | Alignment Check 7 vs 6; 3 vs 8; +2 de bônus | Passa; Devotion 7; passa | US3-2/3/5 |
| 13 | Falha em 6 | Devotion 5, segundo teste, Degeneration | US3-4 |
| 14 | Recuperar Devotion | +1; cura a Degeneration do ponto | US3-6, US4-7 |
| 15 | Devotion 1 e falha | Fora de jogo | US3-7 |
| 16 | Trocar para Pelor; para Khorne; segunda troca | 4; 4 + Degeneration em 7; recusa | US3-8 |
| 17 | Degeneration Palsy | Dex −1, compra de Dex recusada | US4-1/2 |
| 18 | Palsy repetida; Horrific Nightmare; Blighted Mind; Skin Affliction | Nova rolagem; Night Terrors; derangement; −2k0 social | US4-3/4/5/6 |

## Registro de validação

### 2026-09-27 — Foundry 13.351, mundo "teste-dtd" (título "Mist of Imlarin"), usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-011` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `deities` com `index.size` = 21 em 3
pastas (7 por panteão); `combat-tables` com 25 tabelas em 4 pastas, Degeneration com 16 resultados na pasta Alignment;
tipo `deity` registrado. Ator temporário "T011 Herói" (em criação, 600 XP). Os passos foram executados pelos serviços
que a ficha chama, com os diálogos respondidos por script e os dados controlados (d10, d100 e dados de teste); pela
interface: ficha do deus, seção Backgrounds na aba Traços (campo do Mestre no modo Edição) e o botão Curar da seção
Alinhamento. O jogador comum (recusa fora da criação) não foi exercitado no Foundry: o mundo só tem o Gamemaster
(coberto por teste unitário de `canRaise`). Ator e mensagens de teste apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 21 deuses em 3 pastas, 7 em cada |
| 2 | ✅ Slaanesh: Ruinous Powers, p. 295, 5 palavras-chave, 3 mandamentos, "Emancipation of Slaanesh", cultos Noise Marines e The S Academy; compêndio bloqueado; Degeneration com 16 linhas |
| 3 | ✅ Criação: Contacts 3, Wealth 2, Fame 2 = 7/7, 0 XP (7 entradas de custo 0 no histórico) |
| 4 | ✅ Mentor 1 e Fame 3 por 50 cada; Fame 4 por 100 |
| 5 | ✅ Fora da criação o Mestre sobe Status sem XP (entrada de custo 0) e edita Mentor no campo do modo Edição; recusa do jogador: só teste unitário |
| 6 | ✅ Sword of Ages 3 + Crown 2: o terceiro ponto do Crown (total 6) é recusado ("no máximo 5 pontos de Artifacts") |
| 7 | ✅ Aquisição do Laspistol com Wealth 2 do Background: 2k2 |
| 8 | ✅ Inheritance 1: "1 Common + 1 Very Common" recusado; "2 Common" aceito → vagas Common 4; quatro itens Common entram, o quinto é recusado |
| 9 | ✅ Contacts 3 + Fel 2: 5k2 |
| 10 | ✅ Desfazer Fame 3 → 4: Fame 3 e 100 XP de volta; desfazer as compras do Crown: 2 → 1 → removido, 100 XP de volta |
| 11 | ✅ Sigmar arrastado vira o alinhamento |
| 12 | ✅ 1d10 7 contra 6: passou; 3 contra 8: falhou, Devotion 7, sem segundo teste; 4 + 2 contra 6: passou |
| 13 | ✅ 2 contra 6: Devotion 5; segundo teste 1 contra 5: falhou; Degeneration 05 = Palsy registrada em 5 |
| 14 | ✅ Recuperar 7 contra 5: Devotion 6 e Palsy (ponto 5) superada, Dex de volta; recuperar 2 contra 6: nada muda |
| 15 | ✅ Devotion 1 e falha: Devotion 0, mensagem de fora de jogo e aviso na ficha |
| 16 | ✅ Para Pelor (mesmo panteão): 6 → 4; para Khorne: recusado (só uma vez); com override do Mestre: Devotion 4 e Degeneration (Ill-fortuned) em 7 |
| 17 | ✅ Palsy: Dex −1 (efeito); compra de Dex por XP recusada ("reduzida por uma Degeneration"), também no botão de Evolução |
| 18 | ✅ Palsy repetida → rolada de novo (Skin Affliction: Charm −2k0, Athletics sem mudança); Horrific Nightmare: Night Terrors sem XP (total 600 → 600); repetida com Night Terrors → rolada de novo (Ashen Taste); Blighted Mind: derangement menor; curar remove efeitos, item e derangement |

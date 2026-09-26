# Quickstart — validação da feature 006-classes-xp

## Pré-requisitos

- Ambiente da 005; link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-006`; Foundry na
  tela de setup durante o build e reiniciado após mudar o `system.json`. **Nenhum outro mundo em uso.**

## Testes e build

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: no mundo, `game.packs.get("dtd40k.classes").index.size === 103`.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Classes | 103 classes em 19 pastas; 23/21/22/19/18 por Level | US1-1 |
| 2 | Abrir Swordsman e uma classe com "A ou B" | Dados da spec; grupo agrupado com obrigatório/opcional | US1-2/3 |
| 3 | pt-BR | Rótulos traduzidos | US1-4 |
| 4 | Personagem Weaponry 2, Athletics 1: arrastar Swordsman | Classe atual; Level 1; "Class: Swordsman" | US2-1 |
| 5 | Personagem Weaponry 1: arrastar Swordsman | Recusa com "Weaponry 2"; Mestre inicia mesmo assim | US2-2 |
| 6 | Level 1: arrastar classe Level 3 | Recusa por Level | US2-3 |
| 7 | Comprar Quick Draw e Hardy | "2 / 4"; faltam Fast Reflexes e Power Attack | US2-4 |
| 8 | Arrastar outra classe | Recusa: conclua a atual | US2-5 |
| 9 | Comprar os 2 restantes | Swordsman concluída; bônus em texto; Free Study | US2-6 |
| 10 | Mercenary concluída | HP máximo +2 (modificador desligável) | FR-009 |
| 11 | Iniciar Myrmidon | Level 2; Swordsman nas concluídas | US2-7 |
| 12 | Nighthawk: comprar uma alternativa do "A ou B" | Conta como cumprida; a outra bloqueada | US2-8 |
| 13 | Sem classe | Level editável | US2-9 |
| 14 | Mestre desfaz conclusão | Bônus e concessões saem | US2-10 |
| 15 | XP inicial | 600 / 0 / 600; com hindrance 700 | US3-1 |
| 16 | Modo avanço: +1 Strength; Weaponry 2→3; perícia nova da lista | 200; 50; 100; histórico | US3-2/3 |
| 17 | Stealth na Swordsman; em Free Study | Recusa; 200 | US3-4 |
| 18 | Arrastar Power Attack; feat fora da lista; feat racial | 100; recusa (Mestre inclui sem cobrar); 100 | US3-5 |
| 19 | Power Stat +1 | 300, respeita Level | US3-6 |
| 20 | Saldo insuficiente | Recusa | US3-7 |
| 21 | Desfazer última compra | Valor volta, XP devolvido | US3-8 |
| 22 | Mestre concede 150 XP "Sessão 3" | Total +150 no histórico | US3-9 |
| 23 | Modo edição: clicar pontos | Sem cobrança | US3-10 |
| 24 | Trilha Druid concluída em 2 classes | Improved Animal Companion e Beastmaster uma vez, 2 origens | Edge |
| 25 | Observador | Classes e XP só leitura | FR-020 |

## Registro de validação

### 2026-09-26 — Foundry 13.351, mundo "teste dtd", usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-006` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `index.size` = 103, 19 pastas,
23/21/22/19/18 por Level. Os passos 4–24 foram executados pelos serviços que a ficha chama (`startClass`,
`addFeat`, `advance`, `undoXp`, `awardXp`, `uncompleteClass`, `removeClass`), com os diálogos de confirmação
respondidos por script; os botões da ficha (modo Evolução, `+custo`, Comprar, Dar XP, Desfazer, pontos no modo
Edição, aba Classe e XP) foram clicados no DOM da ficha aberta. Atores de teste criados e apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 103 classes, 19 pastas, 23/21/22/19/18 por Level |
| 2 | ✅ Swordsman: Level 1, Fighter, p. 135, Weaponry 2 e Athletics 1, 4 obrigatórios e 2 opcionais; Nighthawk: "Far Shot or Furious Assault" em "Escolha um" |
| 3 | ⚠️ Só conferido no arquivo `pt-BR.json` (rótulos presentes); a interface foi vista em inglês |
| 4 | ✅ Swordsman atual; Level 1; cabeçalho "Class: Swordsman" |
| 5 | ✅ Weaponry 1: "Missing skills: Weaponry 2."; Mestre inicia ao confirmar |
| 6 | ✅ Diplomat (Level 3) num Level 1: recusa por Level ("up to Level 2") |
| 7 | ✅ Quick Draw e Hardy: "2 / 4", faltam Fast Reflexes e Power Attack; 100 XP cada |
| 8 | ✅ Myrmidon com Swordsman aberta: "Complete Swordsman first." |
| 9 | ✅ Swordsman concluída com aviso; bônus em texto; Free Study |
| 10 | ✅ Mercenary: HP máximo 5 → 7 (efeito "Mercenary: Max Hit Points"); desligado 5, religado 7 |
| 11 | ✅ Myrmidon: Level 2; Swordsman nas concluídas |
| 12 | ✅ Nighthawk: Far Shot cumpre o grupo, Furious Assault bloqueado e recusado na compra |
| 13 | ✅ Sem classe: campo Level editável; com classe, só leitura |
| 14 | ✅ Desfazer Oak-Knower: Improved Animal Companion e Beastmaster ficam só com a origem Ovate; desfazer Ovate: saem |
| 15 | ✅ 600 / 0 / 600; com o hindrance Wimpy, 700 |
| 16 | ✅ Strength 1→2: 200; Weaponry 2→3: 50; Perception 0→1 (lista da Myrmidon): 100; histórico com as entradas |
| 17 | ✅ Academic Lore na Myrmidon: recusado ("Not on the current class list."); Stealth em Free Study: 200 (dobro) |
| 18 | ✅ Blind Fighting (lista): 100; Fearless (fora da lista): recusado, Mestre inclui sem cobrar. ⚠️ Feat racial não exercitado no Foundry (coberto por teste unitário) |
| 19 | ✅ Gnosis (Atlantean) 1→2: 300; no máximo do Level 2: "already at the maximum"; desfazer volta a 1 |
| 20 | ✅ Saldo 0: "Not enough XP: costs 200, 0 available." |
| 21 | ✅ Desfazer Blind Fighting: item removido e 100 devolvidos; desfazer Perception: volta a 0 |
| 22 | ✅ Mestre concede 2000 "Sessão 3" e 150 "Sessão 4" (pelo botão da aba): total +150 |
| 23 | ✅ Modo Edição: Brawl 0→1 sem cobrança nem lançamento; sem botões `+custo` |
| 24 | ✅ Ovate e Oak-Knower concluídas: Improved Animal Companion e Beastmaster uma vez, com 2 origens |
| 25 | ⚠️ Não exercitado (o mundo só tem o usuário Gamemaster) |

Correções feitas durante a validação: desfazer a conclusão de uma classe enquanto outra está em andamento
deixava duas classes "atuais" — agora o Mestre é avisado para remover a classe em andamento antes; desfazer
um prêmio de XP pedia "devolver" o XP — agora pergunta "Remover o prêmio".

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

# Quickstart — validação da feature 027-builder-backing-inheritance

## Pré-requisitos

- `npm run build:packs` no worktree `DtD40K-foundryvtt-027` **com o Foundry fechado**; depois o link
  `Data/systems/dtd40k` apontando para o worktree e o Foundry aberto do zero.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Backgrounds: ver a seção Backing | Texto explicativo e botão + | US1-1 |
| 2 | Adicionar "Harmonium" 2 e "Doomguard" 1, Wealth 3, Allies 1 | 7 pontos gratuitos usados, 0 XP | US1-2 |
| 3 | Subir Harmonium para 4 | XP de Backgrounds sobe conforme a regra | US1-2 |
| 4 | Remover Doomguard; adicionar um Backing sem nome | Harmonium continua; aviso de nome | US1-3 |
| 5 | Inheritance 0, passo Equipamento | Seção Inheritance só com o texto | US2-1 |
| 6 | Inheritance 2: um Rare; trocar por dois Uncommon | Linha de cada item; "Usado: 2 de 2" | US2-2/3 |
| 7 | Adicionar um terceiro Uncommon | Aviso de Inheritance; passo bloqueado; Mestre libera | US2-4 |
| 8 | Concluir com um rascunho de teste | Backings na ficha com os pontos; XP igual ao do montador; itens herdados no inventário; contagem da Inheritance na ficha | US1-4, US2-5 |
| 9 | Abrir um rascunho salvo antes da 027 | Abre sem erro, listas vazias | FR-008 |

## Validação (2026-10-06, Foundry 13.351, mundo Mist of Imlarin, Gamemaster)

Rascunho de teste copiado do rascunho do Gamemaster; ao fim, o ator de teste foi apagado e o rascunho original
restaurado (idêntico ao backup).

| # | Resultado |
|---|---|
| 1 | Seção Backing abaixo de Artifact, com o texto da 026 e o botão + |
| 2 | Harmonium 2, Doomguard 1, Wealth 3, Allies 1 e Inheritance 2: "Free dots used: 7 of 7 · XP spent on Backgrounds: 100" (9 pontos até 3, dois pagos) |
| 3 | Harmonium em 4: 250 XP (três pontos pagos a 50 e o 4º a 100) |
| 4 | Doomguard removido sem afetar Harmonium; Backing sem nome mostra o aviso "A Backing without an organization name…" |
| 5 | Rascunho do Gamemaster (anterior à 027) com Inheritance 3: abre sem erro, listas vazias, "Used: 0 of 4" |
| 6 | Inheritance 2: Bionic Heart (Rare) "Used: 2 of 2"; trocado por Alpha + Ballistic Mechadendrite (Uncommon) "2 of 2"; seletor com 7 grupos de raridade, sem artefatos (32 de 69 Rare); linha de descrição em cada item |
| 7 | Terceiro Uncommon: "Used: 3 of 2" em vermelho, motivo "The inherited items exceed the Inheritance rating." e botão Release (GM) |
| 8 | Concluído "Teste 027": Backings Harmonium 2 e Doomguard 1; log de XP dos Backgrounds somando 100 (igual ao montador); Inheritance 2 com contagem `uncommon: 2`; Medicae Mechadendrite, Alpha e Ballistic Mechadendrite no inventário, todos em vaga Uncommon |
| 9 | Ver item 5 |

Não testado no Foundry: o recurso de adicionar sem vaga (passo liberado acima da nota para um jogador sem ser Mestre).

# Quickstart — validação da feature 016-guided-creation

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-016`, com os packs compilados
  (`npm run build:packs`, com o Foundry fechado se os packs já estiverem abertos). A feature não muda o `system.json`;
  basta recarregar a página.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Novo personagem; abrir a ficha | Painel de criação: características 0/6, 0/4, 0/2; perícias 0/8, 0/6, 0/4; XP 600 | US1 |
| 2 | Montar Traya (pp. 18–19): Tiefling (+1 Con), notas base | Características Physical 6/6, Mental 4/4, Social 2/2; perícias Physical 8/8, Social 6/6, Mental 4/4; Intimidation/Weaponry da raça fora da conta | US1, SC-001 |
| 3 | Com os grupos cheios, subir mais uma característica e uma perícia (jogador simulado) | Recusadas com aviso; como Mestre, confirmação e passa | US1-2 |
| 4 | Str 4 → 5 e perícia 3 → 4 no modo de edição | Recusadas (`stepMax`); Brawl 3 → 4 por XP no modo de avanço passa e não entra na conta | US1-3/4 |
| 5 | Duas Hindrances; tentar a terceira | XP 800; terceira recusada | US2-1/2 |
| 6 | Gastar 750 de XP como no exemplo | XP 800 / 750 / 50 | SC-001 |
| 7 | Adicionar classe de nível 2 na criação | Recusada (`creationLevel`); Brother (nível 1) entra | US2-4 |
| 8 | Nota em 5 → 6 sem exceção; com Atlantean, quarta perícia a 6 | `atMax`; `sixLimit` | US2-5 |
| 9 | Brawl em 4 sem especialidade; especialidade numa nota 3 | Pendente e excedente no painel | US2-6 |
| 10 | Checklist do Traya completo | Todas as etapas feitas; idiomas como lembrete (2) | US3-1 |
| 11 | Encerrar com pontos sobrando; depois encerrar completo | Confirmação com a lista; sem confirmação quando completo; painel some | US3-2/3 |
| 12 | Criação encerrada: comprar um Asset e tomar Hindrance | Recusados (Mestre libera) | US2-3 |
| 13 | Personagem já em jogo (Aldred Kain) | Nenhuma nota alterada; sem painel | SC-004 |

## Registro de validação — 2026-09-28

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 016 (packs compilados no worktree). O papel do
jogador foi simulado no cliente do Mestre (`game.user.isGM` falso); diálogos respondidos por stub.

| # | Resultado |
|---|---|
| 1 | Personagem novo com Tiefling: painel com características 0/6, 0/4, 0/2, perícias 0/8, 0/6, 0/4, XP 600 e o checklist |
| 2 | Notas base do exemplo (Traya, pp. 18–19): características Physical 6/6, Mental 4/4, Social 2/2; perícias Physical 8/8, Social 6/6, Mental 4/4; Con 4, Intimidation 1 e Weaponry 1 pela raça, fora da conta |
| 3 | Jogador: Dex 2 → 3 e Drive 0 → 1 com os grupos cheios recusados ("does not fit the 6/4/2…"); Mestre: confirmação, recusou e depois permitiu |
| 4 | Str 4 → 5 e Scrutiny 3 → 4 recusados (`stepMax`), também pelo clique no ponto no modo de edição; baixar uma nota passa; Brawl 3 → 4 por XP (50) passou e não entrou na conta (perícias continuam 8/6/4) |
| 5 | Enemy e Impulsive: XP 800; Wimpy (terceira Hindrance) recusada com a liberação do Mestre |
| 6 | Compras do exemplo: painel com total 800, gasto e saldo acompanhando o log (450 gastos no teste; ver nota abaixo) |
| 7 | Bard (nível 2) recusado com "a new character starts with a Level 1 class" (e os pré-requisitos); Brother entrou |
| 8 | Str 5 → 6 sem exceção recusado por XP ("already at the maximum") e na edição (`atMax`); Atlantean com três perícias em 6: a quarta recusada por XP e na edição (`sixLimit`) |
| 9 | Str, Con, Wil e Brawl em 4 sem especialidade: pendentes; especialidade em Charm 1: "Charm (+1)" excedente |
| 10 | Com divindade Malal, Backgrounds 7/7, 6 itens iniciais e especialidades: todas as etapas feitas; idiomas 2 |
| 11 | Encerrar personagem incompleto: confirmação lista as 8 etapas pendentes; cancelado, a criação continua; Traya completo encerrou sem confirmação e o painel sumiu; botão não está mais na aba Equipamento |
| 12 | Criação encerrada: asset (Sand) recusado para o jogador, Mestre recebe a liberação; Exalted Asset (Get of Fenris) recusado ("only during character creation") |
| 13 | Aldred Kain e Milton: valores guardados sem mudança; os dois ainda estão com a criação ativa (o sinal nasce ligado), então aparecem com o painel e com o máximo da criação: Milton (Str 5 + 1 do Dragonborn) aparece com Str 5 até o Mestre encerrar a criação |

Nota sobre o passo 6: o exemplo gasta 750; no teste ficaram 450 porque o Exalted Asset não cobra XP (lacuna anterior
à 016, registrada nas pendências) e duas feats foram escolhidas com a subcategoria errada pelo stub, ficando fora da
lista (o Mestre liberou sem custo). A conta do painel seguiu o log.

Correções feitas na validação: o máximo da criação (5, ou 6 pelas exceções) só corta os valores com a criação ativa;
depois dela o corte volta a 6 e o máximo vale só nas novas subidas, para personagens em jogo não perderem pontos.

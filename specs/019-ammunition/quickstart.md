# Quickstart — validação da feature 019-ammunition

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-019`, com os packs compilados; recarregar.
- Cena com um personagem armado com Autogun (Clip 30, ROF 10, Reload Full), Plasma Gun (8Full, Overheats) e um
  lança-granadas com granadas; um NPC com arma de pente; combate iniciado.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Ficha: linha do Autogun | 30/30 · reserva 2, editáveis | FR-001 |
| 2 | Tiro simples; rajada | 29; 19; cartão mostra os tiros restantes | US1-1/2 |
| 3 | Duas rajadas com 19 | 9, depois 0 com ROF efetivo 9 | US1-2 |
| 4 | Ataque com 0 | Recusado; Mestre libera | US1-3 |
| 5 | Suppressing Fire | Gasta o ROF ao confirmar; rajada do próximo turno não gasta de novo | US1-4 |
| 6 | Lança-granadas | Granada −1 por disparo | US1-5 |
| 7 | Reload do Autogun | Ação completa; 30/30 e reserva 1 | US2-1 |
| 8 | Plasma Gun: 3 Reloads e um Standard Attack | Progresso 3/8 e depois 0 | US2-2/3 |
| 9 | Reload sem reserva | Recusado | US2-4 |
| 10 | Emperrar (dados fixados) | Travada; ataque recusado; Clear Jam: destrava vazia | US3 |
| 11 | NPC com arma de pente | Gasta e recarrega igual | FR-009 |

## Registro de validação — 2026-09-30

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 019 (packs compilados no worktree). Cena de
teste com o personagem Gunner (Autogun Clip 30 ROF 10 Reload Full; Plasma Gun Clip 20 Reload 8Full com Overheats;
Missile Launcher com 2 Frag Missiles), o NPC Raider (Autogun) e um alvo; combate iniciado. Diálogos respondidos por
stub; dados fixados quando o passo pedia um resultado.

| # | Resultado |
|---|---|
| 1 | Linha do Autogun: 30/30 · reserva 2, editáveis (reserva mudada para 3 pelo campo); botão Recarregar; seletor da aba Combate "Autogun (30/30)" |
| 2 | Tiro simples 30 → 29; rajada 29 → 19; o cartão mostra "19/30 rounds left" |
| 3 | Rajadas 19 → 9 → 0 (a última com os 9 restantes); com 3 tiros e 8 raises a rajada deu 3 hits (ROF efetivo 3) |
| 4 | Ataque com 0: recusado ("out of rounds: reload first"), liberação do Mestre oferecida |
| 5 | Suppressing Fire: 30 ao colocar a zona, 20 ao confirmar (ROF 10 guardado na zona); a rajada do turno seguinte não gastou mais |
| 6 | Missile Launcher: 2 → 1 → 0 mísseis; terceiro disparo recusado; o dano do último ainda leu o míssil em 0 |
| 7 | Recarregar pelo botão da linha: ação completa gasta, 20 → 30, reserva 2 → 1 |
| 8 | Plasma Gun (8Full): Reloads em três turnos → progresso 1, 2, 3 e selo "Reloading 3/8"; um Standard Attack zerou; oito Reloads encheram 20/20 (reserva 1) |
| 9 | Reload sem reserva: recusado ("no spare clip"), sem gastar a ação |
| 10 | Tiro simples com Ballistics 3 (3 dados mantidos) e todos os dados em 1: Autogun travada (selo "Jammed" e "Autogun (29/30 · Jammed)"), ataque seguinte recusado; Clear Jam por Ballistics 26 contra TN 15: destravada com 0; recarregada, voltou a atirar; Plasma Gun (Overheats) emperrada ficou com 0 |
| 11 | NPC Raider: rajada 30 → 20, Reload pela aba Combate 20 → 30 (reserva 1) |
| — | Fim do combate: progresso de recarga 2 → 0 |

Correções feitas na validação: Clear Jam rola a melhor entre Tech-Use e Ballistics (Tech-Use é avançada e sem treino
não pode ser rolada; o livro aceita as duas).

Observação: com um tiro simples de 1k1 a arma não emperra no nível 1 (é preciso manter mais 1 que o nível), como na regra
da 007.

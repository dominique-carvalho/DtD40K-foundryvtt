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

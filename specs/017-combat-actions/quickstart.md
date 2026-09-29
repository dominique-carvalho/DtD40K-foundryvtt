# Quickstart — validação da feature 017-combat-actions

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-017`, com os packs compilados. Se o
  `system.json` mudar (condições novas não mudam), reiniciar o Foundry; senão recarregar.
- Uma cena com tokens: atirador com arma automática (ex.: Autogun ROF 10), três alvos (um com Em cobertura), e dois
  personagens para o grapple; combate iniciado.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Suppressing Fire com arma sem automático | Recusado | FR-001 |
| 2 | Suppressing Fire com o Autogun; ajustar e confirmar o cone | Cartões de Pinning para os 3 alvos; Fearless imune | US1-2 |
| 3 | Rolar os Pinning; um falha | Pinned no que falhou | US1-3 |
| 4 | Pinned tenta Charge | Recusado (Mestre libera) | US1-5 |
| 5 | Fim do turno do Pinned dentro da zona | Cartão de saída TN 20 | US1-5 |
| 6 | Início do próximo turno do atirador | Cartão da rajada: total, acertados (descobertos com SD < total, até o ROF), Aplicar e Dodge; cone removido | US1-4 |
| 7 | Fim do turno do Pinned sem zona | Saída TN 10 | US1-5 |
| 8 | Em cobertura com AP 8 nas pernas | Flag no token; dano nas pernas passa pela cobertura | FR-014 |
| 9 | Knock Down contra alvo marcado | Cartão oposto de Strength com vencedor e raises; Prone no perdedor | US2-1 |
| 10 | Grapple com arma equipada | Ataque de Brawl desarmado; Dodge disponível; "Iniciar grapple" aplica Grappling/Grappled | US2-2/3 |
| 11 | Controlador: Empurrar | Strength oposta; distância 2 + 2/raise (máx. Speed) | US2-4 |
| 12 | Grappled tenta Standard Attack; depois Slip Free | Recusado; Slip Free TN 20, escapa com meia ação | US2-5 |
| 13 | Overwatch (Full Auto Burst, gatilho texto); no turno do inimigo, Disparar | Ataque automático, Overwatch acaba; zona some | US3-1 |
| 14 | Overwatch ativo e o personagem faz Dodge | Overwatch acaba | US3-2 |
| 15 | Delay; usar Standard Attack no turno de outro | Consome o delay, não o turno seguinte; some no início do turno | US3-3 |
| 16 | Tactical Advance com Em cobertura | Condição continua, sem ataque de oportunidade | US3-4 |
| 17 | Fim do combate | Zonas, Delay e grapple limpos | Edge |

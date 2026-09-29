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

## Registro de validação — 2026-09-28

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 017 (packs compilados no worktree). Cena de
teste 30 × 20 (1 m por quadrado) com atirador (Autogun ROF 10 e Pump Shotgun), três alvos (B com Fearless, C Em
cobertura), Grappler (Str 3, Officer's Cutlass) e Victim; combate iniciado. Diálogos respondidos por stub; dados
fixados quando o passo pedia um resultado.

| # | Resultado |
|---|---|
| 1 | Suppressing Fire com a Pump Shotgun recusado ("needs a weapon that can fire full auto"), sem gastar a ação |
| 2 | Com o Autogun: cone de 45° do token do atirador na direção do alvo, 90 m (alcance), encurtado para 12 m no mapa; "Confirmar zona": cartão de Pinning com A e C para rolar e B "Immune" (Fearless) |
| 3 | A falhou (1 contra TN 20) e ficou Pinned; C passou (26) |
| 4 | A Pinned: Charge recusado com a liberação do Mestre; Standard Attack (meia ação) passou |
| 5 | Fim do turno de A dentro da zona: cartão de saída TN 20 |
| 6 | Início do turno do atirador na rodada 2: rajada 2k1 = 6 (nenhum SD 8 abaixo), cone removido; na segunda zona, 16: A e B acertados, C não (Em cobertura); o cartão de rolagem sem os botões de dano/Dodge, o cartão da rajada com Dano e Dodge por alvo |
| 7 | Dano da rajada em A aplicado ao token de A sem alvo marcado (20 → 4 HP, crítico no braço); Dodge de B pelo cartão; saída do Pinned fora de zona com TN 10 (16, sucesso, Pinned removido) |
| 8 | Em cobertura em C: diálogo (AP 8, corpo, braços e pernas) → flag no token; dano na perna 12 → 4 pela cobertura, que perdeu 1 AP |
| 9 | Knock Down do Grappler no Victim: Strength oposta 30 × 5, 5 raises, Victim Prone |
| 10 | Grapple com o Officer's Cutlass equipado: ataque Unarmed/Brawl, cartão com Dodge/Parry e "Iniciar grapple"; Grappling e Grappled ligados |
| 11 | Grappler: Standard Attack recusado (controla um grapple); Control Grapple → Empurrar: 12 × 1, 2 raises → 4 m (Speed 4) |
| 12 | Victim: Standard Attack recusado; Slip Free 26 contra TN 20: as duas condições e os vínculos saíram, turno com meia ação sobrando |
| — | Take Control do Victim: 26 × 6 (4 raises), controle trocado e Derrubar aplicado na hora (Grappler Grappled e Prone) |
| 13 | Overwatch (Full Auto Burst, gatilho "door"): "Disparar" no Target A rolou contra o SD dele (TN 8, acerto, 1 hit) sem gastar ação; zona removida; segundo disparo recusado |
| 14 | Overwatch ativo e o atirador faz Dodge: zona removida |
| — | Overwatch com Suppressing Fire disparado: cartão de Pinning e a zona passa a Suppressing Fire ativa |
| 15 | Delay de C; Standard Attack de C no turno do atirador consumiu o Delay sem mexer no turno de C; um Delay não usado sumiu no início do turno de C (rodada 3) |
| 16 | Tactical Advance de C: cartão lembra a cobertura; Em cobertura continua (AP 7) |
| 17 | Fim do combate com zona ativa e grapple: zona apagada, Grappling/Grappled e vínculos removidos |

Correções feitas na validação: o cartão de rolagem da rajada perde os botões de dano e Dodge (que iriam ao alvo do
Mestre); o Full Auto Burst do Overwatch rola contra a Static Defense do alvo marcado.

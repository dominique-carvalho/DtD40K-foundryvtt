# Implementation Plan: Ações de combate (DtD 7.7a)

**Branch**: `017-combat-actions` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/017-combat-actions/spec.md`

## Summary

Um módulo puro (`rules/maneuvers.mjs`) com o teste oposto (vencedor e raises), a geometria do cone de 45°, a escolha dos
acertados pela rajada de supressão, o TN do Pinning e as regras do grapple (opções, distância do empurrão, o que cada
lado pode fazer) e das restrições de Pinned/Grappled. Três serviços: `zone-service` (cone como MeasuredTemplate com o
registro da zona, cartões de Pinning, rajada no início do turno do atirador, Overwatch), `maneuver-service` (teste
oposto em cartão, Bull Rush/Knock Down/Disarm/Feint, grapple completo) e extensões do `turn-service` (Delay, recusas por
condição, fim do Overwatch, testes de saída do Pinned no fim do turno). A condição Em cobertura grava o AP e os locais no
flag de cobertura do token que o dano da 008 já lê.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (MeasuredTemplateDocument cone, Combat hooks da 008, ChatMessage flags +
CHAT_ACTIONS, DialogV2, statusEffects); Vitest, ESLint

**Storage**: flags — `MeasuredTemplate.flags.dtd40k.zone` (tipo, atirador, arma, ataque, gatilho, alvos testados,
validade); `Combatant.flags.dtd40k.delay`; efeitos Grappling/Grappled com `flags.dtd40k.grapple.partner`;
`Token.flags.dtd40k.cover` (já existe, 008) preenchido pela condição Em cobertura

**Testing**: Vitest (`rules/maneuvers.mjs`, `rules/turn.mjs` estendido); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: detecção de tokens num cone com dezenas de tokens sem atraso perceptível

**Constraints**: regras puras sem Foundry; texto próprio; ações existentes da 008 inalteradas fora das nove tocadas;
munição fora

**Scale/Scope**: 1 módulo puro, 2 serviços novos, extensões em turn-service, combat-actions, attack-service, config
(condições), cartões e i18n; ~16 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Pp. 426–433, 443–444 e feats; texto vence a tabela (como na 008); 32 issues resolvidas | ✅ |
| II. Nativo v13 | MeasuredTemplate cone nativo (o jogador ajusta com as ferramentas do Foundry), condições, cartões | ✅ |
| III. Pura e testada | `maneuvers.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Recusas com liberação do Mestre; movimento do Pinned e gatilho do Overwatch como texto | ✅ |
| V. Conteúdo como dados | Ações na tabela `COMBAT_ACTIONS`; opções do grapple como constantes | ✅ |
| VI. Incremental | Estende a 008 sem mudar as demais ações | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Bull Rush, Knock Down, Disarm e Feint mudam de "teste contra TN 15" para teste
oposto quando há alvo (decisão do usuário); sem alvo continuam como hoje.

## Project Structure

```text
specs/017-combat-actions/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
module/config.mjs                        # condições grappling e inCover; opções do grapple; AP de cobertura
module/rules/maneuvers.mjs               # NOVO, PURO: opposedResult, inCone, suppressionHits, pinningTn, pinningImmune,
                                         #   grappleOptions, pushDistance, restriction (Pinned/Grappled)
module/rules/combat-actions.mjs          # ações do grapple (controle, Break Free, Slip Free, Take Control); automação
module/rules/turn.mjs                    # Delay (guardar/usar fora do turno)
module/documents/zone-service.mjs        # NOVO: cone, Pinning, rajada, Overwatch, limpeza
module/documents/maneuver-service.mjs    # NOVO: teste oposto, Bull Rush/Knock Down/Disarm/Feint, grapple
module/documents/turn-service.mjs        # recusas por condição, Delay, fim do Overwatch, saída do Pinned, rajada no início do turno
module/documents/attack-service.mjs      # Grapple com Brawl desarmado; flag de grapple no cartão
module/documents/condition-service.mjs   # Em cobertura: AP e locais no flag do token
dtd40k.mjs                               # CHAT_ACTIONS; limpeza das zonas no fim do combate; hook da condição Em cobertura
templates/chat/zone-card.hbs, pinning-card.hbs, suppression-card.hbs, opposed-card.hbs, grapple-card.hbs
styles/dtd40k.css · lang/*.json
tests/unit/maneuvers.test.mjs (NOVO), turn.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Cone nativo + botão "Confirmar zona" (R2) | O jogador ajusta direção e tamanho com as ferramentas do Foundry | Uma ferramenta de colocação própria duplicaria o layer de templates |
| Dois lados rolados de uma vez no teste oposto (R1) | Um cartão, sem esperar o outro jogador | Esperar o defensor exigiria estado pendente e socket |

# Implementation Plan: Perigos e XP de encontro (DtD 7.7a)

**Branch**: `018-hazards-xp` | **Date**: 2026-09-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/018-hazards-xp/spec.md`

## Summary

Um módulo puro (`rules/hazards.mjs`) com a queda (categoria, degrau do Catfall, ferimentos, redução por Acrobatics), o
fôlego e o estado de cada intervalo de sufocamento, o TN e a distância da marcha forçada, as imunidades pelas fontes
conhecidas e a tabela de XP de encontro. O dano da 008 ganha dois modos no campo `resolve` que já existe (spec 010):
`direct` (os ferimentos são o total, sem cobertura, armadura nem Resilience) e `extraCritical` (Critical Damage somado
independente do HP). Um serviço (`hazard-service`) com a ferramenta do Mestre (botão nos controles de token), os cartões
de queda e de intervalo e o diálogo de XP; `addFatigue` passa a usar o máximo derivado (Sand) e a imunidade do
Promethean.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (controles de cena, DialogV2, ChatMessage flags + CHAT_ACTIONS); Vitest, ESLint

**Storage**: flags dos cartões (`flags.dtd40k.fall`, `flags.dtd40k.hazard`); log de XP da 006; nada novo nos atores

**Testing**: Vitest (`rules/hazards.mjs`, `rules/damage.mjs` estendido, `rules/healing.mjs`); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: um clique por intervalo com dezenas de personagens sem atraso perceptível

**Constraints**: regras puras sem Foundry; texto próprio; dano comum da 008 inalterado

**Scale/Scope**: 1 módulo puro, 1 serviço, 1 app (diálogo), extensões em damage, healing/condition-service, config;
~12 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Pp. 434, 436, 443–445, 514–515 e fontes de imunidade; 18 issues resolvidas | ✅ |
| II. Nativo v13 | Controles de cena, cartões, log de XP existente | ✅ |
| III. Pura e testada | `hazards.mjs` com os casos do contrato; `resolveDamage` com os modos novos | ✅ |
| IV. Automação pragmática | Mestre escolhe a categoria e ajusta imunes; desmaio só informado | ✅ |
| V. Conteúdo como dados | Tabela de XP e fontes de imunidade como constantes | ✅ |
| VI. Incremental | Modos novos só nos cartões de perigo; Fatigue corrigida para o máximo já derivado | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Mudança fora dos perigos: `addFatigue` passa a usar `system.fatigue.max`
(Constitution + Sand), corrigindo a 008, e ignora Fatigue do Promethean.

## Project Structure

```text
specs/018-hazards-xp/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
module/config.mjs                        # ENCOUNTER_XP, SESSION_XP, FALL, fontes de imunidade
module/rules/hazards.mjs                 # NOVO, PURO: fallCategory, fallWounds, fallReduction, breathLimit,
                                         #   suffocationStep, marchTn, marchDistance, hazardImmunity
module/rules/damage.mjs                  # resolveDamage: direct, extraCritical
module/rules/healing.mjs                 # fatigueCheck com o máximo (Sand)
module/documents/condition-service.mjs   # addFatigue: máximo derivado, imunidade do Promethean
module/documents/hazard-service.mjs      # NOVO: queda, sufocamento, marcha, XP
module/apps/hazard-dialog.mjs            # NOVO: ferramenta do Mestre (perigo, parâmetros, imunes) e diálogo de XP
dtd40k.mjs                               # controles de token (Mestre), CHAT_ACTIONS
templates/chat/fall-card.hbs, hazard-card.hbs · templates/apps/hazard-dialog.hbs, xp-dialog.hbs
styles/dtd40k.css · lang/*.json
tests/unit/hazards.test.mjs (NOVO), damage.test.mjs, healing (em combat/derived tests)
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Modos no `resolve` do cartão de dano (R2) | Reusa o Aplicar, o desfazer e os críticos da 008 | Um aplicador próprio duplicaria críticos, desfazer e o pedido ao Mestre |

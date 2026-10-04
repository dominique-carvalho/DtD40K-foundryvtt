# Implementation Plan: Traits, ataques especiais, esquadrões, feats e formas de NPC

**Branch**: `022-npc-traits` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/022-npc-traits/spec.md`

## Summary

Um módulo puro de traits de NPC (velocidades por ação, escuridão, distância 3D, incorpóreo, ações de esquadrão,
resolução de abilities e aplicação de formas) alimenta:
- o modelo do NPC (abilities estruturadas, formas, forma ativa);
- uma classe própria de token que deriva visão, ação de movimento e custo de terreno dos traits, mais a ação de
  movimento `phase` sem bloqueio de parede;
- os serviços de ataque, dano e turno (escuridão, aviso de alcance, Auto-Stabilized, incorpóreo, queda de quem voa,
  ações do esquadrão);
- um serviço de abilities (área com template, auras disparadas, efeito no acerto, magia);
- um serviço de formas e recurso;
- a aba Antagonista com editores.

Os packs ganham as 6 abilities convertidas, Dragon Breath como arma e as formas do Zoanoid e do Elemental.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; Handlebars; CSS (tokens da 021)

**Primary Dependencies**: Foundry VTT v13 (TokenDocument/Token, `CONFIG.Token.movement.actions`, MeasuredTemplate,
ActiveEffect, Combat); Vitest, ESLint

**Storage**: `system.npc.abilities[]` estendido; `system.npc.forms[]`, `system.npc.activeForm`, `system.npc.formRounds`;
status `incorporeal`; flags de item `dtd40k.form`, `dtd40k.onHit`

**Testing**: Vitest (`rules/npc-traits.mjs`, extensões de `rules/npc.mjs`, `rules/defense.mjs`, `packs.test.mjs`);
roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: derivação do token sem custo perceptível ao mover ou atualizar o ator

**Constraints**:
- regras puras sem Foundry;
- nenhum valor impresso muda;
- nada gravado no token;
- dados de NPC antigos continuam válidos (campos novos com padrão).

**Scale/Scope**:
- 1 módulo puro novo;
- 2 classes de documento/objeto (token);
- 3 serviços novos (ability, form, minion turn), além de extensões em attack, damage, turn, condition, npc e hazard;
- editores na aba Antagonista;
- cerca de 10 NPCs alterados nos packs.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | pp. 520–544, 433; valores impressos preservados (R1); premissas registradas (magia em incorpóreo, duração do Warform, alcance 10×TR) | ✅ |
| II. Nativo v13 | `CONFIG.Token.documentClass/objectClass`, movement actions, MeasuredTemplate, ActiveEffect hooks | ✅ |
| III. Pura e testada | `npc-traits.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Recusas com liberação do Mestre; queda oferecida, não forçada; alcance 3D só avisa | ✅ |
| V. Conteúdo como dados | Abilities e formas como dados nos packs, texto próprio | ✅ |
| VI. Incremental | Campos novos com padrão; sem migração de atores; tokens derivados | ✅ |
| Restrições | ESM + JSDoc, i18n pt-BR/en, design system 021 | ✅ |

**Re-check pós-design**: todos se mantêm. Risco principal: sobrescrever métodos protegidos do token
(`_inferMovementAction`, `_prepareDetectionModes`, `_getMovementCostFunction`), que podem mudar em versões futuras;
fica isolado em uma classe com testes manuais no quickstart.

## Project Structure

```text
specs/022-npc-traits/ (plan, research, data-model, quickstart, contracts/, checklists/, inventory.json, tasks)
module/rules/npc-traits.mjs              # NOVO, PURO: npcSpeeds, darknessModifier, distance3d, incorporealBlocks,
                                         #   minionActionCost, abilityOutcome, applyForm, flyingFall
module/rules/defense.mjs                 # situationModifiers: darkness
module/rules/feat.mjs                    # npcFeatNames / hasFeat por nome (itens + npc.feats)
module/data/npc-data.mjs                 # abilities estruturadas, forms, activeForm; forma ativa no derivado; speeds
module/documents/token-document.mjs      # NOVO: DtdTokenDocument (movimento, visão, reset)
module/canvas/token.mjs                  # NOVO: DtdToken (custo de terreno do Crawler)
module/documents/ability-service.mjs     # NOVO: área, aura, onHit, spell; cartão e resistência
module/documents/form-service.mjs        # NOVO: trocar forma, duração, recurso
module/documents/attack-service.mjs      # escuridão, aviso de alcance 3D, Auto-Stabilized, onHit
module/documents/damage-service.mjs      # incorpóreo
module/documents/turn-service.mjs        # Auto-Stabilized meia ação; gatilhos charge/allOut/turnStart; esquadrão
module/documents/minion-service.mjs      # ações do esquadrão no turno; Dodge/Parry
module/documents/condition-service.mjs   # status incorporeal; queda de quem voa
module/documents/npc-service.mjs         # recurso gastar/recuperar
module/config.mjs                        # status incorporeal, ação phase, tipos de ability
dtd40k.mjs                               # classes de token, ação phase, hooks
module/apps/npc-sheet.mjs · npc-context.mjs · minion-sheet.mjs
templates/actor/parts/npc.hbs · npc-header.hbs · minion-sheet.hbs · chat/ability-card.hbs · chat/flight-fall.hbs
src/packs/antagonists/*.json             # 6 abilities, Dragon Breath, formas (Zoanoid ×2, Elemental)
styles/dtd40k.css · lang/*.json · tests/unit/npc-traits.test.mjs (NOVO), packs.test.mjs, defense.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Classes próprias de token (R3) | Única forma de derivar visão e movimento sem gravar nem migrar; cobre arrastar, teclado e script | Gravar no token exige sincronia; Active Effects não alcançam o token |
| Ação de movimento `phase` (R3) | O núcleo já ignora paredes quando `walls` é nulo; `displace` não é selecionável | Sobrescrever `constrainMovementPath` é mais invasivo |

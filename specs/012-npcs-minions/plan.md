# Implementation Plan: NPCs e Minions (DtD 7.7a)

**Branch**: `012-npcs-minions` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-npcs-minions/spec.md`

## Summary

Tipo de ator `npc` que herda o modelo do personagem, com os valores do bloco como overrides dos derivados, armas do
bloco embutidas (dano já com Força, sempre proficiente), armadura e traits do livro somados à armadura e à Aura, e os
traits simples ligados aos pontos existentes (condições, turno, ataque, social, medo, magia). Tipo `minionSquad` com
regras puras de parada, dano, baixas e aliados, ataque pelo cartão de dano da 008 e baixas no Aplicar. Compêndio
`antagonists` com as 47 fichas e as 4 squads gerado do inventário.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActorSheetV2, Combat, ActiveEffect); Vitest, ESLint,
`@foundryvtt/foundryvtt-cli`

**Storage**: `system.npc` e `derivedMods` no ator `npc`; `system` do `minionSquad`; pack `packs/antagonists` de
`src/packs/antagonists`

**Testing**: Vitest (`rules/npc.mjs`, `rules/minions.mjs`, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: abrir um NPC e atacar em < 1 s

**Constraints**: regras puras sem Foundry; texto próprio; reuso de 001/007/008/009

**Scale/Scope**: 2 tipos de ator, 51 documentos, 2 módulos puros, 2 serviços, 2 fichas; ~30 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 520–544); erros do livro como edge cases; valores do bloco como impressos | ✅ |
| II. Nativo v13 | Tipos de Actor, ActorSheetV2, compêndio de Actors com itens embutidos | ✅ |
| III. Pura e testada | `npc.mjs`, `minions.mjs` com os casos do contrato; packs testados | ✅ |
| IV. Automação pragmática | Traits complexos como texto; valores do livro sem recálculo; override do Mestre | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; texto próprio com 6-gramas = 0 | ✅ |
| VI. Incremental | Fase 1 (antagonistas); Special Attacks de NPC fora | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos; toca 007 (dano sem Força, proficiência, flags de raises/Blast), 008 (Aplicar,
condições, turno, social, medo) e 009 (magia de NPC) de forma aditiva, abrindo `npc` onde hoje só há `character`.

## Project Structure

```text
specs/012-npcs-minions/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/antagonists/                      # 11 pastas + 51 JSON (NPCs com armas embutidas)
scripts/assign-pack-ids.mjs                 # layout antagonists (Actors com itens embutidos)
module/config.mjs                           # NPC_CATEGORIES, NPC_TRAITS, MINION
module/rules/npc.mjs, minions.mjs           # NOVOS, PUROS
module/data/npc-data.mjs, minion-squad-data.mjs   # NOVOS
module/documents/npc-service.mjs, minion-service.mjs   # NOVOS
module/documents/actor.mjs, attack-service.mjs, damage-service.mjs, condition-service.mjs, turn-service.mjs,
  combat.mjs, social-service.mjs, magic-service.mjs, equipment-service.mjs
module/apps/npc-sheet.mjs, minion-sheet.mjs, npc-context.mjs    # NOVOS
templates/actor/npc-*.hbs, templates/actor/minion-sheet.hbs, templates/chat/minion-attack.hbs, templates/chat/npc-fear.hbs
styles/dtd40k.css · lang/*.json
tests/unit/npc.test.mjs, minions.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| `NpcData` herda `CharacterData` (R1) | Rolagem, ataque, dano, condições, turno e magia sem duplicar | Modelo próprio reimplementaria tudo |
| Valores do bloco como override | O livro já soma traits e feats nos números | Recalcular divergiria do livro em vários blocos |
| Squad como tipo próprio (R5) | Sem HP, parada e baixas diferentes | Um NPC com regras especiais misturaria dois modelos |

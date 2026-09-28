# Implementation Plan: Criação guiada (DtD 7.7a)

**Branch**: `016-guided-creation` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/016-guided-creation/spec.md`

## Summary

Um módulo puro (`rules/creation.mjs`) calcula, a partir das notas guardadas (`_source`, sem os bônus de raça e
exaltação, que são efeitos) e do log de XP da 006, os pontos de criação gastos por grupo, as prioridades deduzidas
(6/4/2 e 8/6/4), os limites da etapa (4/3), os máximos por personagem (5, ou 6 pelas exceções), o XP da criação, as
especialidades pendentes/excedentes e o checklist. Um painel na ficha mostra tudo enquanto `system.creation.active`
estiver ligado. As recusas usam o padrão da 006 (aviso; o Mestre confirma e passa): pontos no modo de edição, compras
de XP acima do máximo, Hindrance além de 2, Assets/Hindrances fora da criação e classe de nível acima de 1 na criação.
O botão de encerrar a criação vai para o painel, com confirmação quando há pendências.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (ActorSheetV2 + HandlebarsApplicationMixin, DialogV2); Vitest, ESLint

**Storage**: nada novo — tudo derivado de `_source` (notas, especialidades), `system.xp.log`, itens (raça, exaltação,
classe, feats, divindade) e `system.creation.active`

**Testing**: Vitest (`rules/creation.mjs` com o personagem de exemplo das pp. 18–19; ajustes em `xp`, `class`,
`race`); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: painel recalculado a cada render da ficha sem atraso perceptível (< 10 ms)

**Constraints**: regras puras sem Foundry; texto próprio; nenhum dado novo guardado; personagens em jogo não mudam
(o máximo 5 só recusa novas subidas)

**Scale/Scope**: 1 módulo puro, 1 serviço, 1 contexto + 1 template de painel; ajustes em 6 arquivos (ficha, modelo do
personagem, config, xp-service, feat/asset-service, class-service); ~14 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 12–19, 22–24, 30, 179, exceções pp. 68/76/84/213); exemplo do livro como teste; 14 issues resolvidas | ✅ |
| II. Nativo v13 | Ficha da 001, DialogV2, flags e log existentes | ✅ |
| III. Pura e testada | `creation.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Recusa com liberação do Mestre; sobras só avisam; idiomas como lembrete | ✅ |
| V. Conteúdo como dados | Orçamentos e exceções como constantes; exceções pelos nomes dos itens dos packs | ✅ |
| VI. Incremental | Nada guardado; painel só com a criação ativa; notas existentes preservadas | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. O único efeito em personagens já em jogo é o máximo 5 nas novas subidas (FR-005,
decisão do usuário); notas já acima ficam como estão.

## Project Structure

```text
specs/016-guided-creation/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
module/config.mjs                        # CREATION (orçamentos, limites), RATING_MAX 5 / RATING_EXCEPTION_MAX 6, exceções
module/rules/creation.mjs                # NOVO, PURO: creationSpend, assignPriorities, checkDots, ratingCaps, canReach,
                                         #   specialtyCheck, creationXp, languagesHint, creationChecklist
module/rules/race.mjs                    # capValue com máximo por personagem
module/rules/class.mjs                   # checkClassEntry: classe de nível > 1 na criação
module/data/character-data.mjs           # ratingCaps derivado; #capRatings pelo máximo do personagem
module/documents/creation-service.mjs    # NOVO: recusa de pontos (modo de edição), encerrar com confirmação
module/documents/xp-service.mjs          # advance: máximo do personagem em vez de MAX_RATING
module/documents/feat-service.mjs        # Hindrance além de 2; Assets/Hindrances fora da criação
module/documents/asset-service.mjs       # Exalted Assets fora da criação (Paragon isento, como hoje)
module/documents/class-service.mjs       # passa a criação ao checkClassEntry
module/apps/creation-context.mjs         # NOVO: contexto do painel
module/apps/character-sheet.mjs          # parte do painel, setDots pela creation-service, endCreation no painel
templates/actor/parts/creation.hbs       # NOVO
templates/actor/parts/equipment.hbs      # botão de encerrar sai daqui
styles/dtd40k.css · lang/*.json
tests/unit/creation.test.mjs (NOVO), race.test.mjs, class.test.mjs, xp.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Prioridades deduzidas dos gastos (R3) | Sem campo novo (decisão do usuário) e sem passo extra para o jogador | Escolher a ordem exigiria guardar e manter a escolha |
| Exceções pelo nome do item (R5) | Os packs têm nomes estáveis; nenhuma exceção tem automação hoje | Um campo de automação novo em exaltações/feats só para isso |

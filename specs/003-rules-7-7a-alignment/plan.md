# Implementation Plan: Ajuste da fundação (001) às regras da DtD 7.7a

**Branch**: `003-rules-7-7a-alignment` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-rules-7-7a-alignment/spec.md`

## Summary

Alinhar a feature 001 à DtD 7.7a: Acrobatics Básica e Athletics com Strength (configuração pura),
stunt dice como +XkX (`applyModifiers`), sugestões de TN com os 10 degraus da 7.7a no diálogo
(`TN_LADDER` + `<datalist>`), Fatigue atual/máxima na ficha (novo campo + derivado `fatigueMax`)
e iniciativa social no rodapé. Mudanças pequenas, localizadas nos módulos puros já testados e nos
templates existentes; sem migração de dados.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; sem build

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActorSheetV2, DialogV2); dev: Vitest, ESLint

**Storage**: Actor `system` via TypeDataModel; novo campo `fatigue.value` com valor inicial (sem migração)

**Testing**: Vitest para `module/config.mjs` e `module/rules/**`; roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system (pacote Foundry) — projeto único

**Performance Goals**: sem mudança (ficha e rolagem < 1 s)

**Constraints**: manter compatibilidade da API de rolagem da 001 (`stuntDice` continua como chave);
i18n pt-BR/en; temas claro e escuro do v13

**Scale/Scope**: ~8 arquivos de código/template, ~10 novas chaves i18n, ~10 casos de teste

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade às Regras (7.7a) | Cada mudança cita a página da 7.7a; Medicae decidida pelo comparativo §1 | ✅ |
| II. Arquitetura Nativa (v13) | Só TypeDataModel, ActorSheetV2, DialogV2 e `<datalist>` HTML padrão | ✅ |
| III. Lógica Pura e Testada | Stunt, `fatigueMax`, `TN_LADDER` e perícias em módulos puros com testes | ✅ |
| IV. Automação com Controle do Mestre | `fatigueMax` entra em `DERIVED_KEYS` (bônus/override); penalidades de Fatigue manuais | ✅ |
| V. Conteúdo como Dados | Sem compêndios | ✅ (N/A) |
| VI. Entrega Incremental | Feature pequena, utilizável sozinha, dentro da Fase 1 | ✅ |
| Restrições técnicas / fluxo | JS ESM, i18n `DTD.*`, branch própria, Conventional Commits | ✅ |

**Re-check pós-design**: sem violações; nenhuma complexidade extra.

## Project Structure

### Documentation (this feature)

```text
specs/003-rules-7-7a-alignment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── changes.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (arquivos tocados)

```text
module/config.mjs                         # SKILLS (acrobatics, athletics), DERIVED_KEYS + fatigueMax, TN_LADDER
module/rules/pool.mjs                     # applyModifiers: stunt +XkX
module/rules/derived.mjs                  # computeDerived: fatigueMax
module/data/character-data.mjs            # fatigue.value; fatigue.max derivado
module/apps/character-sheet.mjs           # contexto: fatigue, socialInitiativeBonus, linha fatigueMax
module/apps/roll-dialog.mjs               # contexto: TN_LADDER localizado
templates/actor/parts/header.hbs          # caixa Fatigue
templates/actor/parts/footer.hbs          # iniciativa social
templates/dialog/roll-dialog.hbs          # datalist de TN; rótulo de stunt
lang/en.json, lang/pt-BR.json             # novas chaves
tests/unit/config.test.mjs, pool.test.mjs, derived.test.mjs, test.test.mjs
specs/001-system-foundation/*.md          # citações 7.7a nas regras alteradas
```

**Structure Decision**: mesma estrutura da 001; nenhuma pasta nova.

## Complexity Tracking

Nenhuma violação.

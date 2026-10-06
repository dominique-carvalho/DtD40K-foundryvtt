# Implementation Plan: Descrições no montador de personagem

**Branch**: `026-builder-descriptions` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/026-builder-descriptions/spec.md`

## Summary

O assistente da 023 ganha textos curtos em cada opção, derivados dos compêndios:
- Um módulo puro novo (`module/rules/descriptions.mjs`) reduz as descrições e monta os fatos de cada opção:
  - linha curta;
  - primeiro parágrafo;
  - fatos de raça, exaltação, feat, classe e item.
- O `#stepView` monta linhas para as listas e um painel para a opção selecionada nos cartões.
- Os seletores de compra e de equipamento mostram a linha do item escolhido.
- Os 11 backgrounds recebem textos novos em i18n.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; Handlebars; CSS (tokens da 021)

**Primary Dependencies**: assistente da 023 (`character-builder.mjs`, `templates/apps/builder/step.hbs`, `builder.css`);
documentos dos compêndios já carregados pelo assistente; Vitest, ESLint

**Storage**: nenhum (derivado); i18n novo (`DTD.Background.*.hint`, `DTD.Builder.Fact.*`)

**Testing**: Vitest (`descriptions.test.mjs`, com dados reais dos packs: Tiefling, Werewolf, Enemy, Monk, Autopistol);
roteiro em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: sem atraso perceptível na troca de passo (as funções são baratas; documentos já em memória)

**Constraints**:
- não mudar os compêndios;
- não re-renderizar a janela ao mudar um seletor, para não perder o foco (023);
- textos fixos em pt-BR e en.

**Scale/Scope**:
- 1 módulo puro;
- `#stepView` em 9 passos;
- `step.hbs`, `builder.css`;
- ~25 chaves i18n (11 backgrounds e os rótulos dos fatos).

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Textos dos backgrounds resumem pp. 280–283; fatos vêm dos dados já fiéis | ✅ |
| II. Nativo v13 | ApplicationV2 existente; sem APIs novas | ✅ |
| III. Pura e testada | `descriptions.mjs` sem Foundry, com testes sobre dados reais | ✅ |
| IV. Automação pragmática | Só informação; nenhuma regra nova | ✅ |
| V. Conteúdo como dados | Usa as descrições resumidas dos compêndios; textos novos com redação própria | ✅ |
| VI. Incremental | Melhoria isolada do assistente | ✅ |
| Restrições | i18n pt-BR/en, design system 021 | ✅ |

**Re-check pós-design**: todos se mantêm.

## Project Structure

### Documentation (this feature)

```text
specs/026-builder-descriptions/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/descriptions.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
module/rules/descriptions.mjs          # puro
module/apps/character-builder.mjs      # #stepView: desc/facts/detail; _onRender: linha dos seletores
templates/apps/builder/step.hbs        # linhas, painel, data-desc
styles/builder.css                     # .builder-desc, .builder-facts, .builder-detail
lang/{en,pt-BR}.json                   # backgrounds e rótulos
tests/unit/descriptions.test.mjs
```

**Structure Decision**: a lógica de texto fica numa regra pura nova. O app só monta o contexto e traduz os rótulos.

## Complexity Tracking

Sem violações da constituição.

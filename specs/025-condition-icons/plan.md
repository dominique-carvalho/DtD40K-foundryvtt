# Implementation Plan: Ícones das condições e dos efeitos (Scriptorium Machina)

**Branch**: `025-condition-icons` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/025-condition-icons/spec.md`

## Summary

O pipeline da 024 ganha um segundo formato, o selo redondo:
- `src/icons/conditions.json` lista os 30 selos de condição e os 4 de efeito, com grupo de gravidade e glifo.
- O `build-icons` gera os selos e grava o ícone do item nos efeitos dos itens dos packs.

No sistema:
- `STATUS_EFFECTS` e os serviços (degeneração, escolas marciais, Barrel Roll) usam os selos.
- O menu "Atualizar ícones" passa a trocar também os efeitos do mundo que ainda têm imagem do Foundry.

## Technical Context

**Language/Version**: JavaScript ESM (Node 24 nos scripts; ES2022 no sistema) com JSDoc; SVG

**Primary Dependencies**: pipeline da 024 (`scripts/lib/icons.mjs`, `build-icons`, `fetch-glyphs`); Foundry VTT v13
(`CONFIG.statusEffects`, `specialStatusEffects`, Active Effects, settings menu da 024); Vitest, ESLint

**Storage**: `src/icons/conditions.json`, glifos em `src/icons/glyphs`, selos em `assets/icons/{conditions,effects}`;
`img` dos efeitos em `src/packs`; `flags.dtd40k.effectIcon` nos efeitos novos

**Testing**: Vitest (`composeSeal`, `conditions.json` × `STATUS_EFFECTS`, varredura dos efeitos dos packs,
`planIconUpdates` com efeitos); roteiro em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: sem custo perceptível; o menu monta o plano sem carregar documentos além dos da 024

**Constraints**:
- só cores de `tokens.css`;
- `build:icons` offline e idempotente;
- zip da release ≤ 2,5 MB.

**Scale/Scope**:
- 34 selos e 15 efeitos de itens dos packs;
- 1 função de composição, 1 extensão da regra de atualização;
- 3 serviços, `config.mjs`, menu, i18n, testes, docs.

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Não muda regras; os glifos seguem o que cada condição é (pp. 442–444) | ✅ |
| II. Nativo v13 | `CONFIG.statusEffects`, `specialStatusEffects`, Active Effects, settings menu | ✅ |
| III. Pura e testada | `composeSeal` e `planIconUpdates` sem Foundry, com testes | ✅ |
| IV. Automação pragmática | Atualização só pelo Mestre, com confirmação; imagens personalizadas preservadas | ✅ |
| V. Conteúdo como dados | Selos em JSON versionado; packs compilados de `src/packs` | ✅ |
| VI. Incremental | Entrega independente sobre a 024 | ✅ |
| Restrições | ESM + JSDoc, i18n pt-BR/en, sem build obrigatório para rodar | ✅ |

**Re-check pós-design**: todos se mantêm.

## Project Structure

### Documentation (this feature)

```text
specs/025-condition-icons/
├── plan.md, research.md, data-model.md, quickstart.md
├── contracts/icons.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
src/icons/conditions.json                 # selos: grupos, condições e efeitos
assets/icons/conditions/*.svg, assets/icons/effects/*.svg   # gerados
scripts/lib/icons.mjs                     # + composeSeal
scripts/build-icons.mjs                   # + selos, efeitos dos itens dos packs
module/config.mjs                         # STATUS_EFFECTS com selos; ICONS.effect
module/rules/icons.mjs                    # planIconUpdates com efeitos
module/apps/update-icons.mjs              # coleta de efeitos
module/documents/{alignment,martial,vehicle}-service.mjs
tests/unit/icons.test.mjs, tests/unit/icons-update.test.mjs
lang/{en,pt-BR}.json, README.md, docs/pendencias.md
```

**Structure Decision**: estende o pipeline e a regra pura da 024. A integração com o Foundry fica restrita a `config.mjs`, aos 3 serviços e ao menu.

## Complexity Tracking

Sem violações da constituição.

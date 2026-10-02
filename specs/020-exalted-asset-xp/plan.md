# Implementation Plan: Custo de XP dos Exalted Assets (DtD 7.7a)

**Branch**: `020-exalted-asset-xp` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/020-exalted-asset-xp/spec.md`

## Summary

O `addExaltedAsset` da 004 passa a cobrar 100 XP (o `XP_COSTS.asset` da 006) depois das checagens que já faz: uma
função pura decide o preço (grátis quando concedido pela Perfection; recusa sem XP), o serviço de XP ganha um
`priceExaltedAsset` com a confirmação e a liberação do Mestre sem custo, e a compra entra no log com o tipo
`exaltedAsset` e o item vinculado. O desfazer da 006 apaga o asset (e ajusta os Hero Points, como a remoção pela
ficha) e devolve o XP.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (serviços de asset e XP existentes); Vitest, ESLint

**Storage**: linha do log `system.xp.log` com `kind: "exaltedAsset"`, `cost`, `itemId` — sem campo novo

**Testing**: Vitest (`rules/xp.mjs`); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: n/a

**Constraints**: regra pura sem Foundry; personagens existentes sem mudança; feats e assets comuns sem mudança

**Scale/Scope**: 1 função pura, extensões em xp-service, asset-service e i18n; ~5 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | p. 16 (Buy an Asset 100), p. 18 (exemplo), p. 83 (Perfection), p. 179 | ✅ |
| II. Nativo v13 | DialogV2 e log de XP existentes | ✅ |
| III. Pura e testada | `exaltedAssetPrice` em `rules/xp.mjs` com os casos do contrato | ✅ |
| IV. Automação pragmática | Recusa sem XP com liberação do Mestre sem custo | ✅ |
| V. Conteúdo como dados | Preço do `XP_COSTS`; nada muda nos packs | ✅ |
| VI. Incremental | Só compras novas; nada retroativo | ✅ |
| Restrições | ESM + JSDoc, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Mudança visível: arrastar um Exalted Asset passa a pedir confirmação e gastar XP.

## Project Structure

```text
specs/020-exalted-asset-xp/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
module/rules/xp.mjs                     # exaltedAssetPrice (PURO); undoPlan aceita "exaltedAsset"
module/documents/xp-service.mjs         # priceExaltedAsset (confirmação, recusa, liberação); undo ajusta Hero Points
module/documents/asset-service.mjs      # addExaltedAsset cobra e registra no log
lang/en.json · lang/pt-BR.json
tests/unit/xp.test.mjs                  # casos novos
docs/pendencias.md · README.md
```

## Complexity Tracking

Sem violações.

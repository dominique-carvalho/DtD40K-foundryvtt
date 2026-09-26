# Implementation Plan: Classes e compra de XP (DtD 7.7a)

**Branch**: `006-classes-xp` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-classes-xp/spec.md`

## Summary

Adicionar o tipo de Item `class` com ficha própria e o compêndio `classes` (103 classes em 19 pastas, gerado do
inventário do cap. 6 com descrições em redação própria). No personagem: iniciar classe com checagem pura de
Level e pré-requisitos, progresso calculado dos feats obrigatórios (com grupos "A ou B"), conclusão automática
(sincronizada no `DtdItem#_onCreate` de feats, como as concessões da 005), bônus de conclusão como Active Effects
e concessões da 005, e Level derivado da classe mais alta. XP: `xp.starting` + histórico no ator, totais
derivados, modo de avanço na ficha com custos e elegibilidade puros (listas da classe, Free Study ×2), cobrança
de feats/assets arrastados e desfazer.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, Active Effects, `_onCreate`/`_onDelete`, ItemSheetV2,
ActorSheetV2 `TABS`, DialogV2); Vitest, ESLint, `@foundryvtt/foundryvtt-cli`

**Storage**: Item `class` embutido (estado `status`); `system.xp` no ator; pack `packs/classes` de `src/packs/classes`

**Testing**: Vitest (`rules/class.mjs`, `rules/xp.mjs`, config, packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system — projeto único

**Performance Goals**: comprar um avanço e ver o saldo em < 1 s; ficha com ~10 classes e ~100 entradas de
histórico abre em < 1 s

**Constraints**: regras puras sem Foundry; nenhum input grava valor com efeito no `_source`; compras gravam o
valor **base** (`_source`) + 1; reações de documento só no cliente do autor

**Scale/Scope**: 1 tipo de item, 103 entradas + 19 pastas, 2 módulos puros, 2 serviços, 1 modo e 1 aba novos na
ficha; ~25 arquivos

## Constitution Check

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade | Páginas da 7.7a (pp. 104–172, 15–16, 179); contradição do exemplo de Level registrada; legenda `*`/OR citada; ambiguidades como premissas | ✅ |
| II. Nativo v13 | TypeDataModel; Level e totais derivados em `prepareDerivedData`; bônus como Active Effects; ApplicationV2 | ✅ |
| III. Pura e testada | `class.mjs` e `xp.mjs` com os casos do contrato; pack testado | ✅ |
| IV. Automação pragmática | Recusas com override do Mestre; edição livre sem cobrança; bônus desligáveis; conclusão desfazível pelo Mestre | ✅ |
| V. Conteúdo como dados | JSON em `src/packs`; descrições próprias; inventário conferido no PDF | ✅ |
| VI. Incremental | Fase 1 (núcleo de personagem); escolas/magias fora de escopo (sistemas futuros) | ✅ |
| Restrições | ESM + JSDoc, CSS puro, i18n pt-BR/en | ✅ |

**Re-check pós-design**: mantém todos. Toca 004 (Power Stat pela compra), 005 (`addFeat` cobra; `grantFeats` lê
classes; `DtdItem#_onCreate` sincroniza classes) de forma aditiva.

## Project Structure

```text
specs/006-classes-xp/ (plan, research, data-model, quickstart, contracts/, checklists/, tasks)
system.json · dtd40k.mjs
src/packs/classes/                       # 19 pastas + 103 JSON
module/config.mjs                        # CLASS_COMPLETION, CLASS_STATUS, XP_COSTS, STARTING_XP, …
module/rules/class.mjs, xp.mjs           # NOVOS, PUROS
module/data/class-data.mjs               # NOVO
module/data/character-data.mjs           # xp, level derivado, classState
module/documents/class-service.mjs, xp-service.mjs   # NOVOS
module/documents/item.mjs                # _onCreate de feat → syncClassCompletion
module/documents/feat-service.mjs        # addFeat → chargeForFeat; grantFeats lê classes
module/apps/class-sheet.mjs, class-context.mjs       # NOVOS
module/apps/character-sheet.mjs          # modo advance, aba class, drop, ações
templates/item/class-sheet.hbs, templates/actor/parts/class.hbs, templates/dialog/class-bonus.hbs
templates/actor/parts/{header,characteristics,skills,exaltation}.hbs   # botões do modo avanço
styles/dtd40k.css · lang/*.json
tests/unit/class.test.mjs, xp.test.mjs, config.test.mjs, packs.test.mjs
```

## Complexity Tracking

| Escolha | Por quê | Alternativa rejeitada porque |
|---|---|---|
| Conclusão sincronizada no `_onCreate` de feats (R3) | Cobre compra, drop, concessão e o menu do core num ponto só | Checar em cada serviço deixaria caminhos de fora |
| Level derivado no `prepareDerivedData` (R2) | Uma conta simples, usada por tudo que já roda depois | Efeitos OVERRIDE por classe competiriam entre si |
| Histórico de XP no ator (R6) | Desfazer precisa de `from/to/itemId`; não polui o inventário | Itens de histórico apareceriam no drop e nas listas |
| Terceiro modo `advance` (R7) | Separa compra (cobrada) da edição livre (FR-017) | Cobrar no modo `edit` quebraria a distribuição inicial por prioridades |

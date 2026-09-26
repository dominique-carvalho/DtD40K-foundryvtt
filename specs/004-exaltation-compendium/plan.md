# Implementation Plan: Compêndio de Exaltações (DtD 7.7a)

**Branch**: `004-exaltation-compendium` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-exaltation-compendium/spec.md`

## Summary

Adicionar os tipos de Item `exaltation` e `feat` (categoria `exaltedAsset`), com fichas
ItemSheetV2, e os compêndios `exaltations` (9) e `exalted-assets` (75, em 10 pastas), com fonte JSON
em `src/packs/`, pelo mesmo build da 002. A exaltação é aplicada por arrastar e soltar, como a raça:
item embutido único, Active Effects gerados por funções puras e desativáveis pelo Mestre. Decisão
técnica central (research R2): o item guarda só o que foi **comprado e gasto** (Power Stat, pontos
gastos, gastos na rodada/cena); máximo do recurso, atual, dívida (Paradox/Resonance), Tell e poderes
liberados são calculados por `computeExaltation` (puro) no fim do `prepareDerivedData` do ator, depois
dos derivados. O contador por rodada "zera" por marcador de combate, sem escrita automática (R4).
Assets validam exaltação, raça e o limite de um (exceto Paragon) em função pura (R7).

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; sem build para rodar o sistema

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect `transfer`/`priority`,
ItemSheetV2/ActorSheetV2 + HandlebarsApplicationMixin, DialogV2, hook `updateCombat`). Dev: Vitest,
ESLint, `@foundryvtt/foundryvtt-cli` 3.x (já instalado na 002)

**Storage**: documentos do Foundry (Item `system`, ActiveEffects embutidos); compêndios LevelDB
`packs/exaltations` e `packs/exalted-assets` gerados de `src/packs/*`

**Testing**: Vitest para `module/rules/**`, `module/config.mjs` e os JSON dos packs; roteiro manual
em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system (pacote Foundry) — projeto único

**Performance Goals**: aplicar/trocar exaltação e gastar recurso em < 1 s; ficha abre em < 1 s

**Constraints**: sem jQuery nem APIs depreciadas do v13; regras sem globais do Foundry; interface
pt-BR e en; conteúdo em inglês com redação própria; nenhum input grava valor com efeito no `_source`
(002 R3); nenhuma escrita automática por evento de combate

**Scale/Scope**: 2 tipos de item, 84 entradas + 10 pastas de compêndio, 2 fichas de item, 1 diálogo
de escolha, 1 cartão novo na aba Traits, ~9 efeitos distintos; ~30 arquivos novos/alterados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade às Regras | Tabelas de referência com páginas da 7.7a (pp. 65–100, 179, 211–223); ambiguidades do livro registradas como premissas da spec e em research R10; texto completo vence o resumo tabular, como o livro manda | ✅ |
| II. Arquitetura Nativa (v13) | TypeDataModel para `exaltation`/`feat`; estado calculado em `prepareDerivedData` e nunca persistido (R2); ItemSheetV2/DialogV2; modificadores como Active Effects (R5/R6); ordem de preparo e prioridade de efeitos conferidas no 13.351 | ✅ |
| III. Lógica Pura e Testada | `rules/exaltation.mjs`, `rules/asset.mjs` e alteração de `derived.mjs` puros, com os exemplos numéricos da spec em contracts/rules-api.md; packs validados por teste | ✅ |
| IV. Automação Pragmática | Só fórmulas, tetos, contadores e 12 efeitos numéricos simples; gastos, rolagens e poderes complexos ficam como texto/botões; todo efeito desativável; recusas de asset podem ser confirmadas pelo Mestre; override do Mestre vence | ✅ |
| V. Conteúdo como Dados | Fonte JSON em `src/packs/`, compilada pelo CLI; descrições com redação própria; tabelas conferidas no PDF (ordem dos poderes rechecada na implementação) | ✅ |
| VI. Entrega Incremental | Feature da Fase 1 (cap. 5 da 7.7a); US1 (compêndio) utilizável sozinha; feats/assets gerais, magia e combate fora de escopo; `feat` com uma única categoria (YAGNI) mas reaproveitável (R1). **Pendência**: o texto do princípio VI ainda cita "exaltações" do Book 2 na Fase 2 — Wraith e Dragonblooded estão no cap. 5 da 7.7a; propor emenda PATCH via `/speckit-constitution` (como na adoção da 7.7a para as raças) antes do merge | ⚠️ justificado |
| Restrições técnicas | JS ESM + JSDoc, CSS puro, i18n `DTD.*` pt-BR/en, ids em inglês, nomes do livro (`feralHeart` → dado, `bloodOfIo`, `warboss`) | ✅ |

**Re-check pós-design (Phase 1)**: data-model, contratos e quickstart mantêm todos os itens. A única
alteração em código da 002 é pontual (`race-service.mjs` chama `syncPerfection`; `derived.mjs` ganha
2 modificadores; `DtdItem#_preCreate` ganha a regra da exaltação única). Conflitos esperados com a
branch paralela `003-rules-7-7a-alignment` só em `lang/*.json`, `styles/dtd40k.css` e, se ela mexer
em derivados, `derived.mjs`.

## Project Structure

### Documentation (this feature)

```text
specs/004-exaltation-compendium/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── rules-api.md     # exaltation.mjs, asset.mjs, derived.mjs, packs.test
│   └── foundry-api.md   # manifesto, fichas, aba Traits, serviços, i18n
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
system.json                         # + documentTypes.Item.{exaltation,feat}, packs[exaltations, exalted-assets]
dtd40k.mjs                          # + ExaltationData, FeatData, ExaltationSheet, FeatSheet, hook updateCombat
src/packs/exaltations/              # 9 JSON
src/packs/exalted-assets/           # 10 folder-*.json + 75 JSON (plano)
module/
├── config.mjs                      # + enums de exaltação e feat (contracts/rules-api.md)
├── rules/
│   ├── exaltation.mjs              # NOVO, PURO
│   ├── asset.mjs                   # NOVO, PURO
│   └── derived.mjs                 # + modifiers.hpMax, staticDefenseSize
├── data/
│   ├── character-data.mjs          # + modifiers novos; system.exaltation derivado
│   ├── exaltation-data.mjs         # NOVO
│   └── feat-data.mjs               # NOVO
├── documents/
│   ├── item.mjs                    # + exaltação única
│   ├── exaltation-service.mjs      # NOVO
│   ├── asset-service.mjs           # NOVO
│   └── race-service.mjs            # + syncPerfection após aplicar/remover
└── apps/
    ├── character-sheet.mjs         # + drop, ações, contexto da exaltação
    ├── exaltation-context.mjs      # NOVO: contexto do cartão (tira peso da ficha)
    ├── exaltation-sheet.mjs        # NOVO
    └── feat-sheet.mjs              # NOVO
templates/
├── actor/parts/                    # header (+ exaltação), traits (+ exaltation.hbs, assets.hbs)
├── item/exaltation-sheet.hbs, item/feat-sheet.hbs   # NOVOS
└── dialog/exaltation-choice.hbs, dialog/exaltation-info.hbs  # NOVOS
styles/dtd40k.css                   # + cartão da exaltação, pontos do Power Stat, Tell, assets
lang/en.json, lang/pt-BR.json       # + chaves de contracts/foundry-api.md
tests/unit/
├── exaltation.test.mjs             # NOVO
├── asset.test.mjs                  # NOVO
├── derived.test.mjs                # + hpMax, staticDefenseSize
└── packs.test.mjs                  # + exaltations, exalted-assets
```

**Structure Decision**: mesmo projeto único e mesma separação puro × Foundry da 001/002. O cartão
da exaltação ganha um módulo de contexto próprio porque `character-sheet.mjs` já tem 483 linhas.

## Complexity Tracking

Nenhuma violação da constituição além da pendência de redação do princípio VI (acima). Escolhas não
óbvias, justificadas em research:

| Escolha | Por quê | Alternativa mais simples rejeitada porque |
|---|---|---|
| Estado calculado no ator, não no item (R2) | O Wraith usa Resolve máximo, que só existe depois do `prepareEmbeddedDocuments` | Calcular no `prepareDerivedData` do item leria derivados ainda vazios |
| Guardar gastos, não o atual (R2) | O atual acompanha qualquer mudança do máximo; a dívida sai do mesmo número | Guardar o atual exige reajuste a cada mudança de característica/Level |
| Marcador de rodada em vez de hook que grava (R4) | Zera sem escrita, sem corrida entre clientes nem permissão | Hook gravando precisa de um GM online e gera updates a cada rodada |
| `feat` com categoria em vez de `exaltedAsset` (R1) | Os feats (próxima feature) só acrescentam categorias | Tipo próprio exigiria migrar os assets depois |
| Warboss com `priority: 60` (R6) | O Size da raça é OVERRIDE (50) e apagaria o +1 | ADD com prioridade padrão rodaria antes do override |

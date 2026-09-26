# Implementation Plan: Compêndio de Raças (DtD 7.7a)

**Branch**: `002-race-compendium` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-race-compendium/spec.md`

## Summary

Adicionar o tipo de Item `race` (TypeDataModel + ficha ItemSheetV2), o compêndio `races` com as
12 raças do livro base (fonte JSON em `src/packs/races/`, compilada com o Foundry CLI) e a
aplicação da raça no personagem por arrastar e soltar. Decisão técnica central (research R1–R3):
cada bônus racial é um **Active Effect transferido do item de raça embutido**, gerado por uma
função pura a partir da escolha do jogador; apagar ou trocar o item remove os efeitos junto. Como
o v13 não protege campos alterados por efeitos no formulário, a ficha passa a editar sempre o
valor **base** (`_source`) e a exibir o final. Poderes simples viram efeitos em campos novos
`system.modifiers.*` lidos por `computeDerived`; poderes por cena ganham um contador. A ficha do
personagem ganha abas (`main` e `traits`).

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; sem build para rodar o sistema

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect com `transfer`,
ItemSheetV2/ActorSheetV2 + HandlebarsApplicationMixin, `static TABS`, DialogV2). Dev: Vitest,
ESLint, **`@foundryvtt/foundryvtt-cli` 3.x** (novo, para compilar o pack)

**Storage**: documentos do Foundry (Item `system`, ActiveEffects embutidos); compêndio LevelDB
`packs/races` gerado de `src/packs/races/*.json`

**Testing**: Vitest para `module/rules/**`, `module/config.mjs` e os JSON do compêndio;
roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system (pacote Foundry) — projeto único

**Performance Goals**: aplicar/trocar raça em < 1 s; ficha continua abrindo em < 1 s

**Constraints**: sem jQuery nem APIs depreciadas do v13; regras sem globais do Foundry;
interface pt-BR e en; conteúdo das raças em inglês com redação própria; nenhum input da ficha
pode gravar valor com efeito aplicado no `_source`

**Scale/Scope**: 1 tipo de item, 16 entradas de compêndio, 1 ficha de item, 1 diálogo, 1 aba
nova, ~6 efeitos por raça; ~20 arquivos novos/alterados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade às Regras | Tabela de referência na spec com páginas da 7.7a (pp. 31–61); normalização de nomes registrada; Gnome/Halfling Int/Fel mantido como no livro e registrado | ✅ |
| II. Arquitetura Nativa (v13) | TypeDataModel para `race`; derivados em `prepareDerivedData`; ItemSheetV2/DialogV2/`TABS`; bônus persistentes como Active Effects (R1); APIs conferidas no 13.351 | ✅ |
| III. Lógica Pura e Testada | `module/rules/race.mjs` e alteração de `derived.mjs` puros, com casos obrigatórios em contracts/rules-api.md; dados do pack validados por teste | ✅ |
| IV. Automação Pragmática | Só 3 poderes determinísticos automatizados; demais como texto/contador; cada efeito desativável; override do Mestre sempre vence (FR-019) | ✅ |
| V. Conteúdo como Dados | Fonte JSON em `src/packs/`, compilada via Foundry CLI, `packs/` fora do git; descrições resumidas com redação própria; SC-005 verificado manualmente | ✅ |
| VI. Entrega Incremental | Feature 2 da Fase 1; raças do Book 2, feats e combate fora de escopo; US1 (compêndio) utilizável sozinha | ✅ |
| Restrições técnicas | JS ESM + JSDoc, CSS puro, i18n `DTD.*` pt-BR/en, ids em inglês, nomes do livro (`heroicHeritage`, `shifty`) | ✅ |

**Re-check pós-design (Phase 1)**: data-model, contratos e quickstart mantêm todos os itens.
Observação: a 001 ainda tem US2/US3 (rolagens) pendentes; a 002 não depende delas e não toca
`module/dice/`, então as duas podem seguir em paralelo sem conflito de arquivos além de
`character-sheet.mjs`, `lang/*.json` e `styles/dtd40k.css`.

## Project Structure

### Documentation (this feature)

```text
specs/002-race-compendium/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── rules-api.md     # race.mjs, alteração de derived.mjs, teste do pack
│   └── foundry-api.md   # manifesto, fichas, abas, serviço de raça, i18n, build
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
system.json                         # + documentTypes.Item.race, packs[races]
dtd40k.mjs                          # + registro de RaceData, DtdItem, RaceSheet
package.json                        # + @foundryvtt/foundryvtt-cli, script build:packs
.gitignore                          # + packs/
scripts/
└── build-packs.mjs                 # compilePack src/packs/races → packs/races
src/packs/races/                    # 12 JSON (fonte versionada)
module/
├── config.mjs                      # + RACE_POWER_AUTOMATION, MAX_RATING = 6
├── rules/
│   ├── race.mjs                    # NOVO, PURO: usesPerScene, validateRaceChoice, buildRaceEffects, capValue…
│   ├── derived.mjs                 # + modifiers (shifty, resilience)
│   └── sheet.mjs                   # + buildDots(base), nextBaseValue (pontos raciais)
├── data/
│   ├── character-data.mjs          # + modifiers, limite de 6, capped
│   └── race-data.mjs               # NOVO: TypeDataModel do item race
├── documents/
│   ├── item.mjs                    # NOVO: DtdItem (_preCreate: uma raça por ator)
│   └── race-service.mjs            # NOVO: applyRace, reconfigureRace, removeRace, getRace
└── apps/
    ├── character-sheet.mjs         # + TABS, drop de raça, valores base, aba Traits, ações
    └── race-sheet.mjs              # NOVO: ItemSheetV2
templates/
├── actor/parts/                    # header (raça + base/final), main (abas), traits (NOVO)
├── item/race-sheet.hbs             # NOVO
└── dialog/race-choice.hbs          # NOVO
styles/dtd40k.css                   # + abas, pontos raciais, ficha da raça, diálogo
lang/en.json, lang/pt-BR.json       # + chaves de contracts/foundry-api.md
tests/unit/
├── race.test.mjs                   # NOVO
├── packs.test.mjs                  # NOVO
├── derived.test.mjs                # + casos Shifty/Squat
└── sheet.test.mjs                  # + pontos raciais, nextBaseValue
```

**Structure Decision**: mantém o projeto único da 001, com a mesma separação entre módulos
puros (`module/rules/`, `module/config.mjs`) e camadas do Foundry. `src/packs/` é a fonte do
conteúdo; `packs/` é saída de build ignorada pelo git.

## Complexity Tracking

Nenhuma violação da constituição. Duas escolhas não óbvias, justificadas em research:

| Escolha | Por quê | Alternativa mais simples rejeitada porque |
|---|---|---|
| Inputs da ficha editam `_source` (R3) | O v13 não filtra campos com efeito; sem isso o Size base e o Hero Points máximo seriam corrompidos | Deixar os inputs como estão grava o valor com bônus no documento |
| `system.modifiers.*` para poderes (R4) | Dá aos poderes um alvo de efeito que nunca vira input do formulário | Mirar em `derivedMods.*.bonus` somaria em dobro quando o Mestre salvar a ficha |

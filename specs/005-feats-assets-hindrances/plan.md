# Implementation Plan: Feats, Assets e Hindrances (DtD 7.7a)

**Branch**: `005-feats-assets-hindrances` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-feats-assets-hindrances/spec.md`

## Summary

Estender o tipo de Item `feat` da 004 com as categorias Feat, Racial Feat, Asset e Hindrance e
distribuir o compêndio `feats` com as 274 entradas do cap. 7 (pastas por categoria e por raça). A adição
ao personagem segue o padrão das features anteriores (serviço + regras puras + Active Effects
desligáveis): escolha de subcategoria nos feats de grupo, validação pura com erros (Mestre pode
confirmar), avisos de dependência e 15 automações numéricas. Decisão central (research R7): as
**concessões** de feats ficam nos dados (`grants` em raça, exaltação e feat) e o ciclo de vida é
centralizado em `DtdItem#_onCreate`/`_onDelete` no cliente do autor, com `grantedBy` como lista de
origens — assim trocar ou remover raça, exaltação ou asset (por qualquer caminho) tira só o que ficou
sem origem e nunca duplica feats comprados.

## Technical Context

**Language/Version**: JavaScript ESM (ES2022) com JSDoc; sem build para rodar o sistema

**Primary Dependencies**: Foundry VTT v13 (TypeDataModel, ActiveEffect `transfer`/`priority`, ArrayField ADD,
`_onCreate`/`_onDelete` de documentos embutidos, `CompendiumCollection#getDocuments({ _id__in })`,
ItemSheetV2/ActorSheetV2, DialogV2). Dev: Vitest, ESLint, `@foundryvtt/foundryvtt-cli` 3.x

**Storage**: documentos do Foundry; compêndio LevelDB `packs/feats` gerado de `src/packs/feats/*.json`;
atualização dos JSON de `races`, `exaltations` e `exalted-assets` (campo `grants`)

**Testing**: Vitest (`module/rules/**`, `config.mjs`, JSON dos packs); roteiro manual em [quickstart.md](quickstart.md)

**Target Platform**: Foundry VTT v13 (13.351)

**Project Type**: game system (pacote Foundry) — projeto único

**Performance Goals**: adicionar feat / aplicar raça com 12 concessões em < 2 s; ficha abre em < 1 s com ~30 feats

**Constraints**: sem jQuery/APIs depreciadas; regras puras sem globais do Foundry; pt-BR/en; conteúdo em
inglês com redação própria; nenhum input grava valor com efeito no `_source` (002 R3, estendido às
especialidades — R5); reações de `_onCreate`/`_onDelete` só no cliente do autor

**Scale/Scope**: 274 entradas + 20 pastas; 15 automações; 11 origens de concessão; 1 serviço, 1 módulo de
regras, 1 diálogo, 1 partial nova; ~25 arquivos novos/alterados + JSON de conteúdo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Fidelidade às Regras | Páginas da 7.7a citadas (pp. 174–210, 106, 15–16); inventário extraído do PDF; divergências lista-resumo × descrição resolvidas pela descrição e registradas; dependências derivadas do texto marcadas como tal | ✅ |
| II. Arquitetura Nativa (v13) | TypeDataModel estendido; efeitos como Active Effects; derivados no `prepareDerivedData`; hooks de documento e query do compêndio conferidos no 13.351 | ✅ |
| III. Lógica Pura e Testada | `rules/feat.mjs` (validação, efeitos, planos de concessão) e `derived.mjs` puros com casos em contracts/rules-api.md; packs testados | ✅ |
| IV. Automação Pragmática | Só efeitos numéricos sempre ativos; combate/magia/armadura/idiomas como texto; toda recusa pode ser confirmada pelo Mestre; modificadores desligáveis; override do Mestre vence | ✅ |
| V. Conteúdo como Dados | Fonte JSON em `src/packs/`; concessões como dados; redação própria com checagem de n-gramas | ✅ |
| VI. Entrega Incremental | Núcleo de personagem da Fase 1 (v1.2.1); US1 utilizável sozinha; classes fora de escopo; reaproveita `feat` da 004 | ✅ |
| Restrições técnicas | JS ESM + JSDoc, CSS puro, i18n `DTD.*`, ids em inglês, nomes do livro | ✅ |

**Re-check pós-design (Phase 1)**: mantém todos os itens. Toca código da 001 (especialidades e
iniciativa na ficha), 002 (dados das raças) e 004 (`FeatData`, dados de exaltações e Exalted Assets,
`DtdItem`) de forma aditiva; os testes existentes devem continuar passando.

## Project Structure

### Documentation (this feature)

```text
specs/005-feats-assets-hindrances/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/ (rules-api.md, foundry-api.md)
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
system.json                         # + pack feats; initiative com @modifiers.initiative
dtd40k.mjs                          # CONFIG.Combat.initiative com @modifiers.initiative
src/packs/feats/                    # 20 pastas + 274 JSON (plano)
src/packs/races/aasimar.json, gnome.json                  # + grants
src/packs/exaltations/atlantean.json, promethean.json     # + grants (rank 1)
src/packs/exalted-assets/{paragon-racial-you-will-not-falter,paragon-racial-tuning,vampire-ventrue}.json  # + grants
module/
├── config.mjs                      # FEAT_CATEGORIES, FEAT_AUTOMATION, HINDRANCE_LIMIT, FEAT_REQUIREMENT_TYPES
├── rules/feat.mjs                  # NOVO, PURO
├── rules/derived.mjs               # + modifiers resolveMax, mentalDefense, staticDefense(+Characteristic), fatigueMax
├── data/feat-data.mjs              # + featGroup, repeatable, requires, xpGranted, grants, selection
├── data/race-data.mjs, exaltation-data.mjs   # + grants
├── data/character-data.mjs         # + modifiers novos
├── documents/item.mjs              # + _onCreate/_onDelete (concessões)
├── documents/feat-service.mjs      # NOVO
├── documents/exaltation-service.mjs # setPowerStat revê concessões por rank
└── apps/
    ├── feats-context.mjs           # NOVO
    ├── feat-sheet.mjs              # campos novos
    └── character-sheet.mjs         # drop, ações, especialidades base/final, iniciativa
templates/actor/parts/feats.hbs, specialties.hbs, traits.hbs, footer.hbs
templates/item/feat-sheet.hbs · templates/dialog/feat-choice.hbs
styles/dtd40k.css · lang/en.json, lang/pt-BR.json
tests/unit/feat.test.mjs (NOVO), derived.test.mjs, config.test.mjs, packs.test.mjs
```

**Structure Decision**: mesmo projeto único e mesma separação puro × Foundry; contexto da ficha em módulo
próprio, como na 004.

## Complexity Tracking

Nenhuma violação. Escolhas não óbvias:

| Escolha | Por quê | Alternativa mais simples rejeitada porque |
|---|---|---|
| Concessões em `DtdItem#_onCreate/_onDelete` (R7) | Um ponto só cobre raça, exaltação, asset, feat e exclusões pelo menu do core | Chamar em cada serviço deixa de fora exclusões pelo core e duplica lógica em 5 lugares |
| `grantedBy` como lista + `purchased` (R7) | Duas origens podem conceder o mesmo feat; comprar um concedido não pode duplicar | Uma origem só apagaria o feat ainda concedido por outra |
| Especialidades por efeito com base/final na ficha (R5) | Remove junto com o feat e não grava no `_source` | Escrever no `_source` exige limpar à mão e se perde se o feat for apagado pelo core |
| Manter `group` = grupo de Exalted Asset (R1) | Evita migração da 004 | Renomear quebraria dados já distribuídos |

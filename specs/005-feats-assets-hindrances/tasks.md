---

description: "Task list for 005-feats-assets-hindrances"
---

# Tasks: Feats, Assets e Hindrances (DtD 7.7a)

**Input**: Design documents from `specs/005-feats-assets-hindrances/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md,
contracts/foundry-api.md, quickstart.md

**Tests**: incluídos — constituição III (Vitest para módulos puros e dados dos packs). Escrever os testes
antes e confirmar que falham. UI: roteiro manual do quickstart.

**Organization**: US1 compêndio, US2 adicionar ao personagem, US3 automação, US4 feats concedidos.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-005`
- Fonte de regras: spec.md "Tabela de referência", "Dependências entre feats" e "Tabela de concessões"
  (7.7a pp. 174–210); inventário do PDF em
  `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch7-inventory.json`
  (conferir cada entrada no texto do livro antes de gravar — constituição V)

---

## Phase 1: Setup

- [ ] T001 Em `system.json`: acrescentar o pack `{ "name": "feats", "label": "Feats", "path": "packs/feats", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }` e trocar `initiative` para `1d10 + @characteristics.dex.value + @characteristics.cmp.value + @modifiers.initiative`; em `dtd40k.mjs`, a mesma fórmula em `CONFIG.Combat.initiative` (contracts/foundry-api.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: constantes e modelos estendidos usados por todas as histórias

- [ ] T002 [P] Acrescentar em `tests/unit/config.test.mjs`: `FEAT_CATEGORIES` = `["feat", "racialFeat", "asset", "hindrance", "exaltedAsset"]`; `FEAT_AUTOMATION` = `ASSET_AUTOMATION` seguido de `["soundConstitution", "discipline", "paranoia", "farsighted", "halflingAgility", "noOneTougher", "madeOfMettle", "beneficialMutation", "matron", "sturdy", "sand", "nineLives", "veteran", "skillFocus", "noisyCricket"]`; `HINDRANCE_LIMIT === 2`; `FEAT_REQUIREMENT_TYPES` = `["feat", "racePower"]`; todos em `DTD`; `ASSET_AUTOMATION` inalterado
- [ ] T003 Em `module/config.mjs`: `FEAT_CATEGORIES` ampliado, `FEAT_AUTOMATION`, `HINDRANCE_LIMIT`, `FEAT_REQUIREMENT_TYPES` (com fonte: p. 179, research R4) e no objeto `DTD`; fazer T002 passar
- [ ] T004 Em `module/data/feat-data.mjs`: `category` choices `FEAT_CATEGORIES` com inicial `"feat"`; `automation` choices `FEAT_AUTOMATION`; novos campos conforme data-model.md — `xpGranted` "inteiro ≥ 0" (inicial 0), `repeatable` booleano, `featGroup: { enabled: booleano, options: lista de strings não vazias }`, `requires: lista de { type: choices FEAT_REQUIREMENT_TYPES, name: string não vazia }`, `grants: lista de { name: string não vazia, subcategory: string, choose: booleano }`, `selection: { subcategory, characteristic ("" ou chave), characteristic2 ("" ou chave), skill ("" ou chave de perícia), specialty }`; manter `group`, `prerequisites`, `xpCost` com o sentido da 004 (research R1)
- [ ] T005 [P] Em `module/data/race-data.mjs` e `module/data/exaltation-data.mjs`: campo `grants` (race: `{ name, subcategory, choose }`; exaltation: idem + `rank` "inteiro 1–5", inicial 1)
- [ ] T006 [P] Em `module/data/character-data.mjs` `modifiers`: `resolveMax`, `mentalDefense`, `staticDefense`, `fatigueMax`, `initiative` (inteiros, 0) e `staticDefenseCharacteristic` (choices `["dex", "con"]`, inicial `"dex"`), com o comentário "targets of feat effects only — never sheet inputs"
- [ ] T007 [P] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Feat.Category.{feat,racialFeat,asset,hindrance}` (e `exaltedAsset` reaproveitado de `DTD.Asset.Category`), `DTD.Feat.Automation.*` (15 novos), `DTD.Feat.RequireType.{feat,racePower}`
- [ ] T008 Rodar `npm test` (suíte existente verde com os schemas estendidos) e `npx eslint .`

**Checkpoint**: o sistema carrega e os 75 Exalted Assets da 004 continuam válidos (campos novos com padrão)

---

## Phase 3: User Story 1 - Consultar no compêndio (Priority: P1) 🎯 MVP

**Goal**: compêndio `feats` com 274 entradas em pastas; ficha de feat com os campos novos

**Independent Test**: quickstart passos 1–3

### Tests for User Story 1 ⚠️

- [ ] T009 [P] [US1] Acrescentar em `tests/unit/packs.test.mjs` o bloco "feats compendium source (spec 005, SC-001)" conforme contracts/rules-api.md: 21 pastas (Feats, Racial Feats, 16 subpastas de raça com `folder` = Racial Feats, Assets, Hindrances) e 274 itens `type: "feat"`; contagem 181/49/22/22; nomes de assets, hindrances e raciais por raça iguais à spec (Kobold 4); `prerequisites.race` e pasta da raça coerentes com o pack Races; `xpCost`/`xpGranted` (100/0; hindrance 0/100); os 22 repetíveis e `featGroup.options` de Armor Proficiency, Weapon Proficiency, Peer, Speak Language, Wholeness of Body; `automation` exatamente nos 15 automatizados da research R4; `requires` da tabela "Dependências entre feats"; `grants` de Academy (2 × Weapon Proficiency `choose`), Kenjutsu, K'sten'mannav, Lightning Bug; `selection` vazio; `description` não vazia; `_id`/`_key` únicos; nomes normalizados ("Aasimar", "High-Falutin'", "WAAAAAGH CRY!")

### Implementation for User Story 1

- [ ] T010 [P] [US1] Criar as 21 pastas em `src/packs/feats/folder-*.json` (`_key: "!folders!<_id>"`, `type: "Item"`, `sorting: "a"`, subpastas de raça com `folder` = id de Racial Feats, `flags.dtd40k.featFolder` = categoria/raça)
- [ ] T011 [P] [US1] Criar os feats de classe A–F (`src/packs/feats/feat-<slug>.json`) com `type: "feat"`, `category: "feat"`, `folder`, página, grupo/opções, repetível, `requires`, `automation`, `xpCost: 100` e descrição em inglês de redação própria (1–3 frases, números exatos, sem 6+ palavras iguais ao livro); conferir no PDF pp. 180–198
- [ ] T012 [P] [US1] Criar os feats de classe G–R, mesmas regras de T011
- [ ] T013 [P] [US1] Criar os feats de classe S–Z, mesmas regras de T011
- [ ] T014 [P] [US1] Criar os 49 feats raciais (`racial-<race>-<slug>.json`, pp. 199–205) com `category: "racialFeat"`, `prerequisites.race` = nome do pack Races, pasta da raça, automações (madeOfMettle, halflingAgility, noOneTougher, farsighted, beneficialMutation, matron, noisyCricket) e `grants` (Kenjutsu → Extracurricular Study; K'sten'mannav → Armor of Contempt; Lightning Bug → Luminen Blast); `requires` de Elven Precision/Precise Technique (racePower Elven Accuracy) e Extra Warp/Guess Destination (racePower Warp Step)
- [ ] T015 [P] [US1] Criar os 22 Assets (`asset-<slug>.json`, pp. 205–207; automações sturdy, sand, nineLives, veteran; Academy com `grants`) e os 22 Hindrances (`hindrance-<slug>.json`, pp. 208–210; `xpCost: 0`, `xpGranted: 100`)
- [ ] T016 [US1] Rodar `npm test` (T009 passa) e `npm run build:packs`; conferir `packs/feats/` gerado sem "in use"
- [ ] T017 [US1] Em `templates/item/feat-sheet.hbs` e `module/apps/feat-sheet.mjs`: campos novos por categoria (raça, XP concedido, repetível, grupo + opções como tags, dependências e concessões como listas editáveis, automação `FEAT_AUTOMATION`), a escolha feita no personagem (subcategoria, característica, perícia, especialidade) e somente leitura com texto formatado; `_processFormData` para as listas
- [ ] T018 [P] [US1] i18n em `lang/*.json`: `DTD.Feat.{Feats, Assets, Hindrances, XpCost, XpGranted, Repeatable, Group, Options, Subcategory, Requires, Grants, Choose, Race}`
- [ ] T019 [P] [US1] Estilos da ficha de feat em `styles/dtd40k.css` (listas de dependências/concessões)
- [ ] T020 [US1] Validar quickstart passos 1–3 **conferindo antes o índice do pack compilado no Foundry** (`index.size === 274`) e registrar em `quickstart.md`

**Checkpoint**: compêndio Feats utilizável (MVP)

---

## Phase 4: User Story 2 - Adicionar ao personagem (Priority: P2)

**Goal**: drop com escolha de subcategoria, validações com override do Mestre, seções na aba Traits

**Independent Test**: quickstart passos 4–9

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Escrever `tests/unit/feat.test.mjs` (parte US2): `fullName`; `needsFeatSelection`; `validateFeatSelection` (`noSubcategory`, `skill`, `specialty`); `validateFeatAdd` com os casos de contracts/rules-api.md (`notRepeatable`, `duplicate` × Peer (Underworld) ok, `wrongRace`, `noRace`, `hindranceLimit`, warning `missingDependency` ["Frenzy"], Elven Precision em Elf sem aviso, notices `creationOnly` e `extraHindrances`)

### Implementation for User Story 2

- [ ] T022 [US2] Implementar `module/rules/feat.mjs` (PURO) — `fullName`, `needsFeatSelection`, `validateFeatSelection`, `validateFeatAdd`; fazer T021 passar
- [ ] T023 [P] [US2] Criar `templates/dialog/feat-choice.hbs`: subcategoria (datalist das opções + texto livre), característica(s) em rádio, perícia em select agrupado, especialidade em texto; rádios com o tamanho explícito da 004
- [ ] T024 [US2] Criar `module/documents/feat-service.mjs` (parte US2) conforme contracts/foundry-api.md: `getFeats`, `promptFeatSelection` (valida e reabre), `addFeat` (erros → aviso e, para o Mestre, `DialogV2.confirm`; avisos → confirmação; notices → info; cria com `name = fullName` e `system.selection`), `removeFeat` (confirmação)
- [ ] T025 [US2] Criar `module/apps/feats-context.mjs` e `templates/actor/parts/feats.hbs` (seções Feats/Assets/Hindrances com "n / 2", nome completo, raça incompatível, remover para donos); incluir em `traits.hbs` e `CharacterSheet.PARTIALS`
- [ ] T026 [US2] Em `module/apps/character-sheet.mjs`: `_onDropItem` desvia `feat` com `category !== "exaltedAsset"` para `addFeat`; `_prepareContext` expõe `feats`; ações `openFeat`, `removeFeat`; `toggleItemEffect` já cobre os efeitos
- [ ] T027 [P] [US2] i18n: `DTD.Feat.{DropHint, Remove, RemoveConfirm, GMOverride, MissingDependency, CreationOnly, ExtraHindrances, HindranceCount, WrongRace, ChooseTitle, SubcategoryHint, Error.*}`
- [ ] T028 [P] [US2] Estilos das seções de feats na aba Traits e do diálogo em `styles/dtd40k.css`
- [ ] T029 [US2] Validar quickstart passos 4–9 e registrar

**Checkpoint**: feats, assets e hindrances adicionáveis com as regras do livro

---

## Phase 5: User Story 3 - Efeitos automáticos (Priority: P3)

**Goal**: 15 automações como Active Effects desligáveis; especialidades por efeito sem gravar no `_source`

**Independent Test**: quickstart passos 10–15

### Tests for User Story 3 ⚠️

- [ ] T030 [P] [US3] Acrescentar em `tests/unit/feat.test.mjs`: `lowestCharacteristics`, `characteristicOptions`, `validateFeatSelection` (`characteristic`, `characteristic2`) e `buildFeatEffects` para as 15 automações (valores e chaves da research R4; matron com `priority: 60` no Size; delegação a `buildAssetEffects` para `actionHero`; `none` → `[]`)
- [ ] T031 [P] [US3] Acrescentar em `tests/unit/derived.test.mjs` os casos de contracts/rules-api.md ("derived.mjs (alteração)"), inclusive "sem modificadores nada muda"

### Implementation for User Story 3

- [ ] T032 [US3] Completar `module/rules/feat.mjs` com `lowestCharacteristics`, `characteristicOptions` e `buildFeatEffects`; fazer T030 passar
- [ ] T033 [US3] Em `module/rules/derived.mjs`: modificadores `resolveMax`, `mentalDefense`, `staticDefense`, `fatigueMax` e `staticDefenseCharacteristic` antes do bônus/override do Mestre; fazer T031 passar
- [ ] T034 [US3] Em `feat-service.addFeat`: efeitos de `buildFeatEffects` (`transfer`, `origin`, nome `DTD.Feat.Effect`, `flags.dtd40k.feat`); Nine Lives soma 1 ao `heroPoints.value`; `removeFeat` limita Hero Points ao máximo
- [ ] T035 [US3] Especialidades base × final (research R5): em `character-sheet.mjs` o contexto de características/perícias separa as especialidades do `_source` (com remover) das vindas de efeitos (marcadas, sem remover); `#onAddSpecialty`/`#onRemoveSpecialty` leem o `_source`; atualizar `templates/actor/parts/specialties.hbs`
- [ ] T036 [US3] Iniciativa: `initiativeBonus` do rodapé em `character-sheet.mjs` soma `system.modifiers.initiative`
- [ ] T037 [P] [US3] i18n: `DTD.Feat.{Effect, ChooseCharacteristic, ChooseCharacteristic2, ChooseSkill, Specialty}`, `DTD.Sheet.FromFeat`
- [ ] T038 [US3] Validar quickstart passos 10–15 e registrar

**Checkpoint**: derivados já contam os feats

---

## Phase 6: User Story 4 - Feats concedidos (Priority: P4)

**Goal**: concessões por raça, exaltação, asset e feat racial, com entrada/saída automática e sem duplicar

**Independent Test**: quickstart passos 16–23

### Tests for User Story 4 ⚠️

- [ ] T039 [P] [US4] Acrescentar em `tests/unit/feat.test.mjs`: `grantPlan`, `releasePlan` e `activeGrants` com os casos de contracts/rules-api.md
- [ ] T040 [P] [US4] Acrescentar em `tests/unit/packs.test.mjs`: `grants` de Aasimar e Gnome (races), Atlantean e Promethean rank 1 (exaltations), You Will Not Falter, Tuning (3 × `choose`) e Ventrue (Peer / Ventrue) (exalted-assets); todo nome concedido existe no pack `feats`; demais entradas com `grants: []`

### Implementation for User Story 4

- [ ] T041 [US4] Completar `module/rules/feat.mjs` com `grantPlan`, `releasePlan`, `activeGrants`; fazer T039 passar
- [ ] T042 [P] [US4] Atualizar os JSON: `src/packs/races/aasimar.json` (Jaded, Fearless), `gnome.json` (Weapon Proficiency × 7 opções, Armor Proficiency × 5); `src/packs/exaltations/atlantean.json` (Speak Language / Syrneth, rank 1), `promethean.json` (Armor Proficiency × 5, rank 1); `src/packs/exalted-assets/paragon-racial-you-will-not-falter.json`, `paragon-racial-tuning.json`, `vampire-ventrue.json`; fazer T040 passar
- [ ] T043 [US4] Em `module/documents/feat-service.mjs`: `grantFeats(actor, origin)` (resolve nomes pelo índice de `dtd40k.feats` + `getDocuments({ _id__in })`, `choose` → `promptFeatSelection` excluindo as já escolhidas, aplica `grantPlan` com `flags.dtd40k.grantedBy`, aviso `DTD.Feat.GrantMissing`) e `releaseGrants(actor, originId)` (aplica `releasePlan`); `addFeat` marca `purchased` quando o feat já foi concedido; `removeFeat` de concedido só pelo Mestre (desmarca `purchased` quando também comprado)
- [ ] T044 [US4] Em `module/documents/item.mjs`: `_onCreate`/`_onDelete` no cliente do autor (`userId === game.user.id`) para itens embutidos em `character` chamando `grantFeats`/`releaseGrants` (research R7)
- [ ] T045 [US4] Em `module/documents/exaltation-service.mjs` `setPowerStat`: ao cruzar o `rank` de uma concessão, chamar `grantFeats`/`releaseGrants` para as concessões afetadas
- [ ] T046 [US4] Em `feats-context.mjs`/`feats.hbs`: badges "concedido por <origem>" e "comprado"; remover oculto para concedidos (exceto Mestre); nos Exalted Assets (`assets.hbs` da 004), badge com o número de feats concedidos
- [ ] T047 [P] [US4] i18n: `DTD.Feat.{GrantedBy, Purchased, RemoveGranted, GrantMissing}`
- [ ] T048 [US4] Validar quickstart passos 16–23 e registrar

**Checkpoint**: criação de personagem completa com feats concedidos

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T049 [P] Atualizar `docs/analise-dtd.md` (seção de feats/assets/hindrances para a 7.7a) e `README.md` (recursos)
- [ ] T050 Rodar `npm run lint` e `npm test` sem erros
- [ ] T051 Rodar o quickstart completo (1–24), inclusive o passo 24 com um usuário jogador de teste (criar e remover ao final), e registrar
- [ ] T052 Rodar `graphify update .`

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish
- US3 e US4 dependem do serviço e do contexto da US2; US4 depende também do pack da US1 (nomes)
- Dentro de cada história: testes → regras puras → serviço/modelo → ficha → i18n/estilos → validação

### Parallel Opportunities

- Foundational: T002, T005, T006, T007
- US1: T009–T015 em paralelo (conteúdo em 5 lotes); T018 e T019
- US2: T021 e T023; T027 e T028
- US3: T030 e T031; T037
- US4: T039, T040 e T042; T047

## Parallel Example: User Story 1

```text
Task: "T011 [US1] feats A–F"
Task: "T012 [US1] feats G–R"
Task: "T013 [US1] feats S–Z"
Task: "T014 [US1] 49 feats raciais"
Task: "T015 [US1] 22 assets e 22 hindrances"
```

## Implementation Strategy

1. MVP: Setup + Foundational + US1 (compêndio de consulta)
2. US2 → adicionar ao personagem; US3 → automação; US4 → concessões
3. Validar cada história no Foundry conferindo o pack compilado antes de registrar dados

## Notes

- Conventional Commits; `packs/` só via `npm run build:packs`
- Descrições em redação própria; nunca colar texto do PDF
- Feats de combate, magia, armadura, idiomas, backgrounds e Insanity ficam como texto (FR-012)

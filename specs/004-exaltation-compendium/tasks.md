---

description: "Task list for 004-exaltation-compendium"
---

# Tasks: Compêndio de Exaltações (DtD 7.7a)

**Input**: Design documents from `specs/004-exaltation-compendium/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md,
contracts/foundry-api.md, quickstart.md

**Tests**: incluídos — a constituição (princípio III) exige Vitest para todo módulo puro
(`module/rules/**`, `module/config.mjs`); os dados dos compêndios também têm teste (SC-001, SC-002).
Escrever os testes antes da implementação e confirmar que falham. UI/integração: roteiro manual do
quickstart.md.

**Organization**: tarefas agrupadas por história (US1 compêndio de exaltações, US2 compêndio de
assets, US3 aplicar a exaltação, US4 recurso e Tell, US5 assets no personagem).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1–US5)
- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-004` (pasta do sistema Foundry)
- Fonte de regras: spec.md "Tabela de referência — Exaltações" (7.7a pp. 65–100) e "— Exalted
  Assets" (pp. 179, 211–223); conferir cada entrada no PDF `D:\Arc\RPG\DTD\DtD7.7a - Ready to Print.pdf`
  antes de gravar o JSON (constituição V)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ambiente do worktree e manifesto

- [X] T001 Rodar `npm install` no worktree `DtD40K-foundryvtt-004` e `npm test` para confirmar a base da 002 verde antes de qualquer mudança
- [X] T002 [P] Em `system.json`: acrescentar `documentTypes.Item.exaltation: { "htmlFields": ["description", "fullText", "resource.recovery", "tell", "lore.origin", "lore.appearance", "lore.society"] }`, `documentTypes.Item.feat: { "htmlFields": ["description"] }` e os packs `{ "name": "exaltations", "label": "Exaltations", "path": "packs/exaltations", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }` e `{ "name": "exalted-assets", "label": "Exalted Assets", "path": "packs/exalted-assets", … mesmo ownership }` (contracts/foundry-api.md); atualizar `description` para citar a DtD 7.7a
- [X] T003 [P] Em `eslint.config.mjs`, acrescentar aos globais somente leitura do Foundry os que faltarem para os novos módulos: `Combat`, `Folder` (conferir antes os já declarados) — conferido: nenhum global novo é usado (só `game.combat`, `game.packs`), config inalterada

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: constantes e modelos dos itens `exaltation` e `feat`, usados por todas as histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T004 [P] Acrescentar em `tests/unit/config.test.mjs`: `EXALTATION_FORMULAS` é exatamente `["motes", "favor", "essence", "breath", "actionPoints", "pyros", "vitae", "rage", "plasm", "fixed"]`; `EXALTATION_POWER_AUTOMATION` = `["none", "destiny", "statuesque", "perfection", "bloodQuickening"]`; `RESOURCE_ACTIONS` = `["restoreAll", "regain", "lose", "unravel"]`; `RESOURCE_HEALING` = `["outOfCombat", "anytime", "never"]`; `POWER_STAT_CAPS` = `["level", "levelAndDevotion"]`; `FEAT_CATEGORIES` = `["exaltedAsset"]`; `ASSET_GROUPS` = `["atlanteanCaste", "chosenMark", "daemonhostSin", "dragonbloodedBloodline", "paragon", "paragonRacial", "prometheanMaterial", "vampireClan", "werewolfTribe", "wraithHaunting"]`; `ASSET_AUTOMATION` = `["none", "actionHero", "extraAction", "bloodOfIo", "warboss", "longbeard", "markOfNurgle", "sloth", "elusive"]`; `LIMIT_EXEMPT_GROUPS` = `["paragon", "paragonRacial"]`; `GENERIC_SPENDS` = `["heal", "skill", "reaction", "stunned", "dazed"]`; todos exportados em `DTD`
- [X] T005 Em `module/config.mjs` (PURO): exportar as constantes de T004 com comentário de fonte (7.7a p. 65 para `GENERIC_SPENDS`; research R3/R6 para os enums) e incluí-las no objeto `DTD`; fazer T004 passar
- [X] T006 [P] Criar `module/data/exaltation-data.mjs` (`ExaltationData extends foundry.abstract.TypeDataModel`) exatamente conforme data-model.md: `description`, `fullText` HTMLField; `source.book` "padrão `\"DtD 7.7a\"`", `source.page` "inteiro ≥ 1" (nullable, inicial null); `powerStat.name` string; `powerStat.cap` choices `POWER_STAT_CAPS`, "padrão `\"level\"`"; `powerStat.value` "inteiro 1–10", inicial 1; `resource.name` string; `resource.formula` choices `EXALTATION_FORMULAS`, "padrão `\"fixed\"`"; `resource.fixedMax` "inteiro ≥ 0"; `resource.recovery` HTMLField; `resource.actions` ArrayField de `{ type: choices RESOURCE_ACTIONS, amount: StringField }` com `validate` exigindo `amount` = inteiro ≥ 1 em texto ou `"powerStat"` (ignorado em `restoreAll`); `resource.debtName` string (blank); `resource.healing` choices `RESOURCE_HEALING`, "padrão `\"outOfCombat\"`"; `resource.spent` "inteiro ≥ 0"; `round.spent` "inteiro ≥ 0", `round.marker` string inicial `"none"`; `scene.spent` "inteiro ≥ 0"; `pressure.enabled` booleano, `pressure.spent` "inteiro ≥ 0"; `staticPowers` ArrayField de `{ name, description HTML, automation choices EXALTATION_POWER_AUTOMATION inicial "none" }`; `powers` ArrayField de `{ rank inteiro 1–5, name, description HTML }` com `validate` "exatamente 5, `rank` único e em ordem" (aceitar lista vazia só para item novo criado no diretório); `elements` ArrayField de `{ key, name, characteristic choices CHARACTERISTICS, hpMax "inteiro ≥ 0", description HTML }`; `tell` HTMLField; `lore.origin`/`appearance`/`society` HTMLField; `lore.examples` lista de strings não vazias; `selection.statuesque` "chave de característica ou `\"\"`"; `selection.element` string (blank)
- [X] T007 [P] Criar `module/data/feat-data.mjs` (`FeatData`) conforme data-model.md: `category` choices `FEAT_CATEGORIES` inicial `"exaltedAsset"`; `description` HTMLField; `source.book`/`source.page` como em T006; `xpCost` "inteiro ≥ 0" inicial 100; `group` choices `["", ...ASSET_GROUPS]` com `validate` exigindo grupo quando `category === "exaltedAsset"`; `prerequisites.exaltation`, `prerequisites.race`, `prerequisites.deity` strings (blank); `automation` choices `ASSET_AUTOMATION`, "padrão `none`"
- [X] T008 Registrar em `dtd40k.mjs` (hook `init`): `CONFIG.Item.dataModels.exaltation = ExaltationData`, `CONFIG.Item.dataModels.feat = FeatData`
- [X] T009 [P] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `TYPES.Item.exaltation` ("Exaltation"/"Exaltação"), `TYPES.Item.feat` ("Feat"/"Feat"), `DTD.Exaltation.Formula.*`, `DTD.Exaltation.Cap.*`, `DTD.Exaltation.Action.*`, `DTD.Exaltation.Healing.*`, `DTD.Exaltation.Automation.*`, `DTD.Asset.Group.*`, `DTD.Asset.Category.exaltedAsset`, `DTD.Asset.Automation.*` (nomes de regra do livro em inglês nos dois idiomas; fórmulas legíveis, ex. "Charisma + Intelligence + 2×Power Stat")

**Checkpoint**: o sistema carrega no v13 e permite criar Items "Exaltação" e "Feat" no diretório de itens (ficha padrão do core), sem erros no console

---

## Phase 3: User Story 1 - Consultar as exaltações do livro no compêndio (Priority: P1) 🎯 MVP

**Goal**: compêndio "Exaltations" com as 9 exaltações e ficha própria da exaltação

**Independent Test**: quickstart passos 1–3 e 5 (parte exaltação)

### Tests for User Story 1 ⚠️

- [X] T010 [P] [US1] Acrescentar em `tests/unit/packs.test.mjs` o bloco "exaltations compendium source (SC-001)" conforme contracts/rules-api.md: lê `src/packs/exaltations/*.json`; exatamente 9 nomes (Atlantean, Chosen, Daemonhost, Dragonblooded, Paragon, Promethean, Vampire, Werewolf, Wraith); tabela esperada no teste com `[powerStat.name, powerStat.cap, resource.name, resource.formula, debtName, healing, pressure.enabled, [5 nomes de powers em ordem], source.page]` da spec (ex. Werewolf `["Feral Heart", "level", "Rage", "rage", "", "anytime", false, ["Fast Healing", "Spirit Walk", "Quick Shift", "Stoking Fury", "Luna's Blessing"], 95]`; Chosen `cap "levelAndDevotion"`, `favor`; Atlantean `debtName "Paradox"`; Daemonhost `"Resonance"`; Promethean `healing "never"`; Paragon `pressure.enabled true`); `powers` com `rank` 1–5; nomes dos `staticPowers` iguais à spec; Dragonblooded com 5 `elements` (air/int/0, earth/con/2, fire/cha/0, water/str/0, wood/wis/0); `staticPowers.automation` `destiny`, `statuesque`, `perfection` no Paragon e `bloodQuickening` no Dragonblooded, `none` nos demais; estado zerado (`powerStat.value` 1, `resource.spent` 0, `round`, `scene`, `pressure.spent` 0, `selection` vazio); `description`, `tell` e cada `powers[].description` não vazios; `effects` vazio; `_id` `/^[A-Za-z0-9]{16}$/` único e `_key === "!items!" + _id`

### Implementation for User Story 1

- [X] T011 [P] [US1] Criar `src/packs/exaltations/atlantean.json`, `chosen.json` e `daemonhost.json` no formato de data-model.md ("Fontes dos compêndios"): `type: "exaltation"`, `img` de `icons/svg/*.svg` do core, dados mecânicos da Tabela de referência, `resource.actions` conforme a coluna "Recuperação" (Atlantean `[{ type: "unravel" }]`; Chosen `[{ type: "restoreAll" }]`; Daemonhost `[{ type: "unravel" }]`), descrições em HTML com **resumo em inglês de redação própria** (2–4 frases por poder; sem sequência de 6+ palavras igual ao livro — FR-009), `tell` e `lore` (origem, aparência, sociedade, exemplos) resumidos; conferir no PDF a ordem dos 5 poderes (pp. 68, 72, 76)
- [X] T012 [P] [US1] Criar `src/packs/exaltations/dragonblooded.json`, `paragon.json` e `promethean.json` com as mesmas regras de T011: Dragonblooded `breath`, `[{ type: "restoreAll" }]`, 5 `elements` com os efeitos de texto de cada elemento; Paragon `actionPoints`, `pressure.enabled: true`, `[{ type: "restoreAll" }, { type: "regain", amount: "1" }]` (1d10 ajustado à mão) e automações Destiny/Statuesque/Perfection nos poderes estáticos; Promethean `pyros`, `healing: "never"`, `[{ type: "regain", amount: "1" }]`; conferir pp. 80, 84, 88
- [X] T013 [P] [US1] Criar `src/packs/exaltations/vampire.json`, `werewolf.json` e `wraith.json` com as mesmas regras de T011: Vampire `vitae`, `actions: []` (só ajuste manual; recuperação cita "1 Vitae per day"); Werewolf `rage`, `healing: "anytime"`, `[{ type: "regain", amount: "powerStat" }]`, Shifting descrevendo Wolf form e Warform; Wraith `plasm`, `[{ type: "regain", amount: "2" }, { type: "lose", amount: "1" }]`; conferir pp. 92, 96, 100
- [X] T014 [US1] Rodar `npm test` (T010 deve passar) e `npm run build:packs` com o Foundry fechado; conferir `packs/exaltations/`
- [X] T015 [P] [US1] Criar `templates/item/exaltation-sheet.hbs` conforme contracts/foundry-api.md ("ExaltationSheet"): cabeçalho (imagem `data-action="editImage"`, nome, fonte/página); aviso de compêndio bloqueado (`lockedPackHint`, como `race-sheet.hbs`); seção Power Stat & Resource (nome do Power Stat, `<select>` de teto, recurso, `<select>` de fórmula, `fixedMax` só com `fixed`, dívida, cura, Pressure, lista de ações add/remove, editor da recuperação); Static Powers (lista add/remove: nome, automação, editor); Powers by Rank (5 linhas fixas: nome, editor); Elements (só se houver); The Tell (editor + tabela fixa dos níveis 1 / 2–3 / 4–5 / 6+ da p. 65); Description e Lore; em somente leitura, texto formatado (fórmula por extenso, ações como rótulos)
- [X] T016 [US1] Implementar `module/apps/exaltation-sheet.mjs` (`ExaltationSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)`), no padrão de `module/apps/race-sheet.mjs`: `DEFAULT_OPTIONS` (`classes: ["dtd40k", "sheet", "item", "exaltation"]`, `position.width: 720`, `submitOnChange`, `resizable`), ações `addStaticPower`/`removeStaticPower`/`addElement`/`removeElement`/`addResourceAction`/`removeResourceAction`; `_prepareContext` com descrições enriquecidas (`foundry.applications.ux.TextEditor.implementation.enrichHTML`) e `lockedPackHint`; `_processFormData` reconstruindo as listas (`staticPowers`, `powers`, `elements`, `resource.actions`) a partir dos campos indexados e `lore.examples` de texto separado por vírgula
- [X] T017 [US1] Generalizar o aviso de compêndio bloqueado: nova chave `DTD.Item.LockedPackHint` com `{pack}` e `{option}`; `module/apps/race-sheet.mjs` passa a usá-la (texto da 002 preservado para Races) e `ExaltationSheet` também
- [X] T018 [US1] Registrar em `dtd40k.mjs`: `registerSheet(Item, "dtd40k", ExaltationSheet, { types: ["exaltation"], makeDefault: true, label: "DTD.Sheet.Exaltation" })`
- [X] T019 [P] [US1] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Sheet.Exaltation`, `DTD.Item.LockedPackHint` e `DTD.Exaltation.{Exaltation, PowerStat, Resource, FixedMax, Recovery, Debt, Pressure, StaticPowers, Powers, Rank, Elements, Element, Tell, Tell.level1–4, Lore.origin, Lore.appearance, Lore.society, Lore.examples, Source, Page, Healing}` (ficha)
- [X] T020 [P] [US1] Estilos da ficha da exaltação em `styles/dtd40k.css` (`.dtd40k.item.exaltation`): tabela de 5 poderes, listas editáveis, tabela da Tell; legível nos temas claro e escuro do v13 com as variáveis do tema
- [ ] T021 [US1] Validar manualmente quickstart.md passos 1–3 e 5 (parte exaltação) e registrar em "Registro de validação" de `specs/004-exaltation-compendium/quickstart.md` (incluir a revisão SC-006 das 9 exaltações)

**Checkpoint**: compêndio Exaltations utilizável como referência (MVP)

---

## Phase 4: User Story 2 - Consultar os Exalted Assets no compêndio (Priority: P2)

**Goal**: compêndio "Exalted Assets" com os 75 assets em 10 pastas e ficha do feat

**Independent Test**: quickstart passos 1 (assets), 4 e 5 (parte asset)

### Tests for User Story 2 ⚠️

- [X] T022 [P] [US2] Acrescentar em `tests/unit/packs.test.mjs` o bloco "exalted-assets compendium source (SC-002)": lê `src/packs/exalted-assets/*.json`; separa `!folders!` (exatamente 10, `type: "Item"`, um por `ASSET_GROUPS`) e `!items!` (exatamente 75, `type: "feat"`, `category: "exaltedAsset"`); contagem por `group` = atlanteanCaste 5, chosenMark 21, daemonhostSin 5, dragonbloodedBloodline 5, paragon 4, paragonRacial 15, prometheanMaterial 5, vampireClan 5, werewolfTribe 5, wraithHaunting 5; nomes por grupo iguais à tabela da spec; `folder` de cada feat aponta para a pasta do seu grupo; `xpCost === 100`; `prerequisites.exaltation` ∈ nomes das 9 exaltações e coerente com o grupo; os 15 `paragonRacial` com `prerequisites.race` ∈ nomes do pack `src/packs/races` (nenhum Tiefling) e Warboss → "Ork", Multiclass → "Human"; os 21 `chosenMark` com `prerequisites.deity` não vazio; `automation` = actionHero/extraAction/bloodOfIo/warboss/longbeard/markOfNurgle/sloth/elusive exatamente em Action Hero, Extra Action, Blood of Io, Warboss, Longbeard, Mark of Nurgle, Sloth, Elusive e `none` nos demais; `source.page` na faixa do grupo (211–223); `description` não vazio; `_id`/`_key` válidos e únicos

### Implementation for User Story 2

- [X] T023 [P] [US2] Criar as 10 pastas `src/packs/exalted-assets/folder-<group>.json` (`_key: "!folders!<_id>"`, `name` "Atlantean Castes", "Chosen Marks", "Daemonhost Sins", "Dragonblooded Bloodlines", "Paragon Assets", "Paragon Racial Assets", "Promethean Materials", "Vampire Clans", "Werewolf Tribes", "Wraith Hauntings", `type: "Item"`, `sorting: "a"`, `color: null`) — pasta **plana**, sem subdiretórios (research R9)
- [X] T024 [P] [US2] Criar os assets Atlantean (5), Daemonhost (5), Dragonblooded (5) e Promethean (5) em `src/packs/exalted-assets/<group-slug>-<slug>.json` (ex. `atlantean-dawn-caste.json`): `type: "feat"`, `folder` = `_id` da pasta, `system` com `category`, `group`, `prerequisites.exaltation`, `xpCost: 100`, `automation` (Blood of Io `bloodOfIo`; Sloth `sloth`), `source.page`, `description` em inglês de redação própria; Adamic Dragon descreve as 3 variantes Metal/Void/Heart; conferir pp. 211, 215, 216, 220
- [X] T025 [P] [US2] Criar os 21 Chosen Marks (`chosen-mark-of-<deity>.json`) com `prerequisites.deity` e os 4 Paragon Assets (`paragon-<slug>.json`; Action Hero `actionHero`, Extra Action `extraAction`); texto completo vence o resumo tabular (Mark of Order = Proven 3; Bahamut e Tiamat conforme o texto); conferir pp. 212–214, 217
- [X] T026 [P] [US2] Criar os 15 Paragon Racial Assets (`paragon-racial-<slug>.json`) com `prerequisites.exaltation: "Paragon"` e `prerequisites.race` = nome exato da raça do pack Races; Warboss `warboss`, Longbeard `longbeard`, Elusive `elusive`; Inner Dragon com claw 2k3 R (texto completo); conferir pp. 218–219
- [X] T027 [P] [US2] Criar os assets Vampire (5), Werewolf (5) e Wraith (5) (`vampire-<clan>.json`, `werewolf-<tribe>.json`, `wraith-children-of-<x>.json`); conferir pp. 221–223
- [X] T028 [US2] Rodar `npm test` (T022 deve passar) e `npm run build:packs`; abrir o compêndio e confirmar as 10 pastas
- [X] T029 [P] [US2] Criar `templates/item/feat-sheet.hbs`: cabeçalho, aviso de compêndio bloqueado, categoria, grupo, exaltação/raça (só `paragonRacial`)/divindade (só `chosenMark`) exigidas, XP, automação e descrição; somente leitura com texto formatado
- [X] T030 [US2] Implementar `module/apps/feat-sheet.mjs` (`FeatSheet`, padrão de `race-sheet.mjs`, `classes: ["dtd40k", "sheet", "item", "feat"]`, `position.width: 560`) e registrar em `dtd40k.mjs` com `types: ["feat"]`, `label: "DTD.Sheet.Feat"`
- [X] T031 [P] [US2] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Sheet.Feat`, `DTD.Asset.{Assets, Exaltation, Race, Deity, XpCost, Group, Category, Automation}`
- [X] T032 [P] [US2] Estilos da ficha do feat em `styles/dtd40k.css` (`.dtd40k.item.feat`)
- [ ] T033 [US2] Validar manualmente quickstart.md passos 1 (assets), 4 e 5 (parte asset) e registrar em `specs/004-exaltation-compendium/quickstart.md` (revisão SC-006 dos 75 assets)

**Checkpoint**: os dois compêndios de consulta prontos

---

## Phase 5: User Story 3 - Aplicar a exaltação ao personagem (Priority: P3)

**Goal**: arrastar a exaltação aplica Power Stat, máximo do recurso, poderes liberados e as escolhas
do Paragon (Destiny, Statuesque) e do Dragonblooded; troca e remoção limpas

**Independent Test**: quickstart passos 6–10, 12, 13 (sem asset) e 26; Perfection (passo 11,
asset racial) entra na US5 (depende do compêndio de assets e dos efeitos de asset)

### Tests for User Story 3 ⚠️

- [X] T034 [P] [US3] Escrever `tests/unit/exaltation.test.mjs` (parte US3) com os casos obrigatórios de contracts/rules-api.md: `powerStatMax` (`level` 1 → 1; `levelAndDevotion` Level 5, Devotion 5 → 3; Devotion 3 → 2; Level 0 → 1); `effectivePowerStat(4, 3)` → 3, `(0, 3)` → 1; `resourceMax` das 10 fórmulas com os exemplos (Traya Rage 7; Werewolf Level 3, PS 3 → 9; Motes 11; Favor 8; Essence 7; Breath 4; AP 3; Pyros 6; Vitae 5; Plasm 7; `fixed` 4) e com `resourcePerPowerStat` 1 (Breath 5) e `resourceBonus` 2; `resourceValue(7, 9)` → 0; `unlockedPowers` (PS 1 → só rank 1; PS 3 → 1–3); `statuesqueOptions` (sem raça → 9; Human com `choice.characteristic = "cha"` → 8 sem `cha`; Eldarin `wis`/`int` com `wis` → `["int"]`); `needsSelection`; `validateExaltationSelection` (`statuesque` fora das opções; `element` `"lava"`); `buildExaltationEffects` Paragon + `int` → `destiny` (`system.heroPoints.max`, mode 2, `"2"`) e `statuesque` (`system.characteristics.int.value`, mode 2, `"1"`); Dragonblooded + `earth` → `element` (`system.characteristics.con.value` +1) e `element.hp` (`system.modifiers.hpMax` +2); + `fire` → só `element` (cha); Werewolf → `[]`; `computeExaltation` da Traya devolve a forma de data-model.md
- [X] T035 [P] [US3] Acrescentar em `tests/unit/derived.test.mjs`: `modifiers.hpMax` 2 com Con 3, Wil 3 → HP 14; override do Mestre em `hpMax` continua vencendo; sem `modifiers.hpMax` → fórmula inalterada (testes da 001/002 sem mudança)

### Implementation for User Story 3

- [X] T036 [US3] Implementar `module/rules/exaltation.mjs` (PURO, sem globais do Foundry; importa `ADD`/`OVERRIDE` e `characteristicOptions` de `./race.mjs`): `powerStatMax`, `effectivePowerStat`, `resourceMax`, `resourceValue`, `unlockedPowers`, `statuesqueOptions`, `needsSelection`, `validateExaltationSelection`, `buildExaltationEffects` (retorna `{ exalted, changes, label }[]`, valores como string; lança erro com escolha inválida) e `computeExaltation(exaltation, stats, mods, { currentMarker })` (por ora sem rodada/Tell/Pressure — completados na US4); fazer T034 passar
- [X] T037 [US3] Em `module/rules/derived.mjs`: `modifiers.hpMax = 0` somado a `2×(Con + Wil)` antes de `applyMod` (JSDoc atualizado); fazer T035 passar
- [X] T038 [US3] Em `module/data/character-data.mjs`: acrescentar a `modifiers` os campos `hpMax: integer(0)` e `exaltation: new SchemaField({ resourceBonus: integer(0), resourcePerPowerStat: integer(0) })` (comentário "targets of exaltation/asset effects only — never sheet inputs", research R6); no fim de `prepareDerivedData`, `this.exaltation = item ? computeExaltation(item.system, { characteristics, level, devotion: this.devotion.value, resolveMax: this.resolve.max }, this.modifiers.exaltation, { currentMarker }) : null`, com o item obtido de `this.parent.items` (tipo `exaltation`) e `currentMarker` = `game.combat?.started ? \`${game.combat.id}:${game.combat.round}\` : "none"` (research R2/R4)
- [X] T039 [US3] Em `module/documents/item.mjs` `DtdItem#_preCreate`: recusar uma segunda `exaltation` no mesmo ator com `ui.notifications.warn(game.i18n.localize("DTD.Exaltation.OnlyOne"))` e `return false`, no mesmo bloco da regra da raça
- [X] T040 [P] [US3] Criar `templates/dialog/exaltation-choice.hbs`: radios do Statuesque (opções de `statuesqueOptions`, rótulos localizados) ou dos elementos (nome, característica, resumo), pré-marcando a escolha atual ao reconfigurar
- [X] T041 [US3] Implementar `module/documents/exaltation-service.mjs` (parte US3) conforme contracts/foundry-api.md ("Serviços"): `getExaltation`; `promptExaltationSelection` (`DialogV2.wait`, valida e reabre com aviso `DTD.Exaltation.InvalidChoice`); `applyExaltation(actor, item)` (não `character` → `DTD.Exaltation.NotCharacter`; já tem exaltação → `DialogV2.confirm` `DTD.Exaltation.ReplaceConfirm`; escolha se `needsSelection`; monta dados com estado zerado — `powerStat.value` 1, `resource.spent` 0, `round { spent: 0, marker: "none" }`, `scene.spent` 0, `pressure.spent` 0 — e `effects` de `buildExaltationEffects` com `transfer: true`, `origin`, nome i18n `DTD.Exaltation.Effect.*` e `flags.dtd40k.exalted`; valida com `validate({ strict: true })` antes de apagar; apaga exaltação atual **e** os feats `exaltedAsset` com `prerequisites.exaltation` = nome dela; cria; Paragon: `heroPoints.value += 2`); `reconfigureExaltation` (troca só os efeitos `exalted` e `selection`); `removeExaltation` (confirmação `DTD.Exaltation.RemoveConfirm`; apaga o item e os assets ligados); `setPowerStat(actor, value)` (clamp 1..`system.exaltation.powerStat.max`, grava no item); após apagar, `heroPoints.value = min(value, max)`
- [X] T042 [US3] Criar `module/apps/exaltation-context.mjs`: `prepareExaltationContext(actor)` → `null` sem exaltação; senão nome, img, id, `needsSelection`, escolha localizada (Statuesque/elemento), Power Stat (nome, valor, teto, pontos 1–10 com `filled`/`disabled` acima do teto), recurso (`value / max`, nome), poderes estáticos e os 5 poderes com `unlocked` e descrições enriquecidas, efeitos `exalted` (`id`, `name`, `active`)
- [X] T043 [US3] Em `module/apps/character-sheet.mjs`: `_onDropItem` desvia `exaltation` de fora do ator para `applyExaltation` (como a raça); `_prepareContext` expõe `exaltation: await prepareExaltationContext(actor)`; ações `openExaltation`, `reconfigureExaltation`, `removeExaltation`, `setPowerStat` (`data-value`), `toggleExaltationEffect` (só Mestre) e `showExaltationInfo` (DialogV2 com `templates/dialog/exaltation-info.hbs`: descrição, Tell, ambientação, texto completo e fonte)
- [X] T044 [P] [US3] Criar `templates/actor/parts/exaltation.hbs` (partial incluída em `traits.hbs` abaixo do cartão da raça e adicionada a `CharacterSheet.PARTIALS`) e `templates/dialog/exaltation-info.hbs`: sem exaltação → `DTD.Exaltation.DropHint`; cartão com cabeçalho ("i", reconfigurar, remover só donos), Power Stat em pontos, recurso `atual / máximo`, poderes estáticos, tabela dos 5 poderes (liberado/bloqueado com "ponto N") e modificadores com caixa só do Mestre
- [X] T045 [US3] Em `templates/actor/parts/header.hbs`: "Exaltation: <nome>" (`data-action="openExaltation"`) ou "—" na linha de identidade
- [X] T046 [P] [US3] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Exaltation.{None, DropHint, ChooseTitle, ChooseStatuesque, ChooseElement, Confirm, Reconfigure, Remove, RemoveConfirm, ReplaceConfirm, NotCharacter, OnlyOne, InvalidChoice, Locked, Unlocked, Info, Modifiers, ModifiersHint, Effect.destiny, Effect.statuesque, Effect.element, Effect.elementHp}`
- [X] T047 [P] [US3] Estilos em `styles/dtd40k.css`: cartão da exaltação na aba Traits, pontos do Power Stat (teto destacado, acima do teto esmaecido), poderes bloqueados esmaecidos, janela de escolha
- [ ] T048 [US3] Validar manualmente quickstart.md passos 6–10, 12, 13 (sem asset) e 26 e registrar em `specs/004-exaltation-compendium/quickstart.md`

**Checkpoint**: exaltação aplicável, trocável e removível; sempre uma por personagem

---

## Phase 6: User Story 4 - Usar o recurso e a Tell em jogo (Priority: P4)

**Goal**: gastar, recuperar e ajustar o recurso; limite por rodada; Tell por cena; dívida;
Pressure do Paragon

**Independent Test**: quickstart passos 14–20

### Tests for User Story 4 ⚠️

- [X] T049 [P] [US4] Acrescentar em `tests/unit/exaltation.test.mjs` (parte US4): `roundSpent(2, "c1:3", "c1:4")` → 0 e `("c1:3", "c1:3")` → 2; `tellLevel` 0→0, 1→1, 2→2, 3→2, 4→3, 5→3, 6→4, 9→4; `spendCheck` (`value 0` → `empty`; `roundSpent 2, ps 2` → `overLimit`; senão `ok`); `applyResourceAction` (`restoreAll` → 0; `regain "powerStat"` spent 6, PS 3 → 3; `regain "2"` spent 1 → 0; `unravel` spent 2 → 1; `lose "1"` com spent = max → inalterado); `pressureMax(1, true)` → 5, `(3, false)` → `null`; `computeExaltation` com dívida (Atlantean spent 2 → `debt 2`, `debtName "Paradox"`), `roundFull`, `tell.level` e `pressure { max, value }`
- [X] T050 [US4] Completar `module/rules/exaltation.mjs`: `roundSpent`, `tellLevel`, `spendCheck`, `applyResourceAction`, `pressureMax` e os campos `debt`, `roundSpent`, `roundLimit`, `roundFull`, `tell`, `pressure`, `healing` de `computeExaltation`; fazer T049 passar
- [X] T051 [US4] Completar `module/documents/exaltation-service.mjs`: `spendResource` (`spendCheck`: `empty` → aviso `DTD.Exaltation.Empty`; `overLimit` → `DialogV2.confirm` `DTD.Exaltation.RoundLimit`; grava `resource.spent + 1`, `scene.spent + 1` e `round` = `{ spent: roundSpent + 1, marker: currentMarker }`), `recoverResource(actor, index)`, `adjustResource(actor, value)` (spent = max − clamp(value, 0, max)), `resetRound`, `newScene` (zera `scene.spent`, `round.spent` e `pressure.spent`), `spendPressure(actor, n)` (limitado ao disponível) e `regainPressure(actor, amount)` (`5` ou `"powerStat"`)
- [X] T052 [US4] Em `dtd40k.mjs`: hook `updateCombat` que, quando `round` ou `turn` mudam, re-renderiza as `CharacterSheet` abertas (`foundry.applications.instances`) dos atores combatentes, **sem gravar nada** (research R4)
- [X] T053 [US4] Estender `module/apps/exaltation-context.mjs` e `templates/actor/parts/exaltation.hbs`: botões `spendResource`, um por `resource.actions` (`recoverResource`, `data-index`, rótulo `DTD.Exaltation.Action.*` com o valor; `unravel` usa o `debtName`), input `adjustResource`, dívida, rodada `n / PS` com `resetRound`, `newScene`, Tell (nível `DTD.Exaltation.Tell.level<n>` + descrição da exaltação), Pressure (`spendPressure` com input N, `regainPressure` +5 e +PS) e a lista de gastos genéricos (`GENERIC_SPENDS`) com a cura conforme `healing` (`never` oculta; `anytime` com nota)
- [X] T054 [US4] Registrar em `module/apps/character-sheet.mjs` as ações `spendResource`, `recoverResource`, `adjustResource`, `resetRound`, `newScene`, `spendPressure`, `regainPressure` (todas exigem `actor.isOwner`; `adjustResource` e `spendPressure` leem o input vizinho, sem passar pelo formulário do ator)
- [X] T055 [P] [US4] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Exaltation.{Spend, Adjust, Round, ResetRound, RoundLimit, NewScene, Empty, Tell.level0, SpendPressure, RegainPressure, GenericSpends, Spend.heal, Spend.skill, Spend.reaction, Spend.stunned, Spend.dazed}` (Tell nível 1 com "Perception + Wisdom TN 20")
- [X] T056 [P] [US4] Estilos em `styles/dtd40k.css`: barra do recurso, dívida, indicador da Tell por nível (cores distintas nos dois temas), Pressure, lista de gastos genéricos
- [ ] T057 [US4] Validar manualmente quickstart.md passos 14–20 e registrar em `specs/004-exaltation-compendium/quickstart.md`

**Checkpoint**: exaltação usável na mesa

---

## Phase 7: User Story 5 - Adicionar Exalted Assets ao personagem (Priority: P5)

**Goal**: assets validados e aplicados, com efeitos automatizados, limite de um (exceto Paragon) e
Perfection do Paragon

**Independent Test**: quickstart passos 11, 13 (com asset), 21–25 e 27

### Tests for User Story 5 ⚠️

- [X] T058 [P] [US5] Escrever `tests/unit/asset.test.mjs` conforme contracts/rules-api.md: `countsTowardLimit` (paragon/paragonRacial false; demais true); `validateAssetAdd` na ordem `noExaltation` → `wrongExaltation` → `wrongRace` → `duplicate` → `limit`, com os casos Blood of Io válido, + Double Dragon `limit`, Paragon com Extra Action + Action Hero válidos, Mark of Khorne em Werewolf `wrongExaltation`, Warboss em Paragon Elf `wrongRace`, sem exaltação `noExaltation`; `buildAssetEffects` para as 8 automações (tabela de research R6: Warboss `system.size` ADD `"1"` com `priority: 60`; Elusive `system.modifiers.staticDefenseSize` OVERRIDE `"false"`; Blood of Io `system.modifiers.exaltation.resourcePerPowerStat` ADD `"1"`; …) e `none` → `[]`; `perfectionAsset` ("Human" → Multiclass; "Tiefling" → `null`)
- [X] T059 [P] [US5] Acrescentar em `tests/unit/derived.test.mjs`: `modifiers.staticDefenseSize = false` → Halfling Shifty Dex 3, Size 2 → SD 28 e fórmula padrão sem −2×Size; `true`/ausente → fórmulas inalteradas

### Implementation for User Story 5

- [X] T060 [US5] Implementar `module/rules/asset.mjs` (PURO): `countsTowardLimit`, `validateAssetAdd`, `buildAssetEffects` (`{ asset, changes, label, priority? }[]`) e `perfectionAsset`; fazer T058 passar
- [X] T061 [US5] Em `module/rules/derived.mjs`: `modifiers.staticDefenseSize = true`; quando `false`, remover o termo −2×Size das duas fórmulas de Static Defense; em `module/data/character-data.mjs`, acrescentar `modifiers.staticDefenseSize: new BooleanField({ initial: true })`; fazer T059 passar
- [X] T062 [US5] Implementar `module/documents/asset-service.mjs` conforme contracts/foundry-api.md: `getExaltedAssets(actor)`; `addExaltedAsset(actor, item, { granted } = {})` (não `character` → aviso; `validateAssetAdd` com exaltação e raça atuais; falha → `ui.notifications.warn(DTD.Asset.Error.<error>)` e, se `game.user.isGM`, `DialogV2.confirm` `DTD.Asset.GMOverride` para incluir mesmo assim; cria o feat com `effects` de `buildAssetEffects` — `transfer: true`, `origin`, nome i18n `DTD.Asset.Effect.*`, `flags.dtd40k.asset`, `priority` quando houver — e `flags.dtd40k.grantedBy = "perfection"` quando `granted`; sem `granted`, aviso informativo `DTD.Asset.CreationOnly`; Action Hero: `heroPoints.value += 1`); `removeExaltedAsset(actor, itemId)` (confirmação; depois clamp de Hero Points)
- [X] T063 [US5] Em `module/documents/exaltation-service.mjs`: `syncPerfection(actor)` — sem efeito se a exaltação não tem poder estático `perfection`; remove o feat com `grantedBy: "perfection"` cuja raça não é mais a do personagem; busca no pack `dtd40k.exalted-assets` (`game.packs.get(...).getDocuments({ type: "feat" })`) o `perfectionAsset` da raça atual e o adiciona com `addExaltedAsset(actor, asset, { granted: true })`; sem raça ou sem asset → aviso informativo `DTD.Exaltation.NoRace`/`NoPerfectionAsset`; se a `selection.statuesque` ficou fora de `statuesqueOptions`, chamar `reconfigureExaltation`. Chamar `syncPerfection` no fim de `applyExaltation`
- [X] T064 [US5] Em `module/documents/race-service.mjs`: no fim de `applyRace` (após criar a raça) e de `removeRace` (após confirmar e apagar), `await syncPerfection(actor)` (import de `exaltation-service.mjs`; sem efeito para quem não é Paragon)
- [X] T065 [US5] Em `module/apps/character-sheet.mjs`: `_onDropItem` desvia `feat` com `system.category === "exaltedAsset"` de fora do ator para `addExaltedAsset`; `_prepareContext` expõe a lista de assets (nome, grupo localizado, resumo enriquecido, efeitos `asset` com caixa do Mestre); ações `openAsset`, `removeAsset`, e `toggleExaltationEffect` passa a aceitar efeitos de asset (`data-item-id`)
- [X] T066 [P] [US5] Criar `templates/actor/parts/assets.hbs` (partial incluída em `traits.hbs` após o cartão da exaltação e em `CharacterSheet.PARTIALS`): lista de Exalted Assets (nome → ficha, grupo, resumo, modificadores, remover só donos) e dica de arrastar do compêndio
- [X] T067 [P] [US5] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Asset.{Remove, RemoveConfirm, DropHint, CreationOnly, GMOverride, Error.noExaltation, Error.wrongExaltation, Error.wrongRace, Error.duplicate, Error.limit, Effect.<8 automações>}` e `DTD.Exaltation.{NoRace, NoPerfectionAsset}`
- [X] T068 [P] [US5] Estilos em `styles/dtd40k.css`: lista de assets na aba Traits
- [ ] T069 [US5] Validar manualmente quickstart.md passos 11, 13 (com asset), 21–25 e 27 e registrar em `specs/004-exaltation-compendium/quickstart.md`

**Checkpoint**: criação de personagem completa com exaltação e assets

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T070 Propor via `/speckit-constitution` a emenda PATCH do princípio VI (Wraith e Dragonblooded, do cap. 5 da 7.7a, entram na Fase 1, como as 4 raças do Book 2) — pendência do Constitution Check do plan.md
- [X] T071 [P] Atualizar `docs/analise-dtd.md` §6 (Exaltações) para a 7.7a: páginas, ordem dos poderes (Werewolf, Chosen Overbeing), Pressure 5×Excellence, contagem de 75 assets
- [X] T072 [P] Atualizar `README.md` (recursos: compêndios Exaltations e Exalted Assets, aplicação na ficha)
- [X] T073 Rodar `npm run lint` e `npm test` sem erros; corrigir o que aparecer
- [ ] T074 Rodar o quickstart.md completo (passos 1–28) num mundo limpo, incluindo o passo 28 (observador), e registrar o resultado final; conferir o console (F12) sem erros nem avisos de API depreciada
- [X] T075 Rodar `graphify update .` para atualizar o grafo de conhecimento (constituição, fluxo de desenvolvimento)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → histórias
- **US1 (P1)** e **US2 (P2)**: dependem só da Phase 2; podem seguir em paralelo (arquivos de pack
  distintos; compartilham `lang/*.json`, `styles/dtd40k.css` e `packs.test.mjs`)
- **US3 (P3)**: depende da Phase 2; usa o pack da US1 para o teste manual
- **US4 (P4)**: depende da US3 (serviço, contexto e cartão da exaltação)
- **US5 (P5)**: depende da US3 (exaltação aplicada) e da US2 (compêndio de assets para Perfection)
- **Polish**: depois das histórias desejadas

### Within Each User Story

- Testes primeiro (devem falhar) → regras puras → modelo/serviço → ficha/templates → i18n/estilos →
  validação manual

### Parallel Opportunities

- Setup: T002 e T003 em paralelo
- Foundational: T004, T006, T007 e T009 em paralelo; T005 antes de T006/T007 rodarem os testes
- US1: T010–T013 em paralelo; T015, T019 e T020 em paralelo
- US2: T022–T027 em paralelo; T029, T031 e T032 em paralelo
- US3: T034, T035 e T040 em paralelo; T044, T046 e T047 em paralelo
- US4: T049 em paralelo com T052; T055 e T056 em paralelo
- US5: T058 e T059 em paralelo; T066, T067 e T068 em paralelo

---

## Parallel Example: User Story 1

```text
# Teste e dados em paralelo:
Task: "T010 [US1] tests/unit/packs.test.mjs (exaltations)"
Task: "T011 [US1] src/packs/exaltations/atlantean.json, chosen.json, daemonhost.json"
Task: "T012 [US1] src/packs/exaltations/dragonblooded.json, paragon.json, promethean.json"
Task: "T013 [US1] src/packs/exaltations/vampire.json, werewolf.json, wraith.json"

# Ficha da exaltação em paralelo:
Task: "T015 [US1] templates/item/exaltation-sheet.hbs"
Task: "T019 [US1] lang/en.json, lang/pt-BR.json"
Task: "T020 [US1] styles/dtd40k.css"
```

## Parallel Example: User Story 2

```text
Task: "T023 [US2] folder-*.json"
Task: "T024 [US2] assets Atlantean, Daemonhost, Dragonblooded, Promethean"
Task: "T025 [US2] Chosen Marks e Paragon Assets"
Task: "T026 [US2] Paragon Racial Assets"
Task: "T027 [US2] assets Vampire, Werewolf, Wraith"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 (US1): compêndio + ficha da exaltação
3. **Parar e validar**: quickstart passos 1–3 e 5; o compêndio já serve de referência na criação

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → compêndio de exaltações (MVP)
3. US2 → compêndio de assets
4. US3 → aplicar a exaltação no personagem
5. US4 → recurso, Tell e Pressure em jogo
6. US5 → assets no personagem e Perfection
7. Cada história validada pelo quickstart antes de seguir

### Coordenação com branches paralelas

- A `002-race-compendium` segue aberta e é a base deste worktree: rebasear/mesclar a 004 depois que
  a 002 entrar na `main`. A 004 altera `race-service.mjs` (T064), `derived.mjs` (T037, T061),
  `item.mjs` (T039) e `race-sheet.mjs` (T017).
- A `003-rules-7-7a-alignment` (outro worktree) pode mexer em `derived.mjs`, `lang/*.json` e
  `styles/dtd40k.css`; resolver conflitos no merge preservando as duas mudanças.

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Commits no padrão Conventional Commits, um por tarefa ou grupo lógico
- Nunca editar `packs/` à mão; sempre `npm run build:packs` a partir de `src/packs/`
- Descrições dos compêndios: resumo próprio em inglês; nunca colar texto do PDF (constituição V)
- Inputs da ficha nunca gravam valores com efeito no `_source` (002 R3); Power Stat e recurso são
  gravados no item por ações, não pelo formulário do ator

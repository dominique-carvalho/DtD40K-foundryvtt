---

description: "Task list for 002-race-compendium"
---

# Tasks: Compêndio de Raças (DtD 7.7a)

**Input**: Design documents from `specs/002-race-compendium/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md,
contracts/foundry-api.md, quickstart.md

**Tests**: incluídos — a constituição (princípio III) exige Vitest para todo módulo puro
(`module/rules/**`, `module/config.mjs`); os dados do compêndio também têm teste (SC-001).
Escrever os testes antes da implementação e confirmar que falham. UI/integração: roteiro manual
do quickstart.md.

**Organization**: tarefas agrupadas por história (US1 compêndio e ficha da raça, US2 aplicar no
personagem, US3 poderes raciais).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1, US2, US3)
- Caminhos relativos à raiz do repositório (a raiz é a pasta do sistema Foundry)
- Fonte de regras: spec.md "Tabela de referência" (DtD 7.7a pp. 31–61; originalmente 1.6 pp. 28–50)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ferramental de build do compêndio e manifesto

- [X] T001 Adicionar a devDependency `@foundryvtt/foundryvtt-cli` (`^3.0.4`) e o script `"build:packs": "node scripts/build-packs.mjs"` em `package.json`; rodar `npm install` (atualiza `package-lock.json`)
- [X] T002 [P] Criar `scripts/build-packs.mjs` (ESM, Node): importa `compilePack` de `@foundryvtt/foundryvtt-cli`, compila `src/packs/races` → `packs/races` com `{ log: true }`, remove antes a pasta de destino se existir, e sai com código ≠ 0 em erro (mensagem pedindo para fechar o Foundry se o LevelDB estiver bloqueado)
- [X] T003 [P] Adicionar `packs/` ao `.gitignore` na seção "Foundry VTT" (a saída binária não é versionada — research R8), mantendo as linhas existentes
- [X] T004 [P] Em `eslint.config.mjs`, acrescentar aos globais somente leitura do Foundry: `Item`, `ActiveEffect`, `CONST` (não declarar `TextEditor`: alias obsoleto no v13 — usar `foundry.applications.ux.TextEditor.implementation`); incluir `scripts/**` com `globals.node`
- [X] T005 [P] Em `system.json`: acrescentar `documentTypes.Item.race: { "htmlFields": ["description", "power.description"] }` e `packs: [{ "name": "races", "label": "Races", "path": "packs/races", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }]` (contracts/foundry-api.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: constantes, modelo do item `race` e documento de item usados por todas as histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T006 [P] Acrescentar em `tests/unit/config.test.mjs`: `RACE_POWER_AUTOMATION` é exatamente `["none", "usesPerScene", "heroicHeritage", "shifty", "squatToughness"]`; `MAX_RATING === 6`; ambos exportados em `DTD`
- [X] T007 Em `module/config.mjs` (PURO): exportar `RACE_POWER_AUTOMATION` e `MAX_RATING = 6` e incluí-los no objeto `DTD`; fazer T006 passar
- [X] T008 Criar `module/data/race-data.mjs` (`RaceData extends foundry.abstract.TypeDataModel`) com `defineSchema()` exatamente conforme data-model.md: `description` HTMLField; `source.book` string "padrão `\"DtD 1.6\"`"; `source.page` "inteiro ≥ 1" (nullable, inicial null); `characteristicBonus.options` "lista de chaves de característica, única" (StringField com `choices` = chaves de `CHARACTERISTICS`); `characteristicBonus.any` booleano (inicial false); `skillBonus.skills` "lista de chaves de perícia, única" (`choices` = chaves de `SKILLS`); `skillBonus.choose` "inteiro 0–27" (inicial 0); `size` "inteiro 1–10" (inicial 4); `power.name` string; `power.description` HTMLField; `power.automation` com `choices` = `RACE_POWER_AUTOMATION` e "padrão `\"none\"`"; `power.uses.spent` "inteiro ≥ 0" (inicial 0); `lore.height`, `lore.weight` strings; `lore.languages`, `lore.personality`, `lore.physical`, `lore.names` listas de strings não vazias; `choice.characteristic` "chave de característica ou `\"\"`" (blank permitido); `choice.skills` lista de chaves de perícia. Deduplicar as listas "únicas" em `static migrateData`/`_cleanData` ou validar com `validate` do ArrayField
- [X] T009 Criar `module/documents/item.mjs` (`DtdItem extends Item`), por enquanto sem lógica extra (a regra de uma raça por ator entra na US2)
- [X] T010 Registrar em `dtd40k.mjs` (hook `init`): `CONFIG.Item.documentClass = DtdItem`, `CONFIG.Item.dataModels.race = RaceData`
- [X] T011 [P] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `TYPES.Item.race` ("Race"/"Raça") e `DTD.Race.Automation.{none,usesPerScene,heroicHeritage,shifty,squatToughness}` ("Text only"/"Só texto", "Uses per scene"/"Usos por cena", "Heroic Heritage", "Shifty", "Squat Toughness")

**Checkpoint**: o sistema carrega no v13 e permite criar um Item "Raça" no diretório de itens (ficha padrão do core), sem erros no console

---

## Phase 3: User Story 1 - Consultar as raças do livro no compêndio (Priority: P1) 🎯 MVP

**Goal**: compêndio "Races" com as 12 raças do livro base e ficha própria da raça

**Independent Test**: abrir o compêndio Races, conferir as 12 raças e comparar cada uma com a
Tabela de referência (quickstart passos 1–5)

### Tests for User Story 1 ⚠️

- [X] T012 [P] [US1] Escrever `tests/unit/packs.test.mjs` conforme contracts/rules-api.md: lê todos os `src/packs/races/*.json` com `node:fs`; exatamente 12 raças com os nomes Aasimar, Dark Eldarin, Dragonborn, Eldarin, Elf, Gnome, Halfling, Human, Ork, Squat, Tau, Tiefling; `_id` casa `/^[A-Za-z0-9]{16}$/` e é único; `_key === "!items!" + _id`; `type === "race"`; tabela esperada embutida no teste com, por raça, `characteristicBonus` (`options`/`any`), `skillBonus` (`skills`/`choose`), `size`, `power.name`, `power.automation`, `source.page` — valores da Tabela de referência da spec (Aasimar wis/con, command+ballistics, 5, "And They Shall Know No Fear", none, 28; Dark Eldarin cha/dex, deceive+forbiddenLore, 3, "Warp Miasma", usesPerScene, 30; Dragonborn str/cha, command+intimidation, 5, "Dragon Breath", usesPerScene, 32; Eldarin wis/int, academicLore+arcana, 3, "Warp Step", usesPerScene, 34; Elf wis/dex, perception+charm, 3, "Elven Accuracy", usesPerScene, 36; Gnome int/fel, crafts+academicLore, 3, "Improvise", none, 38; Halfling int/fel, larceny+deceive, 2, "Shifty", shifty, 40; Human any, choose 2, 4, "Heroic Heritage", heroicHeritage, 42; Ork str/wil, intimidation+scrutiny, 5, "WAAAAAGH!", none, 44; Squat con/wil, crafts+commonLore, 3, "Squat Toughness", squatToughness, 46; Tau int/cmp, commonLore+persuasion, 4, "Fall Back", none, 48; Tiefling dex/con, intimidation+weaponry, 5, "Bloody Minded", none, 50); toda chave existe em `CHARACTERISTICS`/`SKILLS` de `module/config.mjs`; `choice` vazio (`characteristic: ""`, `skills: []`); `description` e `power.description` não vazios; `effects` vazio

### Implementation for User Story 1

- [X] T013 [P] [US1] Criar `src/packs/races/aasimar.json`, `dark-eldarin.json`, `dragonborn.json` e `eldarin.json` no formato de data-model.md ("Fonte do compêndio"): `_id` fixo de 16 caracteres alfanuméricos, `_key: "!items!<_id>"`, `type: "race"`, `img` de `icons/svg/*.svg` do core, `system` com os dados mecânicos da Tabela de referência, `source: { book: "DtD 1.6", page }`, `lore` (altura, peso, idiomas "Trade" + próprio, traços de personalidade e físicos, nomes de exemplo — como listas curtas) e `description`/`power.description` em HTML com **resumo em inglês de redação própria** (2–4 frases; nunca copiar frases do livro — constituição V); para usos por cena, a descrição do poder cita "1/2/3 uses per scene at Level 1/3/5"
- [X] T014 [P] [US1] Criar `src/packs/races/elf.json`, `gnome.json`, `halfling.json` e `human.json` com as mesmas regras de T013; Human com `characteristicBonus: { options: [], any: true }` e `skillBonus: { skills: [], choose: 2 }`; Halfling com o bônus Int/Fel igual ao do Gnome (como no livro, p. 40)
- [X] T015 [P] [US1] Criar `src/packs/races/ork.json`, `squat.json`, `tau.json` e `tiefling.json` com as mesmas regras de T013; normalizar nomes do livro: Squat "Common lore" → `commonLore`, Tiefling "Intimidate" → `intimidation`
- [X] T016 [US1] Rodar `npm test` (T012 deve passar) e `npm run build:packs` com o Foundry fechado; conferir que `packs/races/` foi gerado
- [X] T017 [P] [US1] Criar `templates/item/race-sheet.hbs` conforme contracts/foundry-api.md ("Ficha da raça"): cabeçalho (imagem `data-action="editImage"`, nome, fonte/página), seção Racial Statistics (checkboxes das 9 características + "any"; checkboxes das 27 perícias agrupadas Mental/Físico/Social + número `choose`; Size), seção Racial Power (nome, `<select>` de automação, `<prose-mirror>`/editor HTML da descrição), Description (editor HTML) e Lore (altura, peso e listas como texto separado por vírgula); em modo somente leitura (`!editable`) mostrar texto formatado ("+1 Wisdom or Intelligence", "+1 Academic Lore and Arcana", "any one", "any two") em vez de controles
- [X] T018 [US1] Implementar `module/apps/race-sheet.mjs` (`RaceSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)`): `DEFAULT_OPTIONS` (`classes: ["dtd40k", "sheet", "item", "race"]`, `position.width: 640`, `form.submitOnChange: true`, `window.resizable: true`); `PARTS` com `templates/item/race-sheet.hbs`; `_prepareContext` com listas de características/perícias marcadas, textos resumidos para leitura e descrições enriquecidas via `foundry.applications.ux.TextEditor.implementation.enrichHTML`; `_processFormData` convertendo os campos "separados por vírgula" de `lore.*` em listas (trim, sem vazios) e checkboxes em listas de chaves
- [X] T019 [US1] Registrar em `dtd40k.mjs`: `foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", RaceSheet, { types: ["race"], makeDefault: true, label: "DTD.Sheet.Race" })`
- [X] T020 [P] [US1] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Sheet.Race` e `DTD.Race.{Race, Size, Power, Description, Lore, Height, Weight, Languages, Personality, Physical, Names, Source, Page, AnyCharacteristic, ChooseN, CharacteristicBonus, SkillBonus, Or, And, CommaSeparated}` (nomes de regras do livro ficam em inglês nos dois idiomas)
- [X] T021 [P] [US1] Estilos da ficha da raça em `styles/dtd40k.css` (`.dtd40k.item.race`): grade de checkboxes em 3 colunas, seções com título, legível nos temas claro e escuro do v13 usando as variáveis de cor do tema
- [ ] T022 [US1] Validar manualmente quickstart.md passos 1–5 e registrar em "Registro de validação" de `specs/002-race-compendium/quickstart.md` (incluir a revisão SC-005: nenhuma frase igual ao livro nas 12 descrições)

**Checkpoint**: compêndio Races utilizável como referência (MVP)

---

## Phase 4: User Story 2 - Aplicar a raça ao personagem (Priority: P2)

**Goal**: arrastar a raça para o personagem aplica Size e bônus via Active Effects, com escolha,
troca, remoção e reconfiguração; ficha com abas e valores base/final

**Independent Test**: quickstart passos 6–14 e 20–24

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Escrever `tests/unit/race.test.mjs` (parte US2) conforme contracts/rules-api.md: `characteristicOptions` (Human `any` → 9 chaves; Eldarin → `["wis", "int"]`); `needsChoice` (Eldarin true; raça com uma opção e `choose: 0` false; Human true); `defaultChoice`; `validateRaceChoice` com `error` `"characteristic"` (Ork + `int`), `"skillCount"` (Human + `["pilot"]`), `"skillDuplicate"` (Human + `["pilot", "pilot"]`; ou perícia já fixa), `"skillUnknown"`; `buildRaceEffects` para Eldarin + `wis` → exatamente os efeitos `size` (`system.size`, mode 5, `"3"`), `characteristic` (`system.characteristics.wis.value`, mode 2, `"1"`), `skill.academicLore`, `skill.arcana`, sem `power` quando `automation` é `none`/`usesPerScene`; Human + `cha` + `["pilot", "command"]` → `size` `"4"`, `characteristic`, `skill.pilot`, `skill.command`; lança erro com escolha inválida; `capValue(7)` → `{ value: 6, capped: true }`, `capValue(5)` → `{ value: 5, capped: false }`
- [X] T024 [P] [US2] Acrescentar em `tests/unit/sheet.test.mjs` os casos de contracts/rules-api.md ("sheet.mjs (alteração)"): `buildDots(3, 6, 2)` → pontos 1–2 cheios e não raciais, ponto 3 cheio e `racial`, 4–6 vazios; `buildDots(3)` → nenhum `racial`; `nextBaseValue` com base 2/final 3/clique 3 → 1, base 2/final 3/clique 5 → 4, base 0/final 1/clique 1 → 0, base 6/final 6/clique 6 → 5, base 3/final 3/clique 3 → 2; os testes da 001 continuam passando sem alteração

### Implementation for User Story 2

- [X] T025 [US2] Em `module/rules/sheet.mjs` (PURO): acrescentar o 3º parâmetro `base = value` a `buildDots(value, max = 6, base = value)` (cada ponto ganha `racial: index > base && index <= value`) e a função `nextBaseValue({ base, final, clicked, max = 6 })` = `clamp(nextDotValue(final, clicked) − (final − base), 0, max)`; fazer T024 passar

- [X] T026 [US2] Implementar `module/rules/race.mjs` (PURO, sem globais do Foundry): constantes `ADD = 2`, `OVERRIDE = 5`; `characteristicOptions`, `needsChoice`, `defaultChoice`, `validateRaceChoice`, `buildRaceEffects(race, choice)` (retorna `RacialEffectData[]` com `racial`, `changes` e `label` — valores das changes como string) e `capValue(value, max = MAX_RATING)`; fazer T023 passar
- [X] T027 [US2] Em `module/data/character-data.mjs` `prepareDerivedData`: antes de `computeDerived`, aplicar `capValue` a `characteristics.*.value` e `skills.*.value` e registrar `this.capped` (objeto derivado, ex. `capped["characteristics.wis"] = true`) — FR-015, research R2
- [X] T028 [US2] Em `module/documents/item.mjs` `DtdItem#_preCreate`: se `this.type === "race"` e `this.parent` é um Actor que já tem outro item `race`, `ui.notifications.warn(game.i18n.localize("DTD.Race.OnlyOne"))` e retornar `false` (research R6)
- [X] T029 [P] [US2] Criar `templates/dialog/race-choice.hbs`: radios da característica (opções de `characteristicOptions`, rótulos localizados) e, quando `choose > 0`, checkboxes das 27 perícias agrupadas por grupo com texto "Choose N" (`DTD.Race.ChooseSkills`); pré-marcar a escolha atual ao reconfigurar
- [X] T030 [US2] Implementar `module/documents/race-service.mjs` conforme contracts/foundry-api.md ("Serviço"): `getRace(actor)`; `promptRaceChoice(race, current)` com `foundry.applications.api.DialogV2.wait` (botões confirmar/cancelar; ao confirmar, lê o formulário, valida com `validateRaceChoice` e, se inválido, avisa `DTD.Race.InvalidChoice` sem fechar; cancelar → `null`); `applyRace(actor, raceItem)` (ator não `character` → aviso `DTD.Race.NotCharacter` e `null`; pula o diálogo se `!needsChoice`; monta os dados do item com `system.choice` e `effects` gerados por `buildRaceEffects` com `transfer: true`, `name` localizado por `label` via `DTD.Race.Effect.*`, `img` da raça e `flags.dtd40k.racial`; valida com `new Item.implementation(data, { parent: actor }).validate({ strict: true })` **antes** de apagar a raça atual — falha → aviso `DTD.Race.InvalidChoice`, retorna `null` e nada muda; só então apaga a raça atual e cria a nova); `reconfigureRace(actor)` (reabre a escolha e substitui só os efeitos com `flags.dtd40k.racial` do item e o `system.choice`); `removeRace(actor)` (confirmação `DialogV2.confirm` com `DTD.Race.RemoveConfirm`, apaga o item)
- [X] T031 [US2] Em `module/apps/character-sheet.mjs`: sobrescrever `_onDropItem(event, item)` → se `item.type === "race"` **e** `item.parent?.uuid !== this.actor.uuid`, retornar `applyRace(this.actor, item)`; senão `super._onDropItem(event, item)` (arrastar dentro da mesma ficha só reordena — research R6); alterar `#onSetDots` para ler `base` de `foundry.utils.getProperty(this.document._source, path)` e `final` de `foundry.utils.getProperty(this.document, path)` e gravar `nextBaseValue({ base, final, clicked })` (research R3, FR-014)
- [X] T032 [US2] Em `module/apps/character-sheet.mjs` `_prepareContext`: para cada característica/perícia expor `base` (de `_source`), `value` final, `racialBonus = value − base` e `capped` (de `system.capped`); chamar `buildDots(value, 6, base)` (pontos `racial` da T025); expor `race` (`getRace(actor)`: id, nome, img, escolha localizada) e `baseSize`/`baseHeroPointsMax` do `_source`
- [X] T033 [US2] Adicionar abas em `module/apps/character-sheet.mjs`: `static TABS = { primary: { tabs: [{ id: "main", label: "DTD.Sheet.Tab.main" }, { id: "traits", label: "DTD.Sheet.Tab.traits" }], initial: "main" } }`; `PARTS` passa a ser `header`, `tabs` (`templates/generic/tab-navigation.hbs`), `main` (novo `templates/actor/parts/main.hbs` que inclui as partials de características e perícias existentes), `traits` e `footer`; aba ativa lida/gravada em `game.user.getFlag("dtd40k", "sheetTabs")[actor.id]` (restaurar em `_prepareContext`/`changeTab`) — FR-015a, research R7; mover os templates `characteristics.hbs` e `skills.hbs` para `PARTIALS`
- [X] T034 [US2] Criar `templates/actor/parts/traits.hbs` (`<section class="tab" data-group="primary" data-tab="traits">`): sem raça → aviso `DTD.Race.DropHint`; com raça → imagem, nome (`data-action="openRace"`), bônus aplicados (característica e perícias escolhidas + Size), botões `reconfigureRace` e `removeRace` só para donos, e o bloco do poder (nome + descrição enriquecida); registrar as ações `openRace`, `reconfigureRace`, `removeRace` em `DEFAULT_OPTIONS.actions` chamando o serviço
- [X] T035 [US2] Em `templates/actor/parts/header.hbs`: linha de identidade com "Race: <nome>" (`data-action="openRace"`) ou "—"; inputs `system.size` e `system.heroPoints.max` no modo edição com `value` do valor **base** (`baseSize`, `baseHeroPointsMax`) e o valor final ao lado quando diferente (research R3); em `templates/actor/parts/dots.hbs`, classe `racial` nos pontos raciais e ícone/tooltip `DTD.Race.Capped` quando `capped`
- [X] T036 [P] [US2] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Sheet.Tab.{main,traits}` e `DTD.Race.{None, DropHint, Choose, ChooseCharacteristic, ChooseSkills, Reconfigure, Remove, RemoveConfirm, Capped, RacialBonus, NotCharacter, OnlyOne, InvalidChoice, Base, Final, Effect.size, Effect.characteristic, Effect.skill, Effect.power}` (nomes de efeito com placeholders, ex. `"{race}: +1 {name}"`)
- [X] T037 [P] [US2] Estilos em `styles/dtd40k.css`: navegação de abas abaixo do cabeçalho fixo, `.dot.racial` (cor distinta, legível nos dois temas), ícone de valor limitado, aba Traits, janela de escolha (grade de perícias em 3 colunas)
- [ ] T038 [US2] Validar manualmente quickstart.md passos 6–14 e 20–24 e registrar em `specs/002-race-compendium/quickstart.md`

**Checkpoint**: raça aplicável, trocável e removível; sempre uma raça por personagem

---

## Phase 5: User Story 3 - Poderes raciais na ficha (Priority: P3)

**Goal**: Human, Halfling e Squat automatizados; contador de usos por cena; demais poderes como texto

**Independent Test**: quickstart passos 15–19

### Tests for User Story 3 ⚠️

- [X] T039 [P] [US3] Acrescentar em `tests/unit/race.test.mjs`: `usesPerScene` 0→1, 1→1, 2→1, 3→2, 4→2, 5→3, 6→3, 10→3; `remainingUses(1, 1)` = 0, `remainingUses(1, 5)` = 0, `remainingUses(5, 1)` = 2; `buildRaceEffects` com `power` para Human (`system.heroPoints.max`, mode 2, `"1"`), Halfling (`system.modifiers.staticDefenseFormula`, mode 5, `"shifty"`) e Squat (`system.modifiers.resilience`, mode 2, `"1"`)
- [X] T040 [P] [US3] Acrescentar em `tests/unit/derived.test.mjs`: `computeDerived` com `modifiers.staticDefenseFormula = "shifty"`, Dex 3, Wis 4, Size 2 → SD 24; `modifiers.resilience = 1`, Size 3, Level 1 → Resilience 4; mesmo caso com `derivedMods.resilience.override = 2` → 2; `modifiers.resilience = 1` com `derivedMods.resilience.bonus = 1` → 5; chamada sem `modifiers` mantém todos os resultados da 001 (Traya)

### Implementation for User Story 3

- [X] T041 [US3] Em `module/rules/race.mjs`: `usesPerScene(level)`, `remainingUses(level, spent)` e o efeito `power` em `buildRaceEffects` para `heroicHeritage`, `shifty` e `squatToughness` (data-model.md "Active Effects raciais"); fazer T039 passar
- [X] T042 [US3] Em `module/rules/derived.mjs`: novo parâmetro `modifiers = {}` em `computeDerived(source, derivedMods, modifiers)` com `staticDefenseFormula` (`"standard"` padrão | `"shifty"` = 10 + 6×Dex − 2×Size, livro p. 40) e `resilience` somado à base antes do bônus/override do Mestre; mínimo 1 mantido; fazer T040 passar
- [X] T043 [US3] Em `module/data/character-data.mjs`: campos `modifiers.staticDefenseFormula` (`"standard"` | `"shifty"`, "padrão `\"standard\"`; só alterado por efeito; nunca é input da ficha") e `modifiers.resilience` ("inteiro, padrão 0; só alterado por efeito; nunca é input da ficha"); passar `this.modifiers` para `computeDerived` em `prepareDerivedData`; em `module/documents/actor.mjs` `_preCreate`, passar os mesmos modificadores
- [X] T044 [US3] Em `module/data/race-data.mjs` `prepareDerivedData`: quando `this.parent.actor` existe e `power.automation === "usesPerScene"`, definir `power.uses.max = usesPerScene(actor.system.level)` e `power.uses.remaining = remainingUses(level, power.uses.spent)`
- [X] T045 [US3] Em `module/documents/race-service.mjs`: Human (`heroicHeritage`) → após criar a raça, `heroPoints.value += 1` no `_source`; em `applyRace` (troca) e `removeRace`, após apagar a raça, se `system.heroPoints.value > system.heroPoints.max`, atualizar `heroPoints.value = max`
- [X] T046 [US3] Na aba Traits (`templates/actor/parts/traits.hbs` + `module/apps/character-sheet.mjs`): para `usesPerScene`, mostrar "restantes / máximo" (`DTD.Race.Uses`) e botões `spendRaceUse` (incrementa `power.uses.spent` só se `remaining > 0`) e `resetRaceUses` (`spent = 0`, rótulo `DTD.Race.NewScene`), ambos só para donos; para `heroicHeritage`/`shifty`/`squatToughness`, selo "automático" (`DTD.Race.Automated`); para `none`, só o texto
- [X] T047 [P] [US3] Acrescentar em `lang/en.json` e `lang/pt-BR.json`: `DTD.Race.{Uses, SpendUse, NewScene, Automated}`
- [ ] T048 [US3] Validar manualmente quickstart.md passos 15–19 e registrar em `specs/002-race-compendium/quickstart.md`

**Checkpoint**: todas as histórias funcionando de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T049 [P] Rodar `npm run lint` e corrigir avisos em `dtd40k.mjs`, `module/**` e `scripts/**`
- [ ] T050 [P] Revisar i18n: nenhuma string literal nova em `templates/**` ou `module/**` fora de `lang/*.json`; alternar pt-BR ↔ en (quickstart passo 5, SC-006)
- [X] T051 [P] Documentar em `README.md` (criar a seção se o arquivo não existir) o comando `npm run build:packs`, a necessidade de fechar o Foundry durante o build e que `packs/` não é versionado
- [ ] T052 Executar o roteiro completo de `specs/002-race-compendium/quickstart.md` (passos 1–25) nos temas claro e escuro e `npm test` com cobertura de `module/rules/**`
- [X] T053 Rodar `graphify update .` na raiz do repositório para atualizar o grafo de conhecimento

---

## Phase 7: Ajustes da validação manual (2026-09-25)

- [X] T054 [US2] Na aba Traits (`templates/actor/parts/traits.hbs`, `module/apps/character-sheet.mjs`): lista "Modificadores raciais" com os efeitos de `flags.dtd40k.racial` do item de raça e caixa de marcar por efeito (ação `toggleRaceEffect`, alterna `disabled`; só `game.user.isGM`; jogadores veem as caixas desabilitadas) — FR-010, FR-015a
- [X] T055 [US2] Ícone "i" ao lado do nome da raça (ação `showRaceInfo`) que abre `templates/dialog/race-info.hbs` via `DialogV2.prompt` com descrição enriquecida, altura, peso, listas de ambientação e página; chaves `DTD.Race.{Info, Modifiers, ModifiersHint}` em `lang/*.json`; estilos em `styles/dtd40k.css`
- [X] T056 [US1] Campo opcional `fullText` (HTMLField) em `module/data/race-data.mjs`, editável na ficha da raça com aviso `DTD.Race.FullTextHint` e exibido na janela do "i" quando preenchido; `""` em todos os `src/packs/races/*.json`, verificado em `tests/unit/packs.test.mjs`; `htmlFields` do manifesto inclui `fullText`
- [X] T057 [US1] Descrições completas das 12 raças em `src/packs/races/*.json` (seções Origins, Appearance, In Play, Relations e heróis de exemplo com página), redação própria em inglês; verificação automática sem sequências de 6+ palavras iguais ao capítulo 4 do livro
- [X] T058 [US1] Edição das raças do compêndio: aviso `DTD.Race.LockedPackHint` (só Mestre, com o nome da opção do core `COMPENDIUM.ToggleLocked.Option`) na ficha da raça; `scripts/extract-packs.mjs` + `npm run extract:packs` (inverso do build, preserva nomes de arquivo por `_id`, remove `_stats`); fonte reordenada no formato do extrator (ida e volta idêntica); README atualizado

## Phase 8: Adoção da DtD 7.7a (constituição v1.2.0, 2026-09-25)

- [X] T059 [US1] `src/packs/races/*.json`: fonte `DtD 7.7a` e páginas pp. 31–61; poderes de Dark Eldarin, Dragonborn, Elf, Gnome, Ork e Tau conforme a 7.7a (automação `none`; só Eldarin mantém `usesPerScene`); páginas dos heróis de exemplo atualizadas
- [X] T060 [US1] Quatro raças novas (Dryad p. 37, Kenku p. 49, Kobold p. 51, Thri-Kreen p. 59) com dados da 7.7a, ambientação e descrição completa em redação própria; verificação automática sem sequências de 6+ palavras iguais à 1.6 ou à 7.7a
- [X] T061 [US1] `tests/unit/packs.test.mjs` com a tabela da 7.7a (16 raças); `RaceData.source.book` padrão `DtD 7.7a`; spec, plan, research, data-model, contratos, quickstart e README atualizados

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; para validar no Foundry precisa do compêndio (T016) ou de uma raça criada à mão
- **US3 (Phase 5)**: depende da US2 (os efeitos de poder são gerados e aplicados pelo serviço da US2)
- **Polish (Phase 6)**: depois das histórias desejadas

### User Story Dependencies

- **US1**: independente — entrega o compêndio como referência
- **US2**: usa `RaceData` (Phase 2); independente da ficha da raça (T017–T019)
- **US3**: estende `race.mjs`, `derived.mjs` e o serviço da US2

### Within Each User Story

- Testes escritos e falhando antes da implementação
- Regras puras (`module/rules/`) → modelo de dados → serviço → ficha/templates → i18n/CSS → validação manual

### Parallel Opportunities

- Setup: T002–T005 em paralelo depois de T001
- Foundational: T006 e T011 em paralelo; T008/T009 depois de T007
- US1: T012, T013, T014, T015 em paralelo (arquivos distintos); T017, T020, T021 em paralelo
- US2: T023, T024 e T029 em paralelo; T025 e T026 em paralelo (arquivos distintos); T036 e T037 em paralelo
- US3: T039 e T040 em paralelo; T047 em paralelo com T044–T046
- US1 e US2 podem avançar em paralelo após a Phase 2 (arquivos diferentes, exceto `lang/*.json` e `styles/dtd40k.css`)

---

## Parallel Example: User Story 1

```text
# Teste e dados em paralelo:
Task: "T012 [US1] tests/unit/packs.test.mjs"
Task: "T013 [US1] src/packs/races/aasimar.json … eldarin.json"
Task: "T014 [US1] src/packs/races/elf.json … human.json"
Task: "T015 [US1] src/packs/races/ork.json … tiefling.json"

# Ficha da raça em paralelo:
Task: "T017 [US1] templates/item/race-sheet.hbs"
Task: "T020 [US1] lang/en.json, lang/pt-BR.json"
Task: "T021 [US1] styles/dtd40k.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 (US1): compêndio + ficha da raça
3. **Parar e validar**: quickstart passos 1–5; o compêndio já serve de referência na mesa

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → compêndio de consulta (MVP)
3. US2 → aplicar raça no personagem
4. US3 → poderes automatizados e contador
5. Cada história validada pelo quickstart antes de seguir

### Coordenação com a 001

A 001 (US2/US3 de rolagem) ainda está aberta e também mexe em `module/apps/character-sheet.mjs`,
`templates/actor/parts/*`, `lang/*.json` e `styles/dtd40k.css`. As abas (T033) movem as partials
de características e perícias para dentro da aba `main`; quem fizer merge depois reaplica os
botões de rolagem da 001 (T041 da 001) dentro dessas partials.

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Commits no padrão Conventional Commits, um por tarefa ou grupo lógico
- Nunca editar `packs/` à mão; sempre `npm run build:packs` a partir de `src/packs/`
- Descrições do compêndio: resumo próprio em inglês; nunca colar texto do PDF (constituição V)

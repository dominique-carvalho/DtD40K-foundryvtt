---

description: "Task list for 006-classes-xp"
---

# Tasks: Classes e compra de XP (DtD 7.7a)

**Input**: Design documents from `specs/006-classes-xp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md, contracts/foundry-api.md,
quickstart.md

**Tests**: incluídos (constituição III). Testes antes da implementação, confirmando que falham. UI: quickstart.

**Organization**: US1 compêndio, US2 classes no personagem, US3 XP.

## Format: `[ID] [P?] [Story] Description`

- Caminhos relativos à raiz do worktree `DtD40K-foundryvtt-006`
- Inventário do PDF: `C:/Users/DOMINI~1/AppData/Local/Temp/claude/C--Users-Dominique-Documents-Personal-Projects-DtD40K-foundryvtt/919c0db4-6c1f-440d-b680-d3d8cd90bf2d/scratchpad/ch6-classes.json` e `ch6-xp-rules.md` (conferir no livro antes de gravar — constituição V)

---

## Phase 1: Setup

- [ ] T001 Em `system.json`: `documentTypes.Item.class: { "htmlFields": ["description", "completion.text"] }` e o pack `{ "name": "classes", "label": "Classes", "path": "packs/classes", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }`
- [ ] T002 [P] Generalizar `scripts/assign-feat-ids.mjs` em `scripts/assign-pack-ids.mjs --pack <nome>` (feats e classes), mantendo os IDs já atribuídos do pack `feats` (rodar e confirmar `git diff` vazio em `src/packs/feats`)

---

## Phase 2: Foundational

- [ ] T003 [P] Em `tests/unit/config.test.mjs`: `CLASS_COMPLETION` = `["none", "hpMax", "initiative", "resolveMax", "staticDefense", "specialty", "skillDot"]`; `CLASS_STATUS` = `["current", "completed"]`; `XP_COSTS` = `{ characteristic: 200, newSkill: 100, skill: 50, feat: 100, asset: 100, powerStat: 300 }`; `STARTING_XP === 600`; `FREE_STUDY_MULTIPLIER === 2`; `XP_KINDS` = `["characteristic", "skill", "feat", "asset", "powerStat"]`; todos em `DTD`
- [ ] T004 Em `module/config.mjs`: as constantes de T003 com fonte (pp. 15–16, p. 106); fazer T003 passar
- [ ] T005 Criar `module/data/class-data.mjs` (`ClassData`) exatamente conforme data-model.md: `level` "inteiro 1–5"; `track` string; `source`; `description` HTML; `prerequisites.skills` "lista de `{ keys: [chave de perícia] (≥ 1), value: 1–6 }`", `prerequisites.feats` strings, `prerequisites.schools` `{ name, value }`, `prerequisites.text`; `characteristics` (choices = chaves) e `anyCharacteristic`; `skills` (choices = chaves); `feats` `{ name, subcategory, mandatory: bool, orGroup }`; `magicSchools`/`swordSchools`/`gunKata`; `completion { text HTML, automation choices CLASS_COMPLETION "padrão none", value inteiro, skillGroup choices ["any","social"], grants (grantField da 005), selection { skill, specialty } }`; `status` choices `CLASS_STATUS` "padrão current"; `startedAt` inteiro
- [ ] T006 [P] Em `module/data/character-data.mjs`: `xp: { starting: integer(600), log: ArrayField de { id, type: purchase|award, kind: XP_KINDS ou "", key, label, from, to, cost, itemId, reason, user, date } }`
- [ ] T007 Registrar em `dtd40k.mjs`: `CONFIG.Item.dataModels.class = ClassData`
- [ ] T008 [P] i18n em `lang/*.json`: `TYPES.Item.class` ("Class"/"Classe"), `DTD.Class.Completion.*` (automações), `DTD.XP.Kind.*`
- [ ] T009 Rodar `npm test` e `npx eslint .`

---

## Phase 3: User Story 1 - Compêndio de classes (Priority: P1) 🎯 MVP

**Independent Test**: quickstart passos 1–3

### Tests for User Story 1 ⚠️

- [ ] T010 [P] [US1] Em `tests/unit/packs.test.mjs` o bloco "classes compendium source (spec 006, SC-001)": 103 classes + 19 pastas; contagem por Level 23/21/22/19/18; 18 trilhas com 5 classes (Level 1–5) e 13 avulsas; Swordsman, Initiate, Mercenary e Fighter campo a campo (Level, trilha, página, pré-requisitos, listas, feats obrigatórios/opcionais, escolas, `completion.automation`/`value`); toda chave de característica/perícia válida; todo feat da lista e de pré-requisito existe no pack `feats` (nome canônico); automações de conclusão iguais à spec FR-009 (Mercenary/Ratcatcher hpMax 2; trilhas Cleric e Heavy hpMax 1; Assassin initiative 1; Courtier resolveMax 1; Thief staticDefense 1; Initiate/Scholar specialty any; Captain/Commodore specialty social; Bard skillDot; Druid grants Improved Animal Companion + Beastmaster; Techpriest grants Upgraded com a raridade); `status: "current"`, `startedAt: 0`, `completion.selection` vazio; `_id`/`_key` únicos

### Implementation for User Story 1

- [ ] T011 [US1] Gerar `src/packs/classes/` a partir do inventário com um script no scratchpad (não versionado): 19 pastas (trilhas + "Other"), 103 `class-<slug>.json` com nomes mapeados para chaves (`CHARACTERISTICS`, `SKILLS`; "Tech-Use" → `techUse`; "Craft" → `crafts`, "Decieve" → `deceive`), feats com o nome canônico do pack `feats` (comparação sem maiúsculas), grupos "A ou B" com `orGroup` (com `*` → todas opcionais), `completion` com automação/valor/concessões e `description`/`completion.text` vazios; rodar `node scripts/assign-pack-ids.mjs --pack classes`
- [ ] T012 [P] [US1] Descrições das classes Level 1–2 (44): `description` (1–3 frases) e `completion.text` em inglês de redação própria, a partir do livro, com checagem de 6+ palavras
- [ ] T013 [P] [US1] Descrições das classes Level 3 (22), mesmas regras
- [ ] T014 [P] [US1] Descrições das classes Level 4–5 (37), mesmas regras
- [ ] T015 [US1] `npm test` (T010 passa) e `npm run build:packs`
- [ ] T016 [US1] Criar `templates/item/class-sheet.hbs` e `module/apps/class-sheet.mjs` (`ClassSheet`, padrão da `FeatSheet`): cabeçalho, pré-requisitos, listas, feats agrupados (obrigatórios, opcionais, "A ou B"), escolas, bônus; edição com listas indexadas; aviso de compêndio bloqueado; registrar em `dtd40k.mjs`
- [ ] T017 [P] [US1] i18n: `DTD.Sheet.Class`, `DTD.Class.{Level, Track, Prerequisites, Characteristics, AnyCharacteristic, Skills, Feats, Mandatory, Optional, Choice, MagicSchools, SwordSchools, GunKata, CompletionBonus, Automation, Value, SkillGroup.*}`
- [ ] T018 [P] [US1] Estilos da ficha de classe em `styles/dtd40k.css`
- [ ] T019 [US1] Validar quickstart 1–3 (conferir antes `index.size === 103` no Foundry) e registrar

---

## Phase 4: User Story 2 - Classes no personagem (Priority: P2)

**Independent Test**: quickstart passos 4–14

### Tests for User Story 2 ⚠️

- [ ] T020 [P] [US2] Escrever `tests/unit/class.test.mjs` com os casos de contracts/rules-api.md (`matchesListFeat`, `classProgress`, `checkClassEntry`, `characterLevel`, `buildCompletionEffects`, `completionSkillOptions`)

### Implementation for User Story 2

- [ ] T021 [US2] Implementar `module/rules/class.mjs` (PURO); fazer T020 passar
- [ ] T022 [US2] Em `character-data.mjs` `prepareDerivedData`: no início, `this.level = characterLevel(classes, this.level)` e `this.classState` (atual, Free Study, concluídas)
- [ ] T023 [US2] Criar `module/documents/class-service.mjs`: `getClasses`, `getCurrentClass`, `startClass` (`checkClassEntry` com erros → aviso + override do Mestre, avisos → confirmação; cria com `status: "current"` e `startedAt`), `syncClassCompletion` (quando completa → `completeClass`), `completeClass` (escolha do bônus em `templates/dialog/class-bonus.hbs` quando `specialty`/`skillDot`; efeitos de `buildCompletionEffects`; `status: "completed"`; `grantFeats`), `uncompleteClass` (Mestre; apaga efeitos, `releaseGrants`, `status: "current"`), `removeClass` (confirmação)
- [ ] T024 [US2] Em `module/documents/feat-service.mjs` `grantFeats`: para `class`, usar `completion.grants` só com `status === "completed"`; em `module/documents/item.mjs` `_onCreate` de feat (autor) → `syncClassCompletion`
- [ ] T025 [US2] Criar `module/apps/class-context.mjs` e `templates/actor/parts/class.hbs` (aba `class`): classe atual com progresso e feats (tem/falta/bloqueado), botão `buyClassFeat`, Free Study, concluídas (bônus, efeitos com caixa do Mestre, desfazer conclusão/remover para o Mestre)
- [ ] T026 [US2] Em `module/apps/character-sheet.mjs`: aba `class` em `TABS`/`PARTS`, drop de `class` → `startClass`, ações da aba, "Class: <atual>" no cabeçalho e Level só editável sem classes (`header.hbs`)
- [ ] T027 [P] [US2] i18n: `DTD.Sheet.Tab.class`, `DTD.Class.{Current, Completed, FreeStudy, Progress, Owned, Missing, Blocked, Start, Remove, RemoveConfirm, Uncomplete, BuyFeat, BonusTitle, ChooseSkill, ChooseSpecialty, Error.*, Warning.*, NotCharacter, None, DropHint}`
- [ ] T028 [P] [US2] Estilos da aba de classe
- [ ] T029 [US2] Validar quickstart 4–14 e registrar

---

## Phase 5: User Story 3 - XP (Priority: P3)

**Independent Test**: quickstart passos 15–25

### Tests for User Story 3 ⚠️

- [ ] T030 [P] [US3] Escrever `tests/unit/xp.test.mjs` com os casos de contracts/rules-api.md (`advanceCost`, `canAdvance`, `xpTotals`, `undoPlan`)

### Implementation for User Story 3

- [ ] T031 [US3] Implementar `module/rules/xp.mjs` (PURO); fazer T030 passar
- [ ] T032 [US3] Em `character-data.mjs`: `this.xp.totals = xpTotals(...)` com o XP dos hindrances (itens `feat` categoria `hindrance`)
- [ ] T033 [US3] Criar `module/documents/xp-service.mjs`: `advance(actor, kind, key)` (`canAdvance` + custo × multiplicador + saldo; grava `_source` + 1; registra), `chargeForFeat(actor, feat, selection)`, `recordPurchase`, `undoXp` (`undoPlan`; dono só a última, Mestre qualquer), `awardXp` (Mestre)
- [ ] T034 [US3] Em `feat-service.addFeat`: chamar `chargeForFeat` após as validações (asset 100; feat/racialFeat por `canAdvance`; recusa → override do Mestre sem cobrança; hindrance sem cobrança); a entrada guarda o `itemId`
- [ ] T035 [US3] Modo `advance` em `character-sheet.mjs` (ao lado de edit/play) e botões `+ custo` em `characteristics.hbs`, `skills.hbs` e no Power Stat de `exaltation.hbs` (motivo da recusa em tooltip); ações `advanceCharacteristic`, `advanceSkill`, `advancePowerStat`
- [ ] T036 [US3] Seção XP na aba `class` (`class.hbs` + contexto): totais, XP inicial (Mestre), histórico com `undoXp`, `awardXp` (Mestre, com motivo)
- [ ] T037 [P] [US3] i18n: `DTD.Sheet.ModeAdvance`, `DTD.XP.{XP, Total, Spent, Available, Starting, Log, Award, AwardReason, Undo, UndoConfirm, Cost, Confirm, FreeStudy, Error.*}`
- [ ] T038 [P] [US3] Estilos do modo avanço e do XP
- [ ] T039 [US3] Validar quickstart 15–25 e registrar

---

## Phase 6: Polish

- [ ] T040 [P] Atualizar `docs/analise-dtd.md` §4 (XP) e §7 (Classes) para a 7.7a e o `README.md`
- [ ] T041 `npm run lint` e `npm test`
- [ ] T042 `graphify update .`

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish (US3 usa as classes da US2 para a elegibilidade)
- Dentro de cada história: testes → regras puras → modelo/serviço → ficha → i18n/estilos → validação

### Parallel Opportunities

- Setup: T002 · Foundational: T003, T006, T008 · US1: T010, T012–T014, T017, T018 · US2: T020, T027, T028 · US3: T030, T037, T038

## Implementation Strategy

MVP = Setup + Foundational + US1 (compêndio). Depois US2 (classes) e US3 (XP), validando cada uma no Foundry com
o pack compilado conferido antes do registro.

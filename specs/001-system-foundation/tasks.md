---

description: "Task list for 001-system-foundation"
---

# Tasks: Fundação do Sistema DtD (personagem + Roll & Keep)

**Input**: Design documents from `specs/001-system-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rules-api.md,
contracts/foundry-api.md, quickstart.md

**Tests**: incluídos — a constituição (princípio III) exige testes unitários Vitest para todo
módulo puro (`module/rules/**`, `module/config.mjs`). Escrever os testes antes da implementação
e confirmar que falham. UI/integração: roteiro manual do quickstart.md.

**Organization**: tarefas agrupadas por história de usuário (US1 ficha, US2 rolagem, US3 diálogo).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1, US2, US3)
- Caminhos relativos à raiz do repositório (a raiz é a pasta do sistema Foundry)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicializar o pacote do sistema e o ferramental

- [X] T001 Criar `package.json` com `"type": "module"`, `"private": true`, scripts `test` (`vitest run`), `test:watch` (`vitest`), `lint` (`eslint .`) e devDependencies `vitest`, `eslint`, `@eslint/js`, `globals`; rodar `npm install` (gera `package-lock.json`)
- [X] T002 [P] Criar `vitest.config.mjs` com `test.environment = "node"`, `test.include = ["tests/unit/**/*.test.mjs"]` e cobertura restrita a `module/rules/**` e `module/config.mjs`
- [X] T003 [P] Criar `eslint.config.mjs` (flat config) com `@eslint/js` recommended, `globals.browser` e globais do Foundry somente leitura (`foundry`, `game`, `CONFIG`, `Hooks`, `ui`, `Actor`, `ChatMessage`, `Roll`), ignorando `node_modules/`; para `tests/**` usar `globals.node`
- [X] T004 [P] Criar `system.json` conforme contracts/foundry-api.md: `id: "dtd40k"`, title "Dungeons the Dragoning", description, `version: "0.1.0"`, `compatibility: { minimum: "13", verified: "13" }`, authors, `esmodules: ["dtd40k.mjs"]`, `styles: ["styles/dtd40k.css"]`, `languages` en (`lang/en.json`) e pt-BR (`lang/pt-BR.json`), `documentTypes.Actor.character.htmlFields: ["biography"]`, `grid: { distance: 1, units: "m" }`, `primaryTokenAttribute: "hp"`, `secondaryTokenAttribute: "resolve"`, `initiative: "1d10 + @characteristics.dex.value + @characteristics.cmp.value"`, `url`, `manifest` e `download` apontando para `https://github.com/dominique-carvalho/DtD40K-foundryvtt`
- [X] T005 [P] Criar esqueleto de pastas e arquivos vazios válidos: `lang/en.json` e `lang/pt-BR.json` (`{ "DTD": {} }`), `styles/dtd40k.css`, pastas `module/rules/`, `module/data/`, `module/documents/`, `module/dice/`, `module/apps/`, `templates/actor/`, `templates/dialog/`, `templates/chat/`, `tests/unit/`
- [X] T006 Criar `dtd40k.mjs` com `Hooks.once("init", …)` que registra `CONFIG.DTD` (importado de `module/config.mjs`) e loga a inicialização; sem outras dependências ainda

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: dados de configuração, modelo do ator e documento base usados por todas as histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T007 [P] Escrever `tests/unit/config.test.mjs`: 9 características nas chaves `str, dex, con, cha, fel, cmp, int, wis, wil` com grupos physical/social/mental; exatamente 27 perícias; exatamente 8 avançadas (`academicLore, commonLore, forbiddenLore, medicae, politics, techUse, acrobatics, pilot`); `arcana` básica; toda perícia com `characteristic` válida e `group`
- [X] T008 Implementar `module/config.mjs` (PURO, sem globais do Foundry): `CHARACTERISTICS` (key → `{ group, label: "DTD.Characteristic.<key>", abbr }`), `SKILLS` (key → `{ group, characteristic, advanced, label: "DTD.Skill.<key>" }`) exatamente conforme a tabela de data-model.md (Ballistics/Brawl/Weaponry com `characteristic: "dex"`), `GROUPS`, `DERIVED_KEYS = ["staticDefense","hpMax","mentalDefense","resolveMax","speed","resilience"]`; fazer T007 passar
- [X] T009 Implementar `module/data/character-data.mjs` (`CharacterData extends foundry.abstract.TypeDataModel`) com `defineSchema()` gerado a partir de `module/config.mjs`: `characteristics.<key>.value` "inteiro, 0–6, inicial 1"; `characteristics.<key>.specialties` "lista de texto, itens não vazios"; `skills.<key>.value` "inteiro, 0–6, inicial 0"; `skills.<key>.specialties`; `size` "1–10, inicial 4"; `level` "1–10, inicial 1"; `hp.value` "≥ 0"; `resolve.value` "≥ 0"; `heroPoints.value`/`heroPoints.max` "≥ 0; inicial 2 / 2"; `devotion.value` "0–10, inicial 6"; `derivedMods.<derivedKey>.bonus` "inteiro, inicial 0, pode ser negativo"; `derivedMods.<derivedKey>.override` "inteiro ou nulo" (`nullable: true, initial: null`); `biography` HTMLField (sem `prepareDerivedData` ainda)
- [X] T010 Implementar `module/documents/actor.mjs` (`DtdActor extends Actor`) com `_preCreate` que, para `type === "character"`, define `system.hp.value` e `system.resolve.value` iguais aos máximos calculados a partir dos valores iniciais (usar `computeDerived` quando existir; até lá, 2×(con+wil) e wil+cmp)
- [X] T011 Registrar em `dtd40k.mjs` (hook `init`): `CONFIG.Actor.documentClass = DtdActor`, `CONFIG.Actor.dataModels.character = CharacterData`, `CONFIG.Combat.initiative = { formula: "1d10 + @characteristics.dex.value + @characteristics.cmp.value", decimals: 0 }`
- [X] T012 [P] Preencher `lang/en.json` e `lang/pt-BR.json` com `DTD.Characteristic.<key>` e abreviações, `DTD.Skill.<key>` (nomes originais do livro em ambos), `DTD.SkillGroup.<group>` (Mental/Physical/Social; Mental/Físico/Social), `DTD.Derived.<key>`, `TYPES.Actor.character` ("Character"/"Personagem")

**Checkpoint**: sistema carrega no Foundry v13 e permite criar um ator `character` (ficha padrão do core)

---

## Phase 3: User Story 1 - Criar e manter a ficha de um Herói (Priority: P1) 🎯 MVP

**Goal**: ficha no layout híbrido A+C (grade clássica 3×3 + cabeçalho de mesa) com modos edição e jogo, pontos clicáveis, especialidades e derivados que atualizam na hora

**Independent Test**: quickstart.md passos 1–6 e 17–22, nos temas claro e escuro do v13

> **Revisão 2026-09-25**: a primeira versão da ficha (antigas T016–T020) falhou no passo 3 —
> derivados não atualizavam e o layout era inutilizável no v13. A lógica de derivados (T013–T015)
> foi mantida; as tarefas de UI abaixo substituem as antigas. Arquivos existentes em
> `templates/actor/parts/` e `module/apps/character-sheet.mjs` serão reescritos.

### Tests for User Story 1 ⚠️

- [X] T013 [P] [US1] Escrever `tests/unit/derived.test.mjs`: exemplo Traya (str 4, dex 3, con 4, wil 2, wis 2, cmp 2, size 5, level 1 → staticDefense 15, hpMax 12, mentalDefense 15, resolveMax 4, speed 7, resilience 4); personagem inicial (todas 1, size 4, level 1 → hpMax 4, resolveMax 2); `bonus` soma; `override` substitui mesmo com bônus; resilience nunca < 1 mesmo com bônus negativo
- [X] T016 [P] [US1] Acrescentar em `tests/unit/config.test.mjs` casos de `CHARACTERISTIC_GRID`: linhas `power`, `finesse`, `resistance` na ordem; colunas `mental`, `physical`, `social`; células exatamente `power: [int, str, cha]`, `finesse: [wis, dex, fel]`, `resistance: [wil, con, cmp]`; cada característica aparece uma única vez e o grupo da coluna bate com `CHARACTERISTICS[key].group`
- [X] T017 [P] [US1] Escrever `tests/unit/sheet.test.mjs` para `module/rules/sheet.mjs`: `buildDots(3)` → 6 pontos com os 3 primeiros preenchidos e o 6º marcado `superhuman`; `buildDots(0)` → nenhum preenchido; `nextDotValue(current 3, clicked 4)` → 4; `nextDotValue(3, 3)` → 2; `nextDotValue(1, 1)` → 0; `filterSkills(entries, { query: "lore" })` casa "Academic Lore", "Common Lore", "Forbidden Lore"; busca sem diferenciar maiúsculas e acentos ("pericia" casa "Perícia"); `onlyTrained: true` mantém só valor ≥ 1; filtros combinados; `sanitizeDerivedMods({ hpMax: { bonus: null, override: "" } })` → `{ hpMax: { bonus: 0, override: null } }`
- [X] T018 [P] [US1] Acrescentar em `tests/unit/derived.test.mjs`: `bonus` nulo/indefinido vale 0; `override` string vazia é tratado como sem override

### Diagnosis for User Story 1

- [X] T019 [US1] Reproduzir o problema "derivados não atualizam" no Foundry v13 (mundo `teste-dtd`, navegador embutido em `localhost:30000` com login feito pelo usuário): abrir a ficha atual, mudar Dex, observar console e rede; registrar a causa raiz em `specs/001-system-foundation/research.md` como R11 (hipóteses: bônus apagado → valor nulo rejeita o update inteiro; ficha não re-renderiza após update; update só dispara no blur). Se o acesso não for possível, seguir com as correções defensivas de T021 e T026 e validar em T029

### Implementation for User Story 1

- [X] T014 [US1] Implementar `module/rules/derived.mjs` (PURO) `computeDerived({ characteristics, size, level }, derivedMods)` com as fórmulas de data-model.md e `final = override ?? base + bonus`; fazer T013 passar
- [X] T015 [US1] Adicionar `prepareDerivedData()` em `module/data/character-data.mjs` chamando `computeDerived` e expondo `derived.*`, `hp.max`, `resolve.max` (não persistidos); `_preCreate` em `module/documents/actor.mjs` usa `computeDerived`
- [X] T020 [US1] Implementar `CHARACTERISTIC_GRID` em `module/config.mjs` (PURO) conforme data-model.md — `{ rows: ["power","finesse","resistance"], columns: ["mental","physical","social"], cells: { power: ["int","str","cha"], finesse: ["wis","dex","fel"], resistance: ["wil","con","cmp"] } }` — e incluí-lo em `DTD`; fazer T016 passar
- [X] T021 [US1] Implementar `module/rules/sheet.mjs` (PURO): `buildDots(value, max = 6)` → `[{ index, filled, superhuman }]`; `nextDotValue(current, clicked)` (clicar no valor atual reduz 1, mínimo 0); `filterSkills(entries, { query = "", onlyTrained = false })` com normalização Unicode NFD sem acentos e minúsculas sobre `entry.name`; `sanitizeDerivedMods(mods)` (bônus nulo/vazio → 0, override vazio → `null`); tornar `computeDerived` tolerante a bônus nulo e override vazio; fazer T017 e T018 passar
- [X] T022 [P] [US1] Reescrever `templates/actor/parts/header.hbs` (FR-026): imagem (`data-action="editImage" data-edit="img"`), nome, linha de identidade reservada (Level, Size editáveis no modo edição), barras de HP e Resolve com valor atual editável e máximo calculado, caixas de Static Defense, Mental Defense, Resilience, Hero Points (atual/máximo) e Devotion, e alternador de modo (`data-action="toggleMode"`, botões "Edição"/"Jogo" com estado ativo); contêiner com `position: sticky; top: 0`
- [X] T023 [P] [US1] Reescrever `templates/actor/parts/characteristics.hbs` (FR-023, FR-025, FR-028): grade 3×3 guiada por `CHARACTERISTIC_GRID` (rótulos de linha Power/Finesse/Resistance e de coluna Mental/Físico/Social); cada célula com nome, pontos (`data-action="setDots" data-path="system.characteristics.<key>.value" data-value="N"`, só clicáveis no modo edição) e, no modo edição, o partial de especialidades; no modo jogo, especialidades só leitura
- [X] T024 [P] [US1] Reescrever `templates/actor/parts/skills.hbs` (FR-024, FR-025, FR-027): barra com campo de busca e alternador "só treinadas" (visíveis no modo jogo); 3 colunas Mental/Físico/Social; cada linha com `data-skill-name` (nome localizado), `data-trained`, nome, marca `*` de Avançada, abreviação da característica padrão, pontos (`setDots` no modo edição) e espaço reservado `.pool` para a parada da US2; especialidades conforme o modo
- [X] T025 [P] [US1] Criar `templates/actor/parts/footer.hbs` (FR-028, FR-029) e remover `templates/actor/parts/derived.hbs`: Speed em metros e iniciativa `1d10 + Dex + Cmp` com o valor somado; no modo edição, seção "Ajustes do Mestre" com tabela de derivados (valor final, `bonus`, `override`)
- [X] T026 [US1] Reescrever `module/apps/character-sheet.mjs`: `PARTS` = header, characteristics, skills, footer; `_prepareContext` monta `mode` (`game.user.getFlag("dtd40k","sheetModes")?.[actor.id] ?? "edit"`, forçado a `"play"` se `!this.document.isOwner`), `isEdit`, a grade a partir de `CHARACTERISTIC_GRID`, pontos via `buildDots`, colunas de perícias, derivados e iniciativa; actions `toggleMode` (grava a flag do usuário e re-renderiza), `setDots` (usa `nextDotValue` e `actor.update`), `addSpecialty`, `removeSpecialty`; sobrescrever `_prepareSubmitData` (ou `_processFormData`) para aplicar `sanitizeDerivedMods`; em `_onRender`, ligar busca e filtro que só ocultam linhas via `filterSkills` (sem re-render) e preservar o texto da busca entre renders; corrigir a causa raiz registrada em T019 garantindo re-render após `updateActor`
- [X] T027 [US1] Reescrever `styles/dtd40k.css` para o layout híbrido (FR-030): cabeçalho sticky, grade 3×3, 3 colunas de perícias, pontos (preenchido, vazio, 6º sobre-humano, cursor só no modo edição), barras de HP/Resolve, chips de especialidade, rodapé; cores exclusivamente via variáveis do tema do Foundry v13 (verificar nomes em `resources/app/public/css/` do 13.351) para funcionar nos temas `.theme-light` e `.theme-dark`; `min-width: 720px`; conteúdo da janela com rolagem vertical
- [X] T028 [P] [US1] Atualizar chaves `DTD.Sheet.*` em `lang/en.json` e `lang/pt-BR.json`: ModeEdit, ModePlay, ToggleMode, RowPower, RowFinesse, RowResistance, ColumnMental, ColumnPhysical, ColumnSocial, SearchSkills, OnlyTrained, GmAdjustments, Initiative, SpeedMeters, Superhuman; remover chaves que deixarem de ser usadas
- [ ] T029 [US1] Validar manualmente quickstart.md passos 1–6 e 17–22 no Foundry v13, nos temas claro e escuro, e registrar em "Registro de validação" de `specs/001-system-foundation/quickstart.md`

**Checkpoint**: US1 funcional — ficha híbrida utilizável, derivados atualizando na hora (SC-002, SC-007, SC-008)

---

## Phase 4: User Story 2 - Rolar testes de perícia e característica (Priority: P2)

**Goal**: no modo jogo, clique na perícia/característica rola Roll & Keep correto (TN padrão 15), mostra a parada XkY ao lado de cada item e publica cartão no chat

**Independent Test**: quickstart.md passos 7, 9, 10, 12 e 16 (nesta fase, todo clique rola direto com TN 15; o diálogo vem na US3)

### Tests for User Story 2 ⚠️

- [X] T030 [P] [US2] Escrever `tests/unit/pool.test.mjs` para `normalizePool`, `buildSkillPool`, `buildCharacteristicPool`: 12k6→10k7; 11k5→10k5; 15k10→10k10+25; 11k11→10k10+10; 2k3→2k2; 0k0→1k1; perícia 3 + característica 3 → 6k3; básica sem treino com char 3 → 2k2 `untrained`; avançada sem treino → `{ blocked: "advancedUntrained" }`; característica 4 → 4k4; característica 0 com perícia 2 → 3k1 `zeroCharacteristic`; teste de característica 0 → 1k1 `zeroCharacteristic`; básica sem treino com característica 1 (efetiva 0) → 1k1 `untrained` + `zeroCharacteristic`
- [X] T031 [P] [US2] Escrever `tests/unit/dice.test.mjs` para `rollAndKeep` com `rng` determinístico (sequência de faces convertida para [0,1)): cadeia 10,10,4 = 24 conta como 1 dado; mantém os K maiores com empate por ordem; `total = keptSum + flat`; `zeroCharacteristic` transforma 10 em 0 sem explodir; `rerollOnes` rerrola face 1 uma única vez e a nova face 10 explode
- [X] T032 [P] [US2] Escrever `tests/unit/results.test.mjs` para `evaluateOutcome`: 27 vs 15 → sucesso, 2 raises; 9 vs 20 → falha, 2 checks; 15 vs 15 → sucesso, 0 raises; 14 vs 15 → falha, 0 checks; tn nulo ou "" → `null`
- [X] T033 [P] [US2] Escrever `tests/unit/test.test.mjs` para `runTest`: compõe pool → normalização → rolagem → resultado; preenche `flags` (`zeroCharacteristic`, `specialty`, `untrained`) e `conversion`; quando `buildSkillPool`/`buildCharacteristicPool` retornam `zeroCharacteristic: true`, a rolagem trata todo 10 como 0 sem explodir

### Implementation for User Story 2

- [X] T034 [P] [US2] Implementar `module/rules/pool.mjs` (PURO): `normalizePool`, `buildSkillPool`, `buildCharacteristicPool` conforme contracts/rules-api.md; adicionar `formatPool(pool)` → texto "XkY" / "XkY+Z"; fazer T030 passar
- [X] T035 [P] [US2] Implementar `module/rules/dice.mjs` (PURO): `rollAndKeep(pool, { rng, explodeOn = 10, rerollOnes = false, zeroCharacteristic = false })` → `{ dice, keptSum, total }` com face = `Math.floor(rng() * 10) + 1`; fazer T031 passar
- [X] T036 [P] [US2] Implementar `module/rules/results.mjs` (PURO): `evaluateOutcome(total, tn)`; fazer T032 passar
- [X] T037 [US2] Implementar `module/rules/test.mjs` (PURO): `runTest({ base, modifiers, tn, specialty, zeroCharacteristic, untrained, rng })` → `TestResult` (usar `applyModifiers` como identidade se ainda não existir); fazer T033 passar
- [X] T038 [US2] Implementar `module/dice/roll-service.mjs` (adaptador Foundry). **Primeiro passo — verificação**: no console do Foundry v13, confirmar que um `Roll` com termo `foundry.dice.terms.Die` d10 e `results` pré-preenchidos pode ser marcado como avaliado, gerar `ChatMessage` com `rolls` e ser animado pelo Dice So Nice; se não funcionar, aplicar o **fallback** de research.md R2 (faces vindas de `new Roll("Nd10").evaluate()` em lotes, entregues ao motor por um `rng` em fila) e registrar a decisão em research.md. Caminho principal: `rng = () => CONFIG.Dice.randomUniform()`; `buildDisplayRoll(testResult)` cria um `Roll` já avaliado com um termo d10 contendo todas as faces planas (incluindo explosões e rerrolagens, com `active`/`discarded` coerentes); `postTest({ actor, label, testResult, rollMode })` renderiza `templates/chat/roll-card.hbs` e chama `ChatMessage.create(chatData, { rollMode })` após `ChatMessage.applyRollMode(chatData, rollMode)`, com `chatData = { speaker, rolls: [roll], content, flags: { dtd40k: { test: { ...testResult, label, actorUuid } } } }` e `rollMode` padrão `game.settings.get("core", "rollMode")` (v13)
- [X] T039 [P] [US2] Criar `templates/chat/roll-card.hbs` e estilos em `styles/dtd40k.css`: título do teste, parada final `XkY (+flat)`, aviso de conversão, lista de dados com a cadeia de explosão (ex. `10+10+4 = 24`), mantidos destacados, rerrolagens riscadas, total, TN e "Sucesso, N raises"/"Falha, N checks" (ou só o total sem TN); marca "sem treino"; legível nos temas claro e escuro
- [X] T040 [US2] Implementar em `module/documents/actor.mjs` `rollSkill(key, { characteristic, fastForward, tn = 15 } = {})` e `rollCharacteristic(key, { fastForward, tn = 15 } = {})`: montam a base com `buildSkillPool`/`buildCharacteristicPool`, bloqueiam perícia avançada sem treino com `ui.notifications.warn(game.i18n.localize("DTD.Roll.AdvancedUntrained"))` retornando `null`, calculam `zeroCharacteristic`, chamam `runTest` e `postTest`; retornam a `ChatMessage` (nesta fase sempre rolam direto)
- [X] T041 [US2] Integrar a rolagem ao modo jogo da ficha: em `module/apps/character-sheet.mjs`, actions `rollSkill` e `rollCharacteristic` (passando `fastForward: event.shiftKey`) e, em `_prepareContext`, a parada de cada item via `buildSkillPool`/`buildCharacteristicPool` + `formatPool` (perícia avançada sem treino exibe cadeado e não rola); em `templates/actor/parts/characteristics.hbs` e `templates/actor/parts/skills.hbs`, no modo jogo, tornar nome e pontos um botão `data-action` e preencher `.pool` (ex. 6k3)
- [X] T042 [P] [US2] Adicionar chaves `DTD.Roll.*` (Success, Failure, Raises, Checks, Total, TN, Conversion, Untrained, AdvancedUntrained, Kept, Rerolled, SkillTest, CharacteristicTest) em `lang/en.json` e `lang/pt-BR.json`
- [X] T043 [US2] Validar manualmente quickstart.md passos 7, 9, 10, 12 e 16 e registrar em `specs/001-system-foundation/quickstart.md`

**Checkpoint**: US1 + US2 funcionais — mesa jogável para testes fora de combate

---

## Phase 5: User Story 3 - Ajustar a rolagem antes de lançar (Priority: P3)

**Goal**: diálogo com TN, troca de característica, modificadores, free raises, stunt dice, especialidade e modo de rolagem; Shift+clique pula o diálogo

**Independent Test**: quickstart.md passos 8, 11, 13 e 14

### Tests for User Story 3 ⚠️

- [ ] T044 [US3] Acrescentar em `tests/unit/pool.test.mjs` casos de `applyModifiers`: 5k3 + 2 stunt dice → 7k3; `stuntDice` limitado a 0–3 (5 → 3, −1 → 0); 1 free raise → flat +5; modificadores ±rolled/±kept/±flat somam; em `tests/unit/test.test.mjs`: total 14 + 1 free raise vs TN 15 → 19, sucesso; troca de característica (Persuasion 2 + Fel 4 → 6k4)

### Implementation for User Story 3

- [ ] T045 [US3] Implementar `applyModifiers(base, { rolled = 0, kept = 0, flat = 0, freeRaises = 0, stuntDice = 0 })` em `module/rules/pool.mjs` e usá-lo em `module/rules/test.mjs`; fazer T044 passar
- [ ] T046 [P] [US3] Criar `templates/dialog/roll-dialog.hbs` com os campos de contracts/foundry-api.md: TN (padrão 15, vazio permitido), seletor de característica (padrão da perícia; oculto em teste de característica), modificador de dados rolados/mantidos, modificador fixo, free raises, stunt dice (0–3), checkbox de especialidade (só se houver especialidades, listando-as) e seletor de modo de rolagem a partir de `CONFIG.Dice.rollModes` (v13)
- [ ] T047 [US3] Implementar `module/apps/roll-dialog.mjs`: `async function promptRollOptions({ actor, skillKey, characteristicKey, tn })` usando `foundry.applications.api.DialogV2` com o template de T046; retorna `{ characteristic, tn, modifiers, specialty, rollMode }` ou `null` se cancelado
- [ ] T048 [US3] Integrar o diálogo em `rollSkill`/`rollCharacteristic` de `module/documents/actor.mjs`: sem `fastForward` abre `promptRollOptions` (cancelado → `null`); passa `modifiers`, `specialty` (→ `rerollOnes`), característica escolhida e `rollMode` para `runTest`/`postTest`; com `fastForward` usa padrões
- [ ] T049 [P] [US3] Adicionar chaves `DTD.Roll.Dialog.*` (Title, TN, Characteristic, RolledMod, KeptMod, FlatMod, FreeRaises, StuntDice, Specialty, RollMode, Roll, Cancel) em `lang/en.json` e `lang/pt-BR.json` e estilos do diálogo em `styles/dtd40k.css`
- [ ] T050 [US3] Validar manualmente quickstart.md passos 8, 11, 13 e 14 (incluindo Dice So Nice) e registrar em `specs/001-system-foundation/quickstart.md`

**Checkpoint**: todas as histórias funcionais de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T051 [P] Atualizar `README.md` com descrição do sistema, requisitos (Foundry v13), instalação por manifesto, instalação local por link (junction) e comandos `npm test`/`npm run lint`
- [ ] T052 [P] Rodar `npm run lint` e corrigir avisos em `dtd40k.mjs` e `module/**`
- [ ] T053 Revisar i18n: nenhuma string literal em `templates/**` ou `module/**` fora de `lang/*.json`; validar quickstart.md passo 15 (pt-BR ↔ en, SC-006)
- [ ] T054 Executar o roteiro completo de `specs/001-system-foundation/quickstart.md` (passos 1–22) e `npm test` com cobertura de `module/rules/**`
- [ ] T055 Rodar `graphify update .` na raiz do repositório para atualizar o grafo de conhecimento

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — bloqueia todas as histórias
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; os módulos puros (T030–T037) não dependem da US1; a integração na ficha (T041) usa o modo jogo da US1
- **US3 (Phase 5)**: depende da US2 (estende `rollSkill`/`rollCharacteristic` e `pool.mjs`)
- **Polish (Phase 6)**: depende das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: independente — MVP
- **US2 (P2)**: motor puro independente; botões de rolagem e paradas ficam no modo jogo da US1 (alternativa sem US1: macro `actor.rollSkill(...)`)
- **US3 (P3)**: depende da US2

### Within Each User Story

- Testes escritos e falhando antes da implementação
- Regras puras → modelo de dados → documento/serviço → UI → validação manual
- US1: T019 (diagnóstico) antes de T026; T020 depende de T016; T021 depende de T017/T018; T026 depende de T020–T025; T027 e T028 antes de T029
- US2: T038 depende de T037; T040 depende de T034–T038; T041 depende de T026 e T040
- US3: T048 depende de T045–T047

### Parallel Opportunities

- Setup: T002, T003, T004, T005 em paralelo após T001
- Foundational: T007 e T012 em paralelo; T009 após T008
- US1: T016, T017, T018 em paralelo; T022–T025 e T028 em paralelo (templates e i18n distintos)
- US2: T030–T033 em paralelo; depois T034, T035, T036 em paralelo; T039 e T042 em paralelo com T038
- US3: T046 e T049 em paralelo com T045

---

## Parallel Example: User Story 1

```bash
# Testes puros (arquivos distintos):
Task: "Acrescentar CHARACTERISTIC_GRID em tests/unit/config.test.mjs"
Task: "Escrever tests/unit/sheet.test.mjs"
Task: "Acrescentar bônus nulo em tests/unit/derived.test.mjs"

# Templates (arquivos distintos):
Task: "Reescrever templates/actor/parts/header.hbs"
Task: "Reescrever templates/actor/parts/characteristics.hbs"
Task: "Reescrever templates/actor/parts/skills.hbs"
Task: "Criar templates/actor/parts/footer.hbs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 (US1) → **validar** quickstart 1–6 e 17–22 nos dois temas → sistema instalável com ficha híbrida funcional

### Incremental Delivery

1. Setup + Foundational → base carregando no Foundry
2. + US1 → ficha híbrida e derivados (MVP)
3. + US2 → rolagens Roll & Keep no chat a partir do modo jogo (mesa jogável)
4. + US3 → diálogo completo de rolagem
5. Polish → README, lint, i18n, graphify

---

## Notes

- Commits no padrão Conventional Commits, por tarefa ou grupo lógico, na branch `001-system-foundation`
- Módulos em `module/rules/` e `module/config.mjs` NUNCA importam nem referenciam `foundry`, `game`, `CONFIG`, `ui` ou `Hooks`
- Descrições exibidas na ficha são resumos com redação própria (constituição, V)
- Toda UI deve ser verificada nos temas claro e escuro do Foundry v13 antes de marcar a tarefa

# Data Model — 004-exaltation-compendium

Complementa `specs/001-system-foundation/data-model.md` e `specs/002-race-compendium/data-model.md`.
Chaves de característica e perícia são as de `module/config.mjs`. PS = Power Stat efetivo.

## Item `exaltation` — `ExaltationData` (TypeDataModel)

**Dados da exaltação** (vêm do compêndio):

| Campo | Tipo | Regra / validação | Origem |
|---|---|---|---|
| `description` | HTML | resumo em inglês, redação própria | FR-001, FR-009 |
| `fullText` | HTML | opcional; **sempre vazio no compêndio** | FR-001, constituição V |
| `source.book` / `source.page` | string / inteiro ≥ 1 | padrão `"DtD 7.7a"` | constituição I |
| `powerStat.name` | string | ex. `"Feral Heart"` | FR-001 |
| `powerStat.cap` | `"level"` \| `"levelAndDevotion"` | padrão `"level"`; Chosen = `levelAndDevotion` | FR-002, research R3 |
| `resource.name` | string | ex. `"Rage"` | FR-001 |
| `resource.formula` | `EXALTATION_FORMULAS` (research R3) | padrão `"fixed"` | FR-003 |
| `resource.fixedMax` | inteiro ≥ 0 | só com `fixed` | edge case "exaltação do Mestre" |
| `resource.recovery` | HTML | resumo da regra de recuperação | FR-001 |
| `resource.actions` | lista de `{type, amount}`; `type` ∈ `restoreAll`, `regain`, `lose`, `unravel`; `amount` = inteiro ≥ 1 ou `"powerStat"` | ações exibidas na ficha | FR-016, research R4 |
| `resource.debtName` | string | `"Paradox"`, `"Resonance"` ou vazio | FR-020 |
| `resource.healing` | `"outOfCombat"` \| `"anytime"` \| `"never"` | padrão `"outOfCombat"`; Werewolf `anytime`, Promethean `never` | FR-019 |
| `pressure.enabled` | booleano | só Paragon | FR-021 |
| `staticPowers` | lista de `{name, description (HTML), automation}`; `automation` ∈ `EXALTATION_POWER_AUTOMATION` | ordem do livro | FR-001, FR-025/026 |
| `powers` | lista de exatamente 5 `{rank 1–5, name, description (HTML)}`, `rank` único e em ordem | ordem da 7.7a | FR-001, FR-014 |
| `elements` | lista de `{key, name, characteristic, hpMax (inteiro ≥ 0), description (HTML)}` | só Dragonblooded (5) | FR-010, FR-025 |
| `tell` | HTML | descrição da Tell da exaltação | FR-018 |
| `lore.origin` / `lore.appearance` / `lore.society` | HTML | ambientação resumida | FR-001 |
| `lore.examples` | lista de strings | heróis de exemplo citados | FR-001 |

`EXALTATION_POWER_AUTOMATION` = `["none", "destiny", "statuesque", "perfection", "bloodQuickening"]`.

**Estado no personagem** (vazio no compêndio; preenchido/alterado na cópia embutida):

| Campo | Tipo | Regra | Origem |
|---|---|---|---|
| `powerStat.value` | inteiro 1–10 | comprado; padrão 1; o efetivo é limitado (R3) | FR-002, FR-014 |
| `resource.spent` | inteiro ≥ 0 | pontos gastos/não recuperados; = dívida quando `debtName` | FR-016, FR-020 |
| `round.spent` / `round.marker` | inteiro ≥ 0 / string | `"<combatId>:<round>"` ou `"none"` | FR-017, research R4 |
| `scene.spent` | inteiro ≥ 0 | gastos na cena (Tell) | FR-018 |
| `pressure.spent` | inteiro ≥ 0 | Pressure Points gastos na cena | FR-021 |
| `selection.statuesque` | chave de característica ou `""` | Paragon | FR-010, FR-013 |
| `selection.element` | `key` de `elements` ou `""` | Dragonblooded | FR-010, FR-013 |

**Validação da escolha** (`validateExaltationSelection`, puro): Paragon → `statuesque` MUST estar em
`statuesqueOptions(race)`; Dragonblooded → `element` MUST existir em `elements`; demais → vazio.

## Item `feat` — `FeatData` (TypeDataModel)

| Campo | Tipo | Regra / validação | Origem |
|---|---|---|---|
| `category` | `FEAT_CATEGORIES` = `["exaltedAsset"]` | a feature de feats acrescenta categorias | research R1 |
| `description` | HTML | resumo mecânico em inglês | FR-004, FR-009 |
| `source.book` / `source.page` | string / inteiro ≥ 1 | | constituição I |
| `xpCost` | inteiro ≥ 0 | 100 | FR-004 |
| `group` | `ASSET_GROUPS` = `atlanteanCaste`, `chosenMark`, `daemonhostSin`, `dragonbloodedBloodline`, `paragon`, `paragonRacial`, `prometheanMaterial`, `vampireClan`, `werewolfTribe`, `wraithHaunting` | obrigatório com `exaltedAsset` | FR-004 |
| `prerequisites.exaltation` | string | nome da exaltação exigida | FR-022 |
| `prerequisites.race` | string | só `paragonRacial` | FR-022 |
| `prerequisites.deity` | string | só `chosenMark`; informativo | FR-004, premissa |
| `automation` | `ASSET_AUTOMATION` = `none`, `actionHero`, `extraAction`, `bloodOfIo`, `warboss`, `longbeard`, `markOfNurgle`, `sloth`, `elusive` | padrão `none` | FR-025/026 |

## Active Effects gerados

Todos `transfer: true`, `origin` = uuid do item, nome i18n resolvido na criação.
- Exaltação: `flags.dtd40k.exalted = <id>` — tabela de research R5 (`destiny`, `statuesque`,
  `element`, `element.hp`).
- Asset: `flags.dtd40k.asset = <automation>` — tabela de research R6.

## Alterações em `CharacterData`

| Campo | Tipo | Regra |
|---|---|---|
| `modifiers.hpMax` | inteiro, padrão 0 | só por efeito; somado ao HP máximo antes do bônus/override |
| `modifiers.staticDefenseSize` | booleano, padrão `true` | `false` → Static Defense sem −2×Size |
| `modifiers.exaltation.resourceBonus` | inteiro, padrão 0 | somado ao máximo do recurso |
| `modifiers.exaltation.resourcePerPowerStat` | inteiro, padrão 0 | × PS, somado ao máximo |
| `exaltation` (**derivado**) | objeto de `computeExaltation` ou `null` | nunca persistido |

**`prepareDerivedData` (ordem)**: 1–2 como na 002 (limite de 6; `computeDerived`, agora com
`hpMax` e `staticDefenseSize`) → 3. `this.exaltation = computeExaltation(item.system, stats, modifiers,
{ currentMarker })`, com `stats = { characteristics, level, devotion, resolveMax }`.

`computeExaltation` devolve `{ powerStat: {value, max, name}, resource: {name, max, value, spent,
debt, debtName, roundSpent, roundLimit, roundFull}, tell: {spent, level}, pressure: {max, value}|null,
powers: [{rank, name, unlocked}], healing }`.

## Relações e ciclo de vida

```text
Compêndio exaltations (9)          Compêndio exalted-assets (75, 10 pastas)
   │ arrastar (dono)                    │ arrastar (dono)
   ▼                                    ▼
applyExaltation                      addExaltedAsset
   ├─ [confirmar troca se já tem]       ├─ validateAssetAdd ─ falha ─► aviso (GM: confirmar mesmo assim)
   ├─ [escolha: Statuesque/elemento]    ├─ aviso "só na criação"
   │    cancelar ─► nada muda           └─ cria feat embutido + buildAssetEffects
   ├─ apaga exaltação atual + assets ligados ─► clamp heroPoints
   ├─ cria exaltation { powerStat 1, spent 0, selection, effects }
   ├─ Paragon: heroPoints.value += 2; Perfection ─► asset racial do compêndio
   │
   ├─ setPowerStat(n) ─► powerStat.value (1..teto)
   ├─ spend / recover / adjust / unravel ─► resource.spent, round, scene
   ├─ newScene ─► scene.spent = 0, round.spent = 0, pressure.spent = 0
   ├─ reconfigureExaltation ─► troca efeitos do item
   └─ removeExaltation ─► apaga item + assets com prerequisites.exaltation = nome ─► clamp heroPoints

applyRace/removeRace (002) ─► se Paragon: syncPerfection (troca asset racial; revalida Statuesque)
```

Invariantes: 0 ou 1 `exaltation` por personagem (serviço + `DtdItem#_preCreate`); no máximo 1
`feat` `exaltedAsset` fora dos grupos `paragon`/`paragonRacial`, salvo inclusão confirmada pelo
Mestre.

## Fontes dos compêndios

- `src/packs/exaltations/<slug>.json` — `{ _id, _key: "!items!<_id>", name, type: "exaltation", img,
  system: {…estado vazio}, effects: [], flags: {} }`.
Pasta **plana** (o `compilePack` da 002 roda sem `recursive`, e o `extract-packs` grava plano):

- `src/packs/exalted-assets/folder-<group>.json` — `{ _id, _key: "!folders!<_id>", name, type:
  "Item", sorting: "a", color: null }` (10 pastas do compêndio).
- `src/packs/exalted-assets/<group-slug>-<slug>.json` (ex. `chosen-mark-of-khorne.json`) — `{ _id,
  _key, name, type: "feat", folder: <_id da pasta>, system: { category: "exaltedAsset", … } }`.

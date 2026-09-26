# Data Model — 002-race-compendium

Complementa `specs/001-system-foundation/data-model.md`. Chaves de característica e perícia são
as de `module/config.mjs` (`str`, `dex`, …; `academicLore`, `ballistics`, …).

## Item `race` — `RaceData` (TypeDataModel)

| Campo | Tipo | Regra / validação | Origem |
|---|---|---|---|
| `description` | HTML | resumo em inglês, redação própria | FR-001, FR-008 |
| `fullText` | HTML | opcional; **sempre vazio no compêndio**; a mesa cola o texto do próprio exemplar no mundo | FR-001, constituição V |
| `source.book` | string | padrão `"DtD 7.7a"` | constituição I |
| `source.page` | inteiro ≥ 1 | página da raça | FR-001 |
| `characteristicBonus.options` | lista de chaves de característica, única | vazia quando `any` | FR-001, FR-002 |
| `characteristicBonus.any` | booleano | `true` = qualquer uma (Human) | FR-001 |
| `skillBonus.skills` | lista de chaves de perícia, única | perícias fixas | FR-001 |
| `skillBonus.choose` | inteiro 0–27 | nº de perícias à escolha (Human = 2) | FR-001 |
| `size` | inteiro 1–10 | Size da raça | FR-010 |
| `power.name` | string | nome original do livro | FR-001 |
| `power.description` | HTML | resumo em inglês | FR-008 |
| `power.automation` | `"none"` \| `"usesPerScene"` \| `"heroicHeritage"` \| `"shifty"` \| `"squatToughness"` | padrão `"none"` | FR-016–FR-018 |
| `power.uses.spent` | inteiro ≥ 0 | só usado com `usesPerScene` | FR-017, research R5 |
| `lore.height` | string | ex. `"2.4–2.6 m"` | FR-001 |
| `lore.weight` | string | ex. `"100–140 kg"` | FR-001 |
| `lore.languages` | lista de strings | | FR-001 |
| `lore.personality` | lista de strings | | FR-001 |
| `lore.physical` | lista de strings | | FR-001 |
| `lore.names` | lista de strings | | FR-001 |
| `choice.characteristic` | chave de característica ou `""` | preenchida na aplicação | FR-009 |
| `choice.skills` | lista de chaves de perícia, única | tamanho = `skillBonus.choose` | FR-009 |

**Derivado (não persistido, `prepareDerivedData`)**: `power.uses.max` e `power.uses.remaining`
quando o item está num ator (`usesPerScene(actor.system.level)`), e `needsChoice`.

**Regras de validação da escolha** (`validateRaceChoice`, puro):
- `choice.characteristic` MUST estar em `options` (ou ser qualquer característica se `any`);
  se `options` tem um único item e `any` é falso, a escolha é automática.
- `choice.skills` MUST ter exatamente `choose` perícias distintas, nenhuma repetida em
  `skillBonus.skills`.

## Active Effects raciais (gerados por `buildRaceEffects`, research R1–R4)

Todos com `transfer: true`, `origin` = uuid do item, `flags.dtd40k.racial = <id>`; um efeito
por linha:

| `racial` id | Condição | Change (`key`, `mode`, `value`) |
|---|---|---|
| `size` | sempre | `system.size`, OVERRIDE, `size` |
| `characteristic` | sempre | `system.characteristics.<choice.characteristic>.value`, ADD, `1` |
| `skill.<key>` | cada perícia de `skills` ∪ `choice.skills` | `system.skills.<key>.value`, ADD, `1` |
| `power` | `heroicHeritage` | `system.heroPoints.max`, ADD, `1` |
| `power` | `shifty` | `system.modifiers.staticDefenseFormula`, OVERRIDE, `"shifty"` |
| `power` | `squatToughness` | `system.modifiers.resilience`, ADD, `1` |

Nomes dos efeitos: chaves i18n resolvidas na criação (ex. `"Eldarin: +1 Wisdom"`).

## Alterações em `CharacterData` (ator `character`)

| Campo | Tipo | Regra |
|---|---|---|
| `modifiers.staticDefenseFormula` | `"standard"` \| `"shifty"` | padrão `"standard"`; só alterado por efeito; nunca é input da ficha |
| `modifiers.resilience` | inteiro | padrão 0; só alterado por efeito; nunca é input da ficha |

**`prepareDerivedData` (ordem)**:
1. Limitar a 6 cada `characteristics.*.value` e `skills.*.value` (FR-015); registrar em
   `capped` (derivado, ex. `capped["characteristics.wis"] = true`).
2. `computeDerived(this, derivedMods, modifiers)` — Static Defense pela fórmula de
   `modifiers.staticDefenseFormula`; Resilience base + `modifiers.resilience`; depois
   bônus/override do Mestre (FR-019).

**Valor base x final** (FR-014): base = `actor._source.system.<path>`; final =
`actor.system.<path>`; bônus racial exibido = final − base.

## Relações e ciclo de vida

```text
Compêndio races (12 Items race, bloqueado)
   │  arrastar para a ficha (dono)
   ▼
applyRace ──► [escolha: DialogV2] ──cancelar──► nada muda
   │ confirmar
   ├─ apaga race existente (e seus efeitos) ─► clamp heroPoints.value ≤ max
   └─ cria Item race embutido { system.choice, effects: buildRaceEffects }
         │  heroicHeritage: heroPoints.value += 1
         ├─ reconfigurar escolha ─► substitui os efeitos do item
         ├─ spendUse / resetUses ─► power.uses.spent
         └─ remover ─► apaga item (efeitos junto) ─► clamp heroPoints.value ≤ max
```

Invariante: um personagem tem 0 ou 1 item `race` (serviço + `DtdItem#_preCreate`).

## Fonte do compêndio — `src/packs/races/<slug>.json`

```json
{
  "_id": "<16 chars>",
  "_key": "!items!<_id>",
  "name": "Eldarin",
  "type": "race",
  "img": "icons/svg/<icon>.svg",
  "system": { "…": "campos de RaceData, choice vazio" },
  "effects": [],
  "flags": {}
}
```

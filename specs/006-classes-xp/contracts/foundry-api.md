# Contract — Interfaces expostas no Foundry (006)

## Manifesto

- `documentTypes.Item.class: { htmlFields: ["description", "completion.text"] }`.
- Pack `{ "name": "classes", "label": "Classes", "path": "packs/classes", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }`.

## Registro

`CONFIG.Item.dataModels.class = ClassData`; `ClassSheet` para `class`.

## Ficha de classe (`ClassSheet`)

Cabeçalho (nome, Level, trilha, página), pré-requisitos, listas (características, perícias), feats (obrigatório /
opcional / grupos "A ou B"), escolas, bônus de conclusão (texto + automação). Somente leitura no compêndio
bloqueado; edição com listas indexadas (padrão das fichas da 004/005).

## Ficha do personagem

- **Modos**: `edit` (livre), `play`, **`advance`** (novo): botões `+ custo` em características, perícias e Power
  Stat (`advanceCharacteristic`, `advanceSkill`, `advancePowerStat`), com o motivo da recusa em tooltip.
- **Aba `class`** (nova, depois de Traits): classe atual (progresso n/total, feats com estado, botão `buyClassFeat`
  nos que faltam), Free Study, classes concluídas (bônus, efeitos com caixa do Mestre, `uncompleteClass` e
  `removeClass` para o Mestre), XP (total/gasto/disponível, histórico com `undoXp`, `awardXp` e XP inicial para o
  Mestre).
- **Cabeçalho**: "Class: <atual>" na linha de identidade; Level só editável sem classes.
- **Drop**: `class` de fora do ator → `startClass`.

## Serviços

`module/documents/class-service.mjs`: `getClasses(actor)`, `getCurrentClass(actor)`, `startClass(actor, item)`,
`syncClassCompletion(actor)`, `completeClass(actor, item)`, `uncompleteClass(actor, item)`, `removeClass(actor, id)`.

`module/documents/xp-service.mjs`: `advance(actor, kind, key)`, `chargeForFeat(actor, feat, selection)` (usado
pelo `addFeat` da 005), `recordPurchase`, `undoXp(actor, entryId)`, `awardXp(actor, amount, reason)`.

- Recusas: aviso `DTD.Class.Error.*` / `DTD.XP.Error.*`; o Mestre recebe "incluir mesmo assim" (sem cobrança).
- `DtdItem#_onCreate` (feat, autor) → `syncClassCompletion`; `grantFeats` (005) lê `completion.grants` de
  classes concluídas.

## i18n

`TYPES.Item.class`, `DTD.Sheet.Class`, `DTD.Sheet.Tab.class`, `DTD.Sheet.ModeAdvance`, `DTD.Class.*` (campos,
estados, progresso, Free Study, erros, avisos, bônus), `DTD.XP.*` (Total, Spent, Available, Starting, Log, Award,
AwardReason, Undo, Cost, Kind.*, Error.*, Confirm).

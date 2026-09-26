# Contract — Interfaces expostas no Foundry (005)

## Manifesto `system.json`

- Pack `{ "name": "feats", "label": "Feats", "path": "packs/feats", "type": "Item", "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }`.
- `initiative`: `1d10 + @characteristics.dex.value + @characteristics.cmp.value + @modifiers.initiative` (e o mesmo em `CONFIG.Combat.initiative`).

## Ficha de feat (`FeatSheet` da 004, estendida)

Campos novos visíveis por categoria: raça exigida (racialFeat), XP concedido (hindrance), repetível,
feat de grupo + opções (lista editável), dependências (lista `tipo: nome`), concessões (lista
`nome (subcategoria) / à escolha`), automação (`FEAT_AUTOMATION`). No personagem, mostra a escolha
(subcategoria, característica, perícia, especialidade). Compêndio bloqueado → somente leitura.

## Ficha do personagem — aba Traits

- Nova partial `templates/actor/parts/feats.hbs` (após os Exalted Assets), contexto de
  `module/apps/feats-context.mjs`, com seções **Feats** (inclui raciais, com a raça), **Assets** e
  **Hindrances** (com "n / 2"). Cada linha: nome completo (abre a ficha), badges ("concedido por
  <origem>", "comprado", "raça incompatível"), resumo, modificadores (caixa só do Mestre) e remover
  (dono para comprados; concedidos só Mestre).
- Especialidades: `specialties.hbs` lista a base do `_source` com remover e as extras de feats sem
  remover, com tooltip do feat (research R5); `addSpecialty`/`removeSpecialty` passam a ler o `_source`.
- Rodapé: iniciativa = Dex + Cmp + `modifiers.initiative`.
- Drop: `feat` com `category !== "exaltedAsset"` de fora do ator → `addFeat`.

## Serviço — `module/documents/feat-service.mjs`

```js
getFeats(actor, { category } = {});         // → Item[] (exclui exaltedAsset)
await promptFeatSelection(feat, ctx, current); // → Promise<selection|null>
await addFeat(actor, featItem, { selection, grantedBy } = {}); // → Promise<Item|null>
await removeFeat(actor, itemId);            // → Promise<void>
await grantFeats(actor, originItem);        // chamado por DtdItem#_onCreate
await releaseGrants(actor, originId);       // chamado por DtdItem#_onDelete
```

- `addFeat`: ator não `character` → aviso; seleção (`needsFeatSelection`) por `feat-choice.hbs`
  (cancelar → `null`); `validateFeatAdd` → erros: aviso `DTD.Feat.Error.<e>` e, para o Mestre,
  `DialogV2.confirm` `DTD.Feat.GMOverride`; avisos: `DialogV2.confirm` `DTD.Feat.MissingDependency`;
  notices: `ui.notifications.info`. Já concedido com o mesmo `fullName` → só marca `purchased`. Cria o
  item com `name = fullName`, `system.selection`, `effects` de `buildFeatEffects` (`transfer`, `origin`,
  `flags.dtd40k.feat = <automation>`, nome `DTD.Feat.Effect`). Nine Lives: `heroPoints.value += 1`.
- `removeFeat`: confirmação; item concedido (grantedBy não vazio e não comprado) → só Mestre; se comprado
  e concedido, só desmarca `purchased`. Depois limita Hero Points ao máximo.
- `grantFeats`: `grants` do item (raça, exaltação por `activeGrants`, feat/asset); resolve pelo índice de
  `dtd40k.feats` e `getDocuments({ _id__in })`; `choose` → `promptFeatSelection`; aplica `grantPlan`.
  Nome ausente → aviso `DTD.Feat.GrantMissing`.
- `releaseGrants`: aplica `releasePlan` (updates de flags, deletes em lote).
- `DtdItem#_onCreate`/`_onDelete`: só no cliente do autor (`userId === game.user.id`) e só para itens
  embutidos em `character`. Mudanças de Power Stat que cruzam o `rank` de uma concessão chamam
  `grantFeats`/`releaseGrants` a partir de `setPowerStat` (exaltation-service).

## Integração com 002/004

- `asset-service.addExaltedAsset` e `race-service`/`exaltation-service` não mudam o fluxo: as
  concessões entram pelo `_onCreate` dos itens que eles criam.
- `exaltation-context`/`assets.hbs`: badge "concede N feats" nos Exalted Assets com `grants`.

## i18n (novas chaves, `en` e `pt-BR`)

`DTD.Feat.*` (Feats, Assets, Hindrances, Category.{feat,racialFeat,asset,hindrance}, XpCost, XpGranted,
Repeatable, Group, Options, Subcategory, SubcategoryHint, Requires, RequireType.{feat,racePower}, Grants,
Choose, Automation.<15>, Race, GrantedBy, Purchased, WrongRace, HindranceCount, Remove, RemoveConfirm,
RemoveGranted, GMOverride, MissingDependency, CreationOnly, ExtraHindrances, GrantMissing, Effect,
ChooseTitle, ChooseCharacteristic, ChooseCharacteristic2, ChooseSkill, Specialty, DropHint,
Error.{notRepeatable,duplicate,wrongRace,noRace,hindranceLimit,noSubcategory,characteristic,characteristic2,skill,specialty}),
`DTD.Sheet.FromFeat`.

## Build

`npm run build:packs` compila `src/packs/feats` junto com os demais; conferir o pack compilado no Foundry
(contagem do índice) antes de registrar validação de dados.

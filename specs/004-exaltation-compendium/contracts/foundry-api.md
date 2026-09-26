# Contract — Interfaces expostas no Foundry (004)

## Manifesto `system.json` (acréscimos)

- `documentTypes.Item.exaltation: { htmlFields: ["description", "fullText", "resource.recovery",
  "tell", "lore.origin", "lore.appearance", "lore.society"] }` (descrições de `staticPowers`,
  `powers` e `elements` são enriquecidas na ficha).
- `documentTypes.Item.feat: { htmlFields: ["description"] }`.
- `packs` (mesmo `ownership` de `races`):
  ```json
  [{ "name": "exaltations", "label": "Exaltations", "path": "packs/exaltations", "type": "Item", "system": "dtd40k",
     "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } },
   { "name": "exalted-assets", "label": "Exalted Assets", "path": "packs/exalted-assets", "type": "Item", "system": "dtd40k",
     "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }]
  ```

## Registro (`dtd40k.mjs`, hook `init`)

- `CONFIG.Item.dataModels.exaltation = ExaltationData`; `CONFIG.Item.dataModels.feat = FeatData`.
- `registerSheet(Item, "dtd40k", ExaltationSheet, { types: ["exaltation"], makeDefault: true, label: "DTD.Sheet.Exaltation" })`;
  idem `FeatSheet` para `feat` (`DTD.Sheet.Feat`).
- Hook `updateCombat` (mudança de `round` ou `turn`): re-renderiza as `CharacterSheet` abertas dos
  combatentes; **não grava nada** (research R4).

## Fichas de item (ItemSheetV2 + HandlebarsApplicationMixin)

**`ExaltationSheet`**

| Seção | Conteúdo | Editável (`isEditable`) |
|---|---|---|
| Cabeçalho | imagem, nome, fonte (livro, página) | nome, imagem, página |
| Power Stat & Resource | nome do Power Stat, teto; recurso, fórmula (texto i18n), `fixedMax`, dívida, cura, Pressure, ações de recuperação, texto de recuperação | todos (seletores para enums; ações como lista add/remove) |
| Static Powers | nome, automação, descrição | lista add/remove; editor por entrada |
| Powers by Rank | 5 linhas fixas (ponto 1–5): nome, descrição | nome e descrição |
| Elements | só se houver: nome, característica, HP, descrição | lista add/remove |
| The Tell | descrição + tabela dos 4 níveis (i18n, p. 65) | descrição |
| Description / Lore | resumo, origem, aparência, sociedade, exemplos | editores |

**`FeatSheet`**: cabeçalho, categoria, grupo, exaltação/raça/divindade exigidas, XP, automação,
descrição. Compêndio bloqueado → somente leitura com o aviso da 002 (`DTD.Race.LockedPackHint`
generalizado para `DTD.Item.LockedPackHint`, com o nome do compêndio como parâmetro).

## Ficha do personagem — alterações

- **Cabeçalho**: linha de identidade ganha `Exaltation: <nome>` (`data-action="openExaltation"`) ou
  "—".
- **Aba Traits** (abaixo do cartão da raça), contexto montado por
  `module/apps/exaltation-context.mjs` a partir de `actor.system.exaltation`:
  - Sem exaltação: aviso `DTD.Exaltation.DropHint`.
  - Cartão: imagem, nome, "i" (`showExaltationInfo`: descrição, ambientação, Tell, fonte),
    `reconfigureExaltation` (se houver escolha) e `removeExaltation` (donos).
  - Power Stat: nome + pontos 1–10 (`setPowerStat`, `data-value`), teto destacado; pontos acima do
    teto desabilitados (donos).
  - Recurso: `atual / máximo`; `spendResource`; um botão por `resource.actions` (`recoverResource`,
    `data-index`); `adjustResource` (input numérico, donos); dívida `Paradox 2`; rodada `n / PS`
    (`resetRound`); `newScene`.
  - Tell: nível (`DTD.Exaltation.Tell.level<n>`) + descrição da exaltação.
  - Pressure (Paragon): `atual / máximo`, `spendPressure` (input N), `regainPressure` (+5, +PS).
  - Gastos genéricos (lista fixa i18n, cura conforme `resource.healing`).
  - Poderes estáticos e tabela de 5 poderes (liberado/bloqueado com "ponto N").
  - Modificadores (efeitos `exalted` e `asset`) com caixa só do Mestre (`toggleExaltationEffect`).
  - Exalted Assets: nome (abre a ficha), grupo, resumo, `removeAsset` (donos).
- **Drop** (`_onDropItem`): `exaltation` → `applyExaltation`; `feat` com `category === "exaltedAsset"`
  → `addExaltedAsset`; itens do próprio ator seguem o core (reordenar), como a raça.

## Serviços

`module/documents/exaltation-service.mjs`:

```js
getExaltation(actor);                       // → Item|null
await applyExaltation(actor, item);         // → Promise<Item|null>; null se cancelado/recusado
await reconfigureExaltation(actor);         // → Promise<Item|null>
await removeExaltation(actor);              // → Promise<void> (confirmação; apaga assets ligados)
await setPowerStat(actor, value);           // → limita a 1..teto
await spendResource(actor);                 // → spendCheck; overLimit → DialogV2.confirm
await recoverResource(actor, index);        // → applyResourceAction
await adjustResource(actor, value);         // → spent = max − clamp(value, 0, max)
await resetRound(actor); await newScene(actor);
await spendPressure(actor, n); await regainPressure(actor, amount);
await syncPerfection(actor);                // chamado pelo race-service após aplicar/remover raça
```

`module/documents/asset-service.mjs`:

```js
getExaltedAssets(actor);                    // → Item[]
await addExaltedAsset(actor, item, { granted } = {}); // → Promise<Item|null>
await removeExaltedAsset(actor, itemId);
```

- Ator que não é `character`: aviso `DTD.Exaltation.NotCharacter`, `null`.
- Troca: se já há exaltação, `DialogV2.confirm` (`DTD.Exaltation.ReplaceConfirm`, perde o Power
  Stat e os assets); depois a escolha (`templates/dialog/exaltation-choice.hbs`, pulada se
  `needsSelection` é falso); cancelar → nada muda.
- Ordem ao aplicar: montar dados (estado zerado, `selection`, efeitos) → validar com
  `validate({ strict: true })` → apagar exaltação atual e assets ligados → criar → Paragon:
  `heroPoints.value += 2` e `syncPerfection`. Mesmo risco aceito da 002 (sem transação).
- Remover/trocar: após apagar, `heroPoints.value = min(value, max)`.
- `addExaltedAsset`: `validateAssetAdd` → falha: aviso `DTD.Asset.Error.<error>`; Mestre recebe
  `DialogV2.confirm` (`DTD.Asset.GMOverride`) → cria com `buildAssetEffects`; aviso informativo
  `DTD.Asset.CreationOnly` (exceto `granted`); Action Hero: `heroPoints.value += 1`.
- `DtdItem#_preCreate`: recusa uma segunda `exaltation` no mesmo ator (`DTD.Exaltation.OnlyOne`).
- Todas as ações exigem `actor.isOwner`; efeitos só pelo Mestre.

## Alteração em `race-service.mjs` (002)

No fim de `applyRace` e de `removeRace` (após o sucesso): `await syncPerfection(actor)` — sem efeito
se o personagem não for Paragon.

## i18n (novas chaves, `en` e `pt-BR`)

`TYPES.Item.exaltation`, `TYPES.Item.feat`, `DTD.Sheet.Exaltation`, `DTD.Sheet.Feat`,
`DTD.Item.LockedPackHint`,
`DTD.Exaltation.*` (Exaltation, None, DropHint, PowerStat, Cap.{level,levelAndDevotion}, Resource,
Formula.{motes,favor,essence,breath,actionPoints,pyros,vitae,rage,plasm,fixed}, FixedMax, Recovery,
Action.{restoreAll,regain,lose,unravel}, Spend, Adjust, Debt, Round, ResetRound, RoundLimit,
NewScene, Empty, Tell, Tell.level0–4, Pressure, SpendPressure, RegainPressure, GenericSpends,
Spend.{heal,skill,reaction,stunned,dazed}, Healing.{outOfCombat,anytime,never}, StaticPowers,
Powers, Rank, Locked, Unlocked, Automation.{none,destiny,statuesque,perfection,bloodQuickening},
Elements, Element, ChooseTitle, ChooseStatuesque, ChooseElement, Confirm, Reconfigure, Remove,
RemoveConfirm, ReplaceConfirm, NotCharacter, OnlyOne, InvalidChoice, NoRace, NoPerfectionAsset,
Info, Lore.{origin,appearance,society,examples}, Effect.{destiny,statuesque,element,elementHp},
Modifiers, ModifiersHint),
`DTD.Asset.*` (Assets, Group.<10 grupos>, Category.exaltedAsset, Exaltation, Race, Deity, XpCost,
Automation.<9>, Remove, CreationOnly, GMOverride, Error.{noExaltation,wrongExaltation,wrongRace,
duplicate,limit}, Effect.<automation>).

## Build dos compêndios

```bash
npm run build:packs
```

Sem mudança nos scripts: `build-packs.mjs` e `extract-packs.mjs` já percorrem todas as pastas de
`src/packs/` (research R9).

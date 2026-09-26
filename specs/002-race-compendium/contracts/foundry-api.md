# Contract — Interfaces expostas no Foundry (002)

## Manifesto `system.json` (acréscimos)

- `documentTypes.Item.race: { htmlFields: ["description", "power.description"] }`.
- `packs`:
  ```json
  [{ "name": "races", "label": "Races", "path": "packs/races", "type": "Item",
     "system": "dtd40k", "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" } }]
  ```

## Registro (`dtd40k.mjs`, hook `init`)

- `CONFIG.Item.dataModels.race = RaceData`; `CONFIG.Item.documentClass = DtdItem`.
- `DocumentSheetConfig.registerSheet(Item, "dtd40k", RaceSheet, { types: ["race"], makeDefault: true, label: "DTD.Sheet.Race" })`.
- Partials novas pré-carregadas (`templates/actor/parts/traits.hbs`, `templates/item/*`).

## Ficha da raça — `RaceSheet` (ItemSheetV2 + HandlebarsApplicationMixin)

| Seção | Conteúdo | Editável quando `isEditable` |
|---|---|---|
| Cabeçalho | imagem, nome, fonte (livro, página) | nome, imagem, página |
| Racial Statistics | bônus de característica (opções ou "qualquer uma"), perícias (fixas e/ou "escolha N"), Size | checkboxes de características + `any`; checkboxes das 27 perícias + `choose`; Size |
| Racial Power | nome, automação, descrição | nome, seletor de automação, editor HTML |
| Description | resumo | editor HTML |
| Lore | altura, peso, idiomas, traços, nomes | campos de texto; listas como texto separado por vírgula |

Raças do compêndio bloqueado: somente leitura (padrão do core).

## Ficha do personagem — alterações

- **Abas** (`static TABS`, grupo `primary`): `main` (características + perícias, conteúdo da
  001) e `traits`. Navegação com a partial do core `templates/generic/tab-navigation.hbs`.
  Aba ativa lembrada em `game.user.getFlag("dtd40k", "sheetTabs")[actor.id]`.
- **Cabeçalho**: linha de identidade ganha `Race: <nome>` (`data-action="openRace"`) ou
  "—" sem raça. Inputs `system.size` e `system.heroPoints.max` mostram o valor **base**
  (`_source`) no modo edição, com o valor final ao lado quando diferente (research R3).
- **Pontos** (`setDots`): leem `base` do `_source` e `final` do documento e gravam
  `nextBaseValue({ base, final, clicked })` (contracts/rules-api.md); pontos do bônus racial com estilo
  próprio (`.dot.racial`), valor limitado com ícone/tooltip `DTD.Race.Capped`.
- **Aba Traits**:
  - Sem raça: aviso `DTD.Race.DropHint`.
  - Com raça: imagem, nome, bônus aplicados (característica e perícias escolhidas), ações
    `reconfigureRace` e `removeRace` (só donos), poder (nome + descrição).
  - `usesPerScene`: `restantes / máximo` + ações `spendRaceUse` e `resetRaceUses` (só donos).
- **Drop**: `_onDropItem(event, item)` → se `item.type === "race"`, retorna
  `applyRace(this.actor, item)`; caso contrário, comportamento do core.

## Serviço — `module/documents/race-service.mjs`

```js
await applyRace(actor, raceItem);     // → Promise<Item|null>; null se cancelado ou recusado
await reconfigureRace(actor);         // → Promise<Item|null>; reabre a escolha da raça atual
await removeRace(actor);              // → Promise<void>
getRace(actor);                       // → Item|null
```

- Ator que não é `character`: `ui.notifications.warn(localize("DTD.Race.NotCharacter"))`, `null`.
- Escolha: `DialogV2.wait` com `templates/dialog/race-choice.hbs` (radio de característica;
  checkboxes de perícia limitadas a `choose`); pulada quando `needsChoice` é falso.
  Cancelar → `null`, nada muda. Escolha inválida → aviso e o diálogo continua aberto.
- Ordem ao aplicar: montar os dados do item (`system.choice` + `effects: buildRaceEffects(...)`,
  nomes i18n) → validar com `new Item.implementation(data, { parent: actor }).validate({ strict: true })`
  (falha → aviso `DTD.Race.InvalidChoice`, `null`, nada muda) → apagar raça atual → criar item
  → Human: `heroPoints.value += 1`. Uma falha de rede entre apagar e criar deixa o personagem
  sem raça; basta arrastar de novo (risco aceito, sem transação no Foundry).
- Drop de uma raça que já pertence ao próprio ator (`item.parent?.uuid === actor.uuid`): segue
  o `super._onDropItem` (reordenação), sem chamar o serviço.
- Ao remover/trocar: após apagar, `heroPoints.value = min(value, max)`.
- `DtdItem#_preCreate`: recusa um segundo `race` no mesmo ator com
  `ui.notifications.warn(localize("DTD.Race.OnlyOne"))`.

## i18n (novas chaves, `en` e `pt-BR`)

`TYPES.Item.race`, `DTD.Sheet.Race`, `DTD.Sheet.Tab.main`, `DTD.Sheet.Tab.traits`,
`DTD.Race.*` (Race, None, DropHint, Choose, ChooseCharacteristic, ChooseSkills, AnyCharacteristic,
ChooseN, Size, Power, Automation.{none,usesPerScene,heroicHeritage,shifty,squatToughness},
Uses, SpendUse, NewScene, Reconfigure, Remove, RemoveConfirm, Capped, RacialBonus, NotCharacter,
OnlyOne, InvalidChoice, Description, Lore, Height, Weight, Languages, Personality, Physical,
Names, Source, Page, Effect.{size,characteristic,skill,power}).

## Build do compêndio

```bash
npm run build:packs
```

`scripts/build-packs.mjs`: `compilePack("src/packs/races", "packs/races", { log: true })` do
`@foundryvtt/foundryvtt-cli` (devDependency). Foundry fechado durante o build.

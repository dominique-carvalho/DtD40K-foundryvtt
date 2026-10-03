# Contract: integração Foundry (021)

## Fichas

- `CharacterSheet` (base, `module/apps/character-sheet.mjs`): mantém DEFAULT_OPTIONS, ações, TABS, PARTIALS e
  `_prepareContext`; ganha `context.rail` (ver data-model). Continua sendo a base da `NpcSheet`.
- `CogitatorSheet extends CharacterSheet` (`module/apps/cogitator-sheet.mjs`):
  - `DEFAULT_OPTIONS`: `classes: ["layout-cogitator"]`, `position: { width: 900, height: 900 }`.
  - `PARTS`: `header → templates/actor/cogitator/rail.hbs`, `tabs → cogitator/tabs.hbs`, `main → cogitator/main.hbs`;
    os demais PARTS iguais aos da base.
- `IlluminatedSheet extends CharacterSheet` (`module/apps/illuminated-sheet.mjs`):
  - `DEFAULT_OPTIONS`: `classes: ["layout-illuminated"]`, `position: { width: 800, height: 900 }`.
  - `PARTS`: `header → illuminated/header.hbs`, `tabs → illuminated/tabs.hbs`, `main → illuminated/main.hbs`.
- Registro (`dtd40k.mjs`):
  - `registerSheet(Actor, "dtd40k", CogitatorSheet, { types: ["character"], makeDefault: true, label: "DTD.Sheet.Cogitator" })`
  - `registerSheet(Actor, "dtd40k", IlluminatedSheet, { types: ["character"], label: "DTD.Sheet.Illuminated" })`
  - a `CharacterSheet` deixa de ser registrada para `character`; a `NpcSheet` continua para `npc`.
- Templates novos preservam: `data-action` (`toggleMode`, `editImage`, `rollCharacteristic`, `rollSkill`, `setDots`,
  `openRace`, `openExaltation`, evolução e especialidades), os `name` dos campos e os seletores que o JS da ficha
  procura (filtros de perícia, `.trait.skill[data-*]`, `.specialty-*`, abas `data-group="primary"`/`data-tab`).

## CSS

| Arquivo | Escopo |
|---|---|
| `fonts.css` | `@font-face` com `url("../fonts/…woff2")` |
| `tokens.css` | `.dtd40k` (Vellum); `.theme-dark .dtd40k`, `.dtd40k.themed.theme-dark`, `.themed.theme-dark .dtd40k` (Cogitator); `.themed.theme-light .dtd40k`, `.dtd40k.themed.theme-light` (Vellum de novo) |
| `components.css` | `.dtd40k` + classes existentes: `.dot(.filled/.superhuman/.racial/.locked)`, `.section-title`, `.tag`, `.automation-tag`, `.feat-badge`, `button`, `input`, `select`, painéis |
| `dtd40k.css` | atual, com tokens no lugar de hex e de `--color-*` |
| `chat.css` | raízes `.dtd40k.<card>` dos 19 cartões; `.roll-die.kept/.dropped/.exploded`; `.roll-card-outcome.success/.failure` |
| `sheet-cogitator.css` | `.dtd40k.layout-cogitator …` |
| `sheet-illuminated.css` | `.dtd40k.layout-illuminated …` |

## Release

- `.github/workflows/release.yml`: `fonts` entra na lista do zip.

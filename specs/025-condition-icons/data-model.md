# Data model — 025 Ícones das condições e dos efeitos

## `src/icons/conditions.json`

```json
{
  "groups": { "harm": "seal", "impaired": "warning", "restrained": "inkMuted", "favorable": "phosphor" },
  "seals": [
    { "key": "stunned", "group": "impaired", "glyph": "skoll/knockout" },
    { "key": "effect:degeneration", "group": "harm", "glyph": "lorc/…" }
  ]
}
```

- `groups`: nome do grupo → cor de `ICON_COLORS` (024).
- `seals`: as 30 condições (chave = id da condição) e os efeitos de serviço (`effect:<chave>`).
- Validação (teste): as 30 condições de `STATUS_EFFECTS` presentes, glifos distintos entre as condições, grupo e glifo
  existentes.

## Arquivos gerados

- `assets/icons/conditions/<id>.svg` (30) e `assets/icons/effects/<chave>.svg` (4), selo redondo (research R1).

## `module/config.mjs`

- `STATUS_EFFECTS[i].img` = `systems/dtd40k/assets/icons/conditions/<id>.svg`.
- `ICONS.effect = { degeneration, martialSelf, martialTarget, barrelRoll }`.

## Efeitos

- `flags.dtd40k.effectIcon`: chave do efeito de serviço (novos efeitos).
- Efeitos de itens dos packs: `img` = `img` do item.

## Plano de atualização (`module/rules/icons.mjs`)

Entrada nova: `{ uuid, kind: "effect", img, statuses, flags, itemImg }` e `conditionImages`/`effectImages`.
Regra: só imagem do Foundry; condição → selo; flag → selo do efeito; senão `itemImg` do sistema.

# Contract — Interfaces no Foundry (015)

## Montador (`module/apps/weapon-builder.mjs`)

- `WeaponBuilder` (ApplicationV2): `new WeaponBuilder({ actor, item })`. Sem `actor`: Mestre, cria item de mundo. Com
  `actor`: arma na ficha (pendente se quem monta não é Mestre). Com `item`: reabre a montagem e atualiza o item.
- Botões: cabeçalho do diretório de itens (Mestre); aba Equipamento da ficha (dono); ficha da arma com `custom.build`.

## `weapon-craft-service` (`module/documents/weapon-craft-service.mjs`)

| Função | Comportamento |
|---|---|
| `createCustomWeapon(build, { actor, name })` | monta pelo `buildWeapon`; cria o item (mundo ou ficha; `pending` para jogador) |
| `updateCustomWeapon(item, build)` | remonta e atualiza o item |
| `approveWeapon(item, { craft })` | Mestre: `""` (pronta) ou `crafting` |
| `gatherMaterials(item)` | teste de Wealth no TN da raridade (sem ganhar item); registra |
| `craftWeapon(item)` | Crafts no TN da raridade; com materiais e Crafts ok → pronta |

## Extensões

- `acquisition-service.wealthTest(actor, { tn, key, label })` exportado (usado por `acquire` e por `gatherMaterials`).
- `attack-service.rollAttack`/`rollDamage`: condicionais dos mods da arma (R4) e notas no cartão.
- `equipment-service.toggleEquipped` e `rollAttack`: recusam arma `pending` ou `crafting`.
- Ficha de arma (`EquipmentSheet`): estado, notas, botões Aprovar (Mestre), Materiais, Fabricar e Montador.

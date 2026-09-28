# Data Model — 015-weapon-crafting

## Constantes puras (`module/rules/weapon-creation.mjs`)

| Nome | Conteúdo |
|---|---|
| `WEAPON_TEMPLATES` | `pistol, basic, cannon, heavyRifle, melee` → `{ family, weaponType, damage { rolled, kept, type }, pen, rof { single, auto }, range, clip, reload }` |
| `WEAPON_CREATION_TYPES` | `ranged { O, L, P, M, B, S, E, F }`, `melee { O, P, C, F, N, T, S, A, H, U }` → `{ name, group, proficiencies, damageType: fixo \| lista \| null, damage { rolled, kept }, pen, range, clip, reload, qualities, rarity, extraMods }` |
| `WEAPON_MODS` | `ranged [46]`, `melee [22]` → `{ key, name, cost, compatibility: letras \| ["any"], effect { damage, pen, rof, range, clip, reload, explodeOn, noExplode, damageType, qualities }, condition, note }` |
| `WEAPON_AVAILABILITY` | 12 linhas `{ cost, rarity, tn }` (−3 Worthless 0 … +8 Glittergold 50) |

## `weapon` (extensão aditiva da 007)

| Campo | Tipo |
|---|---|
| `custom.build` | `{ family: "" \| ranged \| melee, template, type, damageType, mods: [key] }` |
| `custom.status` | `"" \| pending \| crafting` (vazio = arma comum ou pronta) |
| `custom.crafting` | `{ materials: bool, crafted: bool, attempts: int }` |
| `custom.notes` | `[string]` (texto próprio dos mods especiais) |

**Estados**: montada pelo Mestre → `""`; montada pelo jogador → `pending` → (Mestre) `""` ou `crafting` →
(materiais ✓ e Crafts ✓) `""`. `pending` e `crafting` não equipam nem atacam.

## Mensagens

- Cartão de ataque: `flags.dtd40k.attack.mods` (condicionais aplicados) e notas da arma.
- Cartão de dano: `unstable { d10, factor }`, `orgone` quando um dado explodiu.

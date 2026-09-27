# Data Model — 012-npcs-minions

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `NPC_CATEGORIES` | `people, military, criminals, cultists, machines, daemons, creatures, legends, undead, xenos` |
| `NPC_TRAITS` | 20 chaves (rótulo e dica i18n; `hasValue`) |
| `MINION` | `{ maxCount: 6, sdPerThreat: 5, damagePerRating: 5, rangePerThreat: 10 }` |

## Regras puras

- `rules/npc.mjs`: `TRAIT_TEXT` (efeito próprio), `traitValue`, `traitArmor`, `traitAura`, `immunities`,
  `regeneration`, `fearRating`, `isAmorphous`, `isMindless`.
- `rules/minions.mjs`: `squadDerived`, `squadPool`, `minionDamage`, `casualties`, `allyBonus`.

## `npc` (Actor)

`CharacterData` + `npc`:

| Campo | Tipo |
|---|---|
| `category` | `NPC_CATEGORIES` |
| `description` | HTML (texto próprio) |
| `traits` | `[{ key, value: string }]` |
| `abilities` | `[{ name, effect }]` |
| `feats`, `gear` | string[] |
| `armor` | `[{ name, ap, locations: string[] }]` (`all` = todos) |
| `alternate` | string (forma alternativa, ex.: Zoanoid) |
| `resource` | `{ type, value, max }` |
| `source` | `{ book, page }` |

Valores do bloco em `derivedMods.<staticDefense|mentalDefense|hpMax|speed|resilience>.override`.

## `minionSquad` (Actor)

| Campo | Tipo |
|---|---|
| `threatRating` | 1–5 |
| `count` | 0–6 |
| `melee`, `ranged` | `{ rating 0–5, type: I\|R\|E\|X, weapon }` |
| `allyUuid` | uuid do herói ou "" |
| `description`, `source` | HTML; `{ book, page }` |
| derivado | `derived.staticDefense`, `derived.speed`, `range`, `defeated` |

## Flags

- Arma de NPC: `flags.dtd40k.npcDamage = true` (dano sem Força).
- Cartão de dano: `flags.dtd40k.damage.raises`, `.blast` (baixas de minions); cartão da squad `flags.dtd40k.minion`.

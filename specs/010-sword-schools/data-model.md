# Data Model — 010-sword-schools

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `MARTIAL_SCHOOLS` | 15 chaves → `{ name, kind: sword\|gunKata, skill }`: desertWind, devotedSpirit, diamondMind, ironHeart, settingSun, shadowHand, stoneDragon, tigerClaw, whiteRaven; clayPigeon, crisisZone, elementalGearbolt, pointBlank, silentScope, tinStar |
| `MARTIAL_ENTRY_TYPES` | `action, weapon, flaw, skill, advantage, mastery` |
| `MARTIAL_XP` | `perStylePoint: 50` (escolas usam `MAGIC_XP.newSchool`/`perRank`) |
| `XP_KINDS` | + `martial`, `specialAttack` |

## Regras puras (`module/rules/martial.mjs`)

`UNIVERSAL_ADVANTAGES` (5) e `UNIVERSAL_RESTRICTIONS` (7): `{ slug, name, cost, perPoint, automation }`.

## `martialSchool`

| Campo | Tipo |
|---|---|
| `key` | chave de `MARTIAL_SCHOOLS` |
| `kind` | `sword` \| `gunKata` |
| `keySkill` | chave de perícia |
| `weaponGroup` | grupo da 007 (Sword Schools) ou "" |
| `summary`, `description`, `source` | texto próprio; HTML; `{ book, page }` |
| `entries` | `[{ id, rank 1–5, type, name, cost: int\|null, perPoint, variableCost: int[], effect, automation }]` |

`automation` (todas opcionais): `attack {rolled, kept}`, `damage {rolled, kept}`, `pen` (por ponto), `penZero`,
`noStrength`, `explodeOn`, `damagePerRaise {rolled}`, `quality {key, value}`, `onHit [{condition, rounds: n\|"perRaise"}
\| {fatigue}]`, `onMiss [{condition}]`, `self [{changes, untilNextTurn} \| {fatigue}]`, `resolve {ignoreArmor,
resilienceMod, resilienceMultiplier, noCritical}`, `requires {weaponGroup, weaponType, noWeapon, targetStatus[],
hpHalf, reminder}`, `cooldown`, `perScene`, `test {skill}`, `unlocksAction` (chave de `COMBAT_ACTIONS`), `changes`
(passivas), `text: true`.

## Personagem

| Campo | Tipo |
|---|---|
| `martial.schools.<key>.value` | 0–6 |
| `martial.attacks` | `[{ id, name, kind: special\|trick, action, advantages: [{ref, count, choice}], restrictions: [{ref, count}], paid, history: [], state: { lastRound, lastCombat, usedScene, readyUntil } }]` |
| `martial.levels` (derivado) | `{ adeptLevel, gunslingerLevel }` |

## Flags

- Cartão de ataque: `flags.dtd40k.attack.special` = `{ attackId, name, modifiers }` (saída de `attackModifiers`).
- Cartão de dano: `flags.dtd40k.damage.resolve` = `{ ignoreArmor, resilienceMod, resilienceMultiplier, noCritical }`.
- Passivas: `flags.dtd40k.martialPassive = "<escola>:<entrada>"`.

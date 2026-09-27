# Data Model — 008-combat

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `STATUS_EFFECTS` | condições (id, nome i18n, ícone, `changes`): blinded, bloodLoss, dazed (rolls −1k0), deafened, diseased, onFire, helpless, immobilized, pinned, prone, restrained, stunned, surprised, unconscious, dead, grappled, jaded, lostHand, lostArm, lostEye, lostFoot, lostLeg; efeitos de ação: fullDefense (SD +10), fightDefensively, allOutAttack, healingSurge (SD +5), running (efeito de Run) |
| `DAMAGE_TABLE_TYPES` | `E energy · X explosive · I impact · R rending` |
| `CRITICAL_LOCATIONS` | hit location → tabela: leftArm/rightArm → arm, body, gizzards, head, leftLeg/rightLeg → legs |
| `FEAR_TN` | `1: 15, 2: 20, 3: 25, 4: 30, 5: 35` |
| `ACTION_TYPES` | `half, full, free, reaction, varies` |
| `ACTION_SUBTYPES` | `attack, melee, ranged, movement, concentration, miscellaneous, defense, provokes` |
| `RESOLVE_DRAIN_LIMIT` | 4 por cena (p. 446) |

## `rules/combat-actions.mjs`

Lista das 38 ações: `{ key, name, type, subtypes[], summary, page, automation }`; `automation`:
`attack: { rolled, kept, options }` (diálogo da 007), `roll: { skill|characteristic, tn }`, `effect: statusId` (até o
próximo turno), `reaction: "dodge"|"parry"`, `extraReactions`, `multiple`.

## Personagem (`character-data.mjs`)

| Campo | Tipo | Notas |
|---|---|---|
| `critical` | `{ value ≥ 0 }` | Critical Damage acumulado |
| `resolve.drainedScene` | inteiro ≥ 0 | Resolve drenado por ataques sociais na cena |
| `insanity` | `{ value 0–100, derangements: [{ name, severity: minor|severe|acute }] }` | |
| `modifiers.combat` | `{ sd, reactions, mentalDefense, aura }` | alvos de efeito (condições, ações; Aura de templates/feats/magias) |
| `combat` | derivado | `{ reactionsMax, woundState, flags }` (R3/R5/R8) |

## Combatant (`flags.dtd40k.turn`)

`{ round, full: bool, halves: [actionKey], free: [actionKey], reactions: n, initiativeHeroPoint: bool }`

## RollTable (`src/packs/combat-tables`)

- `name` (ex.: "Critical — Energy — Arm"), `formula` `1d5` (críticos) ou `1d10` (Shock, Traumas),
  `flags.dtd40k.table = { kind: critical|shock|trauma, type, location }`.
- Resultado: `range [n, n]`, `description` (redação própria), `flags.dtd40k.effect` =
  `{ statuses: [id], rounds, fatigue, test: { characteristic, tn, onFail }, dead, halfAction, insanity, text }`.

## Mensagens

- Dano aplicado: `flags.dtd40k.applied = [{ actorUuid, before: { hp, critical, fatigue, statuses }, result }]` (Desfazer).
- Ataque: `flags.dtd40k.defense = { kind, total, sdBonus, hits }` quando o alvo esquiva/apara.
- Social: `flags.dtd40k.social = { targetUuid, resolved: "spent"|"complied"|null }`.

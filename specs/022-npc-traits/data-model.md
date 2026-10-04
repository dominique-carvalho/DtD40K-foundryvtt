# Data Model — 022

## `system.npc.abilities[]` (estendido; campos novos com padrão)

| Campo | Tipo | Uso |
|---|---|---|
| `name`, `effect` | string | como na 012 |
| `kind` | `"text" \| "area" \| "aura" \| "onHit" \| "spell"` (padrão `text`) | tipo |
| `action` | `"free" \| "half" \| "full"` | custo (area, spell) |
| `area` | `{ shape: "" \| "cone" \| "blast" \| "line", size: number (m) }` | área |
| `trigger` | `"" \| "charge" \| "allOutAttack" \| "turnStart"` | aura |
| `save` | `{ characteristic, skill, tn }` | resistência; `characteristic = "fear"` usa o teste de medo da 012 |
| `onFail` | `{ condition, rounds, fatigue, damage: { rolled, kept, type, pen } }` | efeito na falha |
| `weapon` | string | nome da arma (onHit) |
| `extraCritical` | int | onHit |
| `spell` | `{ name, characteristic, skill }` | spell |
| `uses` | `{ max, value }` (0 = ilimitado) | usos por cena |

## `system.npc.forms[]` (novo) e forma ativa

| Campo | Tipo |
|---|---|
| `id`, `name` | string |
| `kind` | `"shift" \| "variant"` |
| `cost` | int (do recurso) |
| `action` | `"free" \| "half" \| "full"` |
| `duration` | int (rodadas; 0 = sem limite) |
| `characteristics` | `{ [key]: int }` (só os que mudam) |
| `size` | int \| null |
| `derived` | `{ staticDefense, hpMax, speed, resilience }` (null = mantém) |
| `armor[]` | `{ name, ap, locations }` |
| `traits[]` | `{ key, value }` (somados aos do NPC) |
| `abilities[]` | nomes de abilities ligadas à forma |

`system.npc.activeForm`: id ou `""`; `system.npc.formRounds`: rodadas restantes.

Itens de arma da forma: `flags.dtd40k.form = <id>` (só aparecem com a forma ativa). Arma com efeito no acerto:
`flags.dtd40k.onHit = { extraCritical }`.

## Derivados novos (NPC)

`system.speeds = { walk, fly, swim }` (R1/R2) · `system.flags`: `darkSight`, `phasing`, `crawler`, `autoStabilized`,
`incorporeal` (do status).

## Status

`incorporeal` (novo, em `STATUS_EFFECTS`).

## Token (não gravado)

`movementAction` inferido (`phase`/`fly`), `sight.visionMode = "darkvision"` com Dark Sight, custo de terreno base
para Crawler.

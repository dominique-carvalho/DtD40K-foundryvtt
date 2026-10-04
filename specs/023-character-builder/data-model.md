# Data Model — 023

Nada muda no modelo do personagem. Novo: o rascunho do assistente.

## Flag do usuário `dtd40k.builderDraft`

| Campo | Tipo | Uso |
|---|---|---|
| `version` | int | formato do rascunho (1) |
| `step` | string | passo atual |
| `released` | string[] | passos liberados pelo Mestre |
| `ownerId` | string | dono do ator (o próprio usuário; o Mestre pode escolher) |
| `concept` | `{ name, concept, img }` | |
| `race` | `{ uuid, choice }` | escolha da raça (bônus, perícias) |
| `exaltation` | `{ uuid, selection }` | Statuesque, Blood Quickening |
| `priorities` | `{ characteristics: [g1,g2,g3], skills: [g1,g2,g3] }` | grupos por ordem |
| `characteristics` | `{ [key]: dots }` | dots de criação (sobre a base 1) |
| `skills` | `{ [key]: dots }` | dots de criação (sobre a base 0) |
| `specialties` | `{ [path]: string }` | uma por valor 4+ |
| `class` | `{ uuid }` | |
| `backgrounds` | `{ [key]: dots }`, `wealth`, `artifacts[]` | |
| `deity` | `{ uuid }` | |
| `hindrances`, `assets` | `{ uuid, selection }[]` | |
| `exaltedAsset` | `{ uuid } \| null` | |
| `purchases` | `{ kind, key }[]` | compras de XP em ordem (characteristic, skill, school, martial, powerStat, feat com uuid) |
| `equipment` | `{ slot, uuid }[]` | vagas Rare/Uncommon/Common/Very Common |

## Plano (derivado, não salvo)

Lista ordenada de etapas `{ op, args, label }` montada por `buildPlan(draft)` (R1).

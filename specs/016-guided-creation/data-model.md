# Data Model: Criação guiada (016)

Nada novo é guardado. Tudo abaixo é derivado a cada preparação/render.

## Entradas (já existentes)

| Fonte | Campo | Uso |
|---|---|---|
| Personagem | `_source.system.characteristics.<k>.value`, `.specialties` | pontos de criação, especialidades guardadas |
| Personagem | `_source.system.skills.<k>.value`, `.specialties` | idem |
| Personagem | `system.characteristics/skills.<k>.value` (final) | máximo, cota de especialidade (≥ 4) |
| Personagem | `system.xp.log`, `system.xp.totals` | pontos comprados com XP; XP da criação |
| Personagem | `system.creation.active` | liga o painel e os limites da etapa |
| Personagem | `system.backgrounds.dots` | 7 pontos (011) |
| Itens | raça, exaltação (nome, Power Stat), classes, feats (categoria asset/hindrance, nomes), divindade | checklist e exceções |

## Constantes (`config.mjs`)

- `CREATION`: `{ characteristic: { base: 1, budgets: [6, 4, 2], stepMax: 4, groups: { physical, social, mental } },
  skill: { base: 0, budgets: [8, 6, 4], stepMax: 3 } }` — grupos das perícias por `SKILLS[*].group`.
- `RATING_MAX = 5`, `RATING_EXCEPTION_MAX = 6` (substitui `MAX_RATING` nas subidas e no corte).
- `RATING_EXCEPTIONS`: `[{ source: "exaltation"|"feat", name, rank?, characteristics: bool, skills: bool|number }]`
  (número = quantas perícias podem estar em 6).

## Derivados (`system.creationSummary` não é guardado; `system.ratingCaps` é derivado)

- **ratingCaps** (no modelo do personagem): `{ characteristic: { max, limit }, skill: { max, limit } }` —
  `max` 5 ou 6; `limit` = quantas notas podem estar em 6 (`Infinity` quando todas).
- **Resumo da criação** (contexto do painel):
  - `characteristics` / `skills`: por grupo `{ key, spent, budget, fits }`, `fits` geral, `unspent` total.
  - `xp`: `{ total, spent, available, hindrances, awards }`.
  - `specialties`: `{ missing: [{ kind, key }], excess: [{ kind, key }] }`.
  - `steps`: `[{ key, status: "done"|"pending"|"warning", detail }]` — `race`, `exaltation`, `class`, `alignment`,
    `characteristics`, `skills`, `backgrounds`, `xp`, `specialties`, `equipment`, `languages`.

## Regras de validação

- Mudança no modo de edição com a criação ativa: `base + pontos de criação ≤ stepMax` e os gastos cabem nos orçamentos
  ordenados; senão recusa (Mestre libera).
- Subida (edição ou XP): valor final ≤ `ratingCaps.<kind>.max`; em 6, a contagem de notas em 6 ≤ `limit`.
- Hindrances ≤ 2; Assets/Hindrances só com a criação ativa; classe de nível 1 na criação.

## Transições

`creation.active: true` (novo personagem) → Mestre encerra (confirmação se houver pendências) → `false`. O Mestre pode
religar no modo de edição como hoje; os contadores recomeçam a partir das notas e do log.

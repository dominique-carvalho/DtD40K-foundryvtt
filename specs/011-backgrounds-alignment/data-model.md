# Data Model — 011-backgrounds-alignment

## Constantes (`module/config.mjs`)

| Nome | Valor |
|---|---|
| `PANTHEONS` | `ruinousPowers, blessedPantheon, grayCouncil` (rótulo i18n) |
| `BACKGROUNDS` | 11 chaves → `{ label, multiple }`: allies, artifact (múltiplo), backing (múltiplo), contacts, fame, followers, holdings, inheritance, mentor, status, wealth |
| `BACKGROUND_XP` | `{ freeDots: 7, freeMax: 3, low: 50, high: 100, artifactCreationMax: 5 }` |
| `INHERITANCE_SLOTS` | ubiquitous 1/8, veryCommon 1/4, common 1/2, uncommon 1, rare 2, veryRare 4, mythicRare 8, anyNonArtifact 16 (vagas) |
| `XP_KINDS` | + `background` |

## Regras puras

- `rules/backgrounds.mjs`: `BACKGROUND_TEXT` (descrição própria por valor), `creationDots`, `backgroundCost`,
  `canRaise`, `inheritanceFits`.
- `rules/alignment.mjs`: `alignmentCheck`, `afterFailure`, `recover`, `changeAlignment`, `degenerationRow`.

## `deity`

| Campo | Tipo |
|---|---|
| `key`, `pantheon` | string; `PANTHEONS` |
| `summary`, `description`, `source` | texto; HTML; `{ book, page }` |
| `commandments`, `keywords`, `directives` | string[] (3, 5, 5) |
| `directivesTitle` | string |
| `cults` | `[{ name, summary }]` |

## Personagem

| Campo | Tipo |
|---|---|
| `backgrounds.<key>.value` | 0–5 (allies, contacts, fame, followers, holdings, inheritance, mentor, status) |
| `backgrounds.artifacts`, `backgrounds.backings` | `[{ id, name, value 1–5 }]` |
| `backgrounds.inheritancePicks` | contagens por raridade de `INHERITANCE_SLOTS` |
| `wealth.value` | Background Wealth (007) |
| `alignment` | `{ changes: 0–1, degenerations: [{ id, point, name, row, effectIds, itemIds, derangement }] }` |
| `modifiers.alignmentCheck` | inteiro (alvo de efeitos de feats/assets) |
| derivado | `backgrounds.dots` (criação), `alignment.outOfPlay`, `alignment.blocked` (características) |

## Tabela (`combat-tables`)

- "Degeneration" (1d100, 16 resultados, `flags.dtd40k.table.kind = "degeneration"`, pasta Alignment), com
  `flags.dtd40k.effect` por linha.

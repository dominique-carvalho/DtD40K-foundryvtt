# Data Model — 028

## Pasta (`src/packs/setting/folder-<slug>.json`)

| Campo | Valor |
|---|---|
| `_id`, `_key` | id estável; `!folders!<id>` |
| `name` | History, Cosmology, Sigil, Crystal Spheres |
| `type` | `JournalEntry` |
| `color` | hex de um token do design system |
| `sort` | ordem do capítulo |

## Diário (`src/packs/setting/<slug>.json`)

| Campo | Valor |
|---|---|
| `_id`, `_key` | id estável; `!journal!<id>` |
| `name` | ex.: "History of the Wheel", "The Great Wheel", "Sigil", "Baatorian" |
| `folder` | id da pasta |
| `pages` | páginas embutidas (abaixo), em ordem |
| `flags.dtd40k.setting` | `{ kind: "history" \| "cosmology" \| "sigil" \| "sphere", source: "DtD 7.7a p. N" }` |

## Página (embutida em `pages`)

| Campo | Valor |
|---|---|
| `_id`, `_key` | id estável; `!journal.pages!<diário>.<id>` |
| `name` | ex.: "Physical Conditions", "Inhabitants", "Locations", "Adventure Seeds" |
| `type` | `text` |
| `text.format` | 1 (HTML) |
| `text.content` | até 2 `<p>`; links `@UUID[...]{...}`; nos ganchos, `<p>` de aviso + `<section class="secret">` |
| `sort` | ordem |

## Contagem esperada

- 4 pastas; 18 diários (1 história, 1 cosmologia, 1 Sigil, 15 esferas).
- Cada esfera: 4 páginas, nesta ordem: Physical Conditions, Inhabitants, Locations, Adventure Seeds.
- Sigil: Overview, The Lady of Pain, Factions, Locations.

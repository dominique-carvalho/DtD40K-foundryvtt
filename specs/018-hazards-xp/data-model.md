# Data Model: Perigos e XP de encontro (018)

Nada novo nos atores. Estado nos cartões.

## Cartão de queda — cartão de dano da 008 (`flags.dtd40k.damage`)

`{ total: ferimentos, pen: 0, type: "I", location, resolve: { direct: true, extraCritical }, tokenUuids: [token] }` e
`flags.dtd40k.fall = { category, intentional, actorUuid, reduced }` (Acrobatics uma vez; reduzir atualiza `damage.total`).

## Cartão de intervalo — `flags.dtd40k.hazard`

| Campo | Regra |
|---|---|
| `kind` | `"suffocation"` \| `"march"` |
| `mode` | sufocamento: `"conserve"` (minuto) \| `"strenuous"` (rodada) |
| `step` | intervalos ou horas já resolvidos |
| `done` | encerrado ("Respirou" ou "Fim da marcha") |
| `people` | `[{ actorUuid, name, immune, breath (limite), state: "ok"\|"out"\|"dead", fatigueFails }]` |

## Constantes

`ENCOUNTER_XP`, `SESSION_XP`, `FALL = { short, long, fatal }`, `BREATHLESS_EXALTATIONS`, `BREATHLESS_TRAITS`,
`BREATH_ITEMS`, `FATIGUE_IMMUNE_EXALTATIONS`.

## Entradas de XP (006)

`{ type: "award", cost, reason }` — uma por personagem, e uma segunda para o bônus.

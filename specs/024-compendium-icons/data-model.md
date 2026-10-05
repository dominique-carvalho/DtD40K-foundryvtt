# Data model — 024 Ícones próprios dos compêndios

## Categoria de ícone (`src/icons/categories.json`)

| Campo | Tipo | Descrição |
|---|---|---|
| `key` | string | id e pasta (`weapon-melee`, `weapon-ranged`, `drug`, `cybernetic`, `spell`, `npc`…) |
| `color` | string | hex da paleta (research R3) |
| `glyph` | string | glifo padrão `<autor>/<nome>` |
| `match` | object[] | regras, em ordem: `{ pack?, type?, category?, weaponType?, actorType? }`; o primeiro grupo que casa vence |
| `defaultFor` | string[] | tipos (ou `tipo:categoria`) cujo ícone padrão no mundo é desta categoria |

Validação: cor da paleta; glifo existente em `src/icons/glyphs`; cada documento dos packs casa com exatamente uma
categoria (teste).

## Curadoria (`src/icons/curation.json`)

Objeto `{ "<pack>/<tipo>/<nome>": "<autor>/<glifo>" }`. Chaves de itens embutidos usam o pack do ator
(`antagonists/weapon/Claws and Teeth`). Validação: glifo existente; chave correspondendo a um documento existente
(entradas órfãs falham no teste).

## Glifo (`src/icons/glyphs/<autor>/<nome>.svg`)

SVG original do game-icons (512×512). Só os citados em `categories.json` ou `curation.json`.

## Ícone gerado (`assets/icons/<categoria>/<slug>.svg`)

| Campo | Origem |
|---|---|
| categoria | `categories.json` |
| slug | nome do documento (research R5) |
| conteúdo | placa Cogitador + glifo + cor (research R2) |

Documentos apontam via `img` = `systems/dtd40k/assets/icons/<categoria>/<slug>.svg`; atores também em
`prototypeToken.texture.src`.

## Ícones padrão (`DTD.ICONS` em `module/config.mjs`)

`{ item: { <tipo> | "<tipo>:<categoria>": path }, actor: { <tipo>: path } }`, apontando para
`assets/icons/defaults/*.svg`.

## Plano de atualização do mundo (`module/rules/icons.mjs`)

Entrada: lista `{ uuid, kind: "item"|"actor"|"embedded"|"token", img, source }` e mapa `source → img nova`.
Saída: `{ updates: [{ uuid, path, img }], counts: { items, actors, embedded, tokens }, skipped }`.
Regra: atualiza só se `img` começa com `icons/` (imagem do Foundry), `source` começa com `Compendium.dtd40k.` e existe
img nova diferente da atual.

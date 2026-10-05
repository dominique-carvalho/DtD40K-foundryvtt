# Contrato — pipeline de ícones (ferramentas de desenvolvimento)

## Scripts (`package.json`)

| Comando | Rede | Faz |
|---|---|---|
| `npm run icons:suggest` | não | lê `src/packs` e a lista de nomes dos glifos (`src/icons/glyph-index.json`) e grava `src/icons/suggestions.json` com candidatos por documento (apoio à curadoria; não versionado como verdade) |
| `npm run icons:fetch` | sim | baixa para `src/icons/glyphs/` os glifos citados em `categories.json` e `curation.json` que ainda não existem; `--index` atualiza `glyph-index.json` pela árvore do repositório `game-icons/icons` |
| `npm run build:icons` | não | gera `assets/icons/**`, atualiza `img`/`prototypeToken.texture.src` em `src/packs`, gera `CREDITS.md`; idempotente; falha se faltar glifo ou se um documento não casar com categoria |

Ordem para publicar: `build:icons` → `build:packs`.

## `scripts/lib/icons.mjs` (puro, testado)

```js
/** Categoria do documento (primeiro grupo de `match` que casa). */
categoryFor(doc, { pack, parentType? }, categories) → Category | null
/** Glifo do documento: curadoria, depois item de compêndio equivalente (embutidos), depois o padrão da categoria. */
glyphFor(doc, { pack, key, category, curation, compendiumGlyphs }) → { glyph, curated: boolean }
/** Slug estável do nome. */
slugify(name) → string
/** SVG final da placa Cogitador. */
composeIcon({ glyphSvg, color }) → string
/** Paths de preenchimento do SVG do game-icons, sem o quadrado de fundo. */
glyphPaths(glyphSvg) → string[]
/** Atribui caminhos aos documentos, resolvendo colisões de slug (research R5). */
assignPaths(entries) → Map<docKey, path>
```

## Saídas versionadas

- `assets/icons/<categoria>/<slug>.svg`, `assets/icons/defaults/<tipo>.svg`
- `src/icons/glyphs/<autor>/<nome>.svg`, `src/icons/categories.json`, `src/icons/curation.json`, `src/icons/glyph-index.json`
- `CREDITS.md`

## Release

`.github/workflows/release.yml`: o zip inclui `assets` e `CREDITS.md`.

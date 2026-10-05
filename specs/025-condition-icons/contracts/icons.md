# Contrato — selos de condição e efeitos

## `scripts/lib/icons.mjs` (puro)

```js
/** Selo redondo: disco de ferro, anel na cor, glifo claro (research R1). Cor da paleta ou erro. */
composeSeal({ glyphSvg, color }) → string
```

## `scripts/build-icons.mjs`

- Lê `src/icons/conditions.json`; gera `assets/icons/conditions/*.svg` e `assets/icons/effects/*.svg`; os remove se
  saírem da lista (como os demais).
- Grava o `img` do item em cada efeito dos itens de `src/packs` (e dos itens embutidos).
- Autores dos glifos dos selos entram no `CREDITS.md`; glifos que faltam → erro com a lista.

## `module/rules/icons.mjs` (puro)

```js
planIconUpdates({ docs, sourceImages, conditionImages, effectImages }) → { updates, counts, skipped }
// docs ganha kind "effect": { uuid, kind: "effect", img, statuses: string[], flags: object, itemImg?: string }
// counts ganha "effect"
```

## Foundry

- `STATUS_EFFECTS` com os selos; HUD, token e ficha mostram a imagem da condição.
- Serviços: `CONFIG.DTD.ICONS.effect.<chave>` e `flags.dtd40k.effectIcon`.
- Menu "Atualizar ícones": efeitos de `game.actors` (e dos itens deles) e de `game.items`; confirmação com
  `{effect}` na contagem (i18n `DTD.Icons.Update.Confirm`).

## Testes

- `composeSeal` (anel, glifo claro, determinístico, cor inválida).
- `conditions.json`: 30 condições, glifos distintos, arquivos existentes; `STATUS_EFFECTS` apontando para eles.
- Varredura dos packs: nenhum efeito com imagem do Foundry; efeito de item com o `img` do item.
- `planIconUpdates`: condição, degeneração, efeito de item, imagem personalizada preservada.

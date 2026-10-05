# Contrato — integração com o Foundry 13

## Ícones padrão

- `DtdItem.getDefaultArtwork(itemData)` → `{ img }`: `DTD.ICONS.item["<tipo>:<categoria>"] ?? DTD.ICONS.item[<tipo>] ?? super`.
- `DtdActor.getDefaultArtwork(actorData)` → `{ img, texture: { src } }`: `DTD.ICONS.actor[<tipo>] ?? super`.
- Serviços que criam documentos com imagem fixa passam a usar `DTD.ICONS`: alignment-service (degeneração),
  martial-service (ataques e técnicas), squadron-service (esquadrão), weapon-craft-service (arma criada),
  vehicle-service (manobra), builder-service (retrato inicial do montador).

## Atualizar ícones do mundo

- `game.settings.registerMenu("dtd40k", "updateIcons", { name, label, hint, icon, type: UpdateIconsMenu, restricted: true })`.
- `UpdateIconsMenu` (ApplicationV2 mínima): ao abrir, monta o plano (`planIconUpdates`, `module/rules/icons.mjs`) com:
  - itens do mundo (`game.items`), atores do mundo (`game.actors`), itens embutidos nos atores, protótipo de token;
  - imagem nova pelo índice do compêndio de origem (`pack.getIndex({ fields: ["img", "prototypeToken.texture.src"] })`).
- Mostra as contagens num `DialogV2.confirm`; ao confirmar, aplica por `updateDocuments` em lote (itens, atores e
  embutidos por ator) e mostra o total aplicado. Sem nada a mudar, só avisa.
- i18n: `DTD.Icons.Menu.{Name,Label,Hint}`, `DTD.Icons.Update.{Title,Confirm,Nothing,Done}`.

## Imagens nos packs

- `img` dos itens, atores e tabelas; `prototypeToken.texture.src` dos atores; `img` dos itens embutidos — todos
  `systems/dtd40k/assets/icons/...`.
- Teste (`tests/unit/icons.test.mjs`): nenhum desses campos em `src/packs` começa com `icons/`, todos existem em
  `assets/icons`, toda chave da curadoria aponta para um documento e um glifo existentes.

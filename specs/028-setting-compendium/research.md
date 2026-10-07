# Research — 028 Compêndio de cenário

## R1 — Tipo de documento

- **Decisão**: compêndio `setting` do tipo `JournalEntry`, com páginas `text` (formato HTML).
- **Racional**: é o formato nativo de leitura do Foundry v13 (índice de páginas, busca, links); não precisa de
  modelo de dados próprio.
- **Alternativas**: Items com descrição (sem páginas nem índice); RollTables (não são texto).

## R2 — Ganchos só para o Mestre

- **Achado**: dentro de um compêndio, o Foundry ignora a permissão de cada documento e de cada página:
  `getUserLevel` devolve o nível do compêndio (`if ( this.pack ) return this.compendium.getUserLevel(user)`,
  `foundry.mjs` 13.351). Uma página "só do Mestre" num compêndio aberto não é possível por permissão.
- **Decisão**: a página Adventure Seeds de cada esfera tem um aviso público curto ("Story Master only.") e o conteúdo
  num `<section class="secret">`. A página de texto só mostra segredos ao dono (`secrets: this.page.isOwner`); no
  compêndio, só o Mestre (e o Assistente) é dono. Se o Mestre importar o diário para o mundo, o segredo continua
  oculto para quem não é dono.
- **Alternativas**: compêndio separado só do Mestre para os ganchos (quebra a esfera em dois lugares); deixar os
  ganchos abertos (contra a decisão do usuário).

## R3 — Ícones

- **Achado**: `JournalEntry` não tem `img` no v13; o sidebar de diários não mostra imagem.
- **Decisão**: sem ícone por entrada; as 4 pastas recebem cores do design system (hex dos tokens). O teste de ícones
  passa a ignorar documentos `!journal!` (não têm o campo).

## R4 — Ids, chaves e pastas

- **Decisão**: o gerador grava ids estáveis derivados do nome (mesma ideia do `assign-pack-ids`): diários
  `!journal!<id>`, páginas `!journal.pages!<id>.<pageId>`, pastas `!folders!<id>` com `type: "JournalEntry"`.
  Páginas com `sort` na ordem do capítulo.

## R5 — Links

- **Decisão**: `@UUID[Compendium.dtd40k.<pack>.Item.<id>]{Nome}` para deuses (`deities`), raças (`races`) e
  exaltações (`exaltations`). O gerador procura cada nome desses compêndios no texto da página e liga só a primeira
  citação. Nomes curtos ou comuns demais para casar com segurança (ex.: "Human" dentro de "humanity") só casam como
  palavra inteira.
- **Teste**: todo `@UUID[Compendium.dtd40k…]` aponta para um `_id` existente na fonte do pack de destino.

## R6 — Redação e verificação

- **Decisão**: textos escritos à mão, em inglês, a partir das pp. 454–507 (`dtd.txt` no scratchpad), no gerador do
  scratchpad. Um script de 6-gramas compara cada página com o capítulo; meta 0. Blocos com até 2 parágrafos; a página
  de facções de Sigil é uma lista (uma linha por facção) e não conta como parágrafo.
- **Nomes próprios** (esferas, facções, lugares, personagens) ficam como no livro; o 6-grama ignora sequências que
  são só nomes próprios.

## R7 — Permissão do compêndio

- **Decisão**: `ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" }`, como *Races* e *Deities* (aberto para leitura).

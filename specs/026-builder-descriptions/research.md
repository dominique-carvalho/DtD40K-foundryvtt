# Research — 026 Descrições no montador de personagem

## R1 — Fonte dos textos

- **Decisão**: usar o que os compêndios já têm. Medianas dos campos:
  - `system.description` de feats, Assets e Hindrances: ~130–170 caracteres.
  - Exalted Assets: ~120; classes: ~170.
  - `system.summary` das divindades: ~150.
  - `system.effectText` do equipamento.
  - Raças (~2.300) e exaltações (~700) são longas; recebem o resumo montado dos dados mais o primeiro parágrafo.
- **Racional**: o texto já tem redação própria (constituição V); não reescrever 400 descrições.
- **Exceção**: os 11 backgrounds não são itens e não têm texto. Entram 11 linhas novas em i18n
  (`DTD.Background.<key>.hint`), com redação própria a partir das pp. 280–283.

## R2 — Redução do texto (regras puras)

Novo módulo `module/rules/descriptions.mjs`, sem Foundry:
- `plainText(html)`: tira as tags e as entidades e normaliza os espaços.
- `shortLine(html, max = 180)`: vai até o fim da primeira frase; se passar de `max`, corta na última palavra e põe "…";
  se a primeira frase for curta (< 60), inclui a seguinte, desde que caiba.
- `firstParagraph(html, max = 420)`: o primeiro `<p>` que não é um título.
- `raceFacts(system)`: `[{ key, value }]` com o bônus de característica (opções ou "qualquer"), as perícias e a
  escolha, o tamanho, e o poder (nome e texto curto).
- `exaltationFacts(system)`: Power Stat (nome, teto), recurso (nome) e poderes de posto 1.
- `featFacts(feat)`: XP (Asset −100, Hindrance +`xpGranted`, Exalted Asset −100, feat comprado −100) e pré-requisitos
  (raça, exaltação, divindade).
- `classFacts(system)`: nível, perícias e feats exigidos.
- `itemNumbers(item)`:
  - arma: "2k2 I · Pen 0 · 30 m · ROF S/6";
  - armadura: "AP 5 · medium · Max Dex 5";
  - droga: "Addictivity moderate";
  - demais: `effectText` curto.
- O app traduz as chaves (`key`) com i18n; as regras devolvem só dados.

## R3 — Apresentação

- **Listas** (Hindrances, Assets, classes, entradas de compra): `<small class="builder-desc">` sob o nome, com a
  linha e um `<span class="builder-facts">` com XP e pré-requisitos.
- **Cartões** (raça, exaltação, divindade, Exalted Asset): `.builder-detail` abaixo dos cartões quando há seleção:
  título, lista de fatos (`<dl>`) e o parágrafo.
- **Seletores** (compra de feat, vagas de equipamento): cada `<option>` leva `data-desc`. Um ouvinte no `_onRender`
  atualiza o `<p class="builder-desc">` ao lado quando o valor muda, sem re-renderizar a janela, para não perder o foco
  (lição da 023). No equipamento, a linha do item escolhido já vem renderizada.
- CSS em `styles/builder.css` com os tokens da 021.

## R4 — Idioma

As descrições dos compêndios ficam em inglês, como nas fichas. Os rótulos dos fatos (Size, Power, Resource,
Prerequisite…) e os textos dos backgrounds vão para i18n em pt-BR e en.

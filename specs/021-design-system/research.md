# Research — 021 Design system Scriptorium Machina

Base: inventário do CSS e dos templates (2026-10-03), [docs/design-system.md](../../docs/design-system.md) e os mockups
em `docs/design/`.

## R1 — Camadas de CSS

- **Decisão**: dividir o estilo em arquivos, carregados nesta ordem pelo `system.json`:
  1. `styles/fonts.css`: `@font-face`.
  2. `styles/tokens.css`: variantes Vellum e Cogitator.
  3. `styles/components.css`: gemas, selos, títulos, painéis, tubos, placas, botões e campos aplicados às classes
     existentes (`.dot`, `.section-title`, `.tag`, `.automation-tag`, `button`, `input`).
  4. `styles/dtd40k.css`: o atual, convertido para tokens.
  5. `styles/chat.css`: cartões de chat.
  6. `styles/sheet-cogitator.css` e `styles/sheet-illuminated.css`: layouts.
- **Por quê**: o `dtd40k.css` tem 2.405 linhas; separar deixa cada layout isolado e a troca incremental.
- **Alternativa rejeitada**: um arquivo só, porque fica difícil revisar e manter dois layouts.

## R2 — Tokens e tema

- **Decisão**: os valores Vellum vão em `.dtd40k` e em `.themed.theme-light .dtd40k, .dtd40k.themed.theme-light`. Os
  valores Cogitator vão em `.theme-dark .dtd40k, .dtd40k.themed.theme-dark, .themed.theme-dark .dtd40k`. A
  especificidade faz o tema mais próximo vencer: uma janela clara num corpo escuro fica clara, e vice-versa. Os cartões
  de chat seguem o tema da barra lateral.
- **Conflito de nomes** (inventário): o CSS atual usa `--dtd-border` como **cor** em cerca de 80 lugares. Os tokens
  mantêm os nomes antigos como aliases de cor:
  - `--dtd-text` → `ink`
  - `--dtd-text-muted` → `ink-muted`
  - `--dtd-text-subtle` → `ink-subtle`
  - `--dtd-border` → `paper-edge`
  - `--dtd-accent` → `brass`
  - `--dtd-hp` e `--dtd-resolve` → semânticos

  O shorthand de borda dos mockups sai.
- **Cores fixas no código** (inventário):
  - L10, L11: hp e resolve.
  - L950–956: resultado da rolagem.
  - L1246: Tell nível 3.
  - Os fallbacks.

  Todas viram tokens, e os usos diretos de `--color-*` do Foundry também.

## R3 — Duas fichas

- **Decisão**: a classe atual `CharacterSheet` continua como base, porque a `NpcSheet` herda dela e o NPC mantém o
  layout atual (US4). Duas subclasses entram no registro:
  - `CogitatorSheet`: `makeDefault: true`, rótulo `DTD.Sheet.Cogitator`, largura 900.
  - `IlluminatedSheet`: rótulo `DTD.Sheet.Illuminated`, largura 800.

  A `CharacterSheet` sai do registro para o tipo `character`. Atores que a tinham escolhido caem no padrão, a
  Cogitator (FR-005).
- Cada subclasse troca só os PARTS de cabeçalho, abas e aba principal, e acrescenta a classe `layout-cogitator` ou
  `layout-illuminated`. As outras abas (traços, equipamento, combate, magia, marcial, classe) e o rodapé são os mesmos
  templates, com o visual dos componentes.
- **Por quê**: segue o seletor de ficha nativo (decisão do usuário), não duplica as ações (o `DEFAULT_OPTIONS.actions`
  é herdado) e mantém o NPC intacto.

## R4 — Templates por layout

- **Cogitator** (`templates/actor/cogitator/`):
  - `rail.hbs` substitui o `header`. Tem retrato em octógono, nome, identificação, tubos, LEDs de Fatigue e Hero
    Points, Power Stat, selos de condição, XP e chave de modo. Nos modos Edição e Evolução, os campos do cabeçalho
    atual (nome, nível, tamanho, máximos) aparecem no trilho.
  - `tabs.hbs`: teclas com ícone.
  - `main.hbs`: leituras das defesas, módulos de características e tabela de perícias.
- **Iluminura** (`templates/actor/illuminated/`):
  - `header.hbs`: arco, capitular, linhagem, selos, faixa de recursos.
  - `tabs.hbs`: fitas.
  - `main.hbs`: tríptico e índice.
- Os templates novos mantêm os mesmos `data-action`, `name` e `data-*` dos atuais (`rollCharacteristic`, `rollSkill`,
  `setDots`, `toggleMode`, `editImage`, filtros de perícia, especialidades e botões de evolução), para o JS da ficha
  funcionar sem mudança.
- **Dots** (FR-007): o partial `dots.hbs` continua igual. As gemas são CSS sobre `.dot`:
  - cheio: `.filled`
  - 6º dot: `.superhuman`
  - bônus de raça: `.racial`
  - Power Stat travado: `.locked`

## R5 — Contexto extra do trilho

- **Decisão**: o `_prepareContext` da base ganha um bloco `rail` com o que os cabeçalhos novos precisam e o atual não
  passa: condições ativas (nome e ícone), XP disponível e total, Power Stat (nome, valor e reserva) e o ícone de cada
  aba. Tudo vem dos contextos que já existem (combate, classe e XP, exaltação).

## R6 — Chat

- **Decisão**: `styles/chat.css` mira a **raiz** de cada cartão (`.dtd40k.roll-card`, `.dtd40k.attack-card-extra`, …).
  O inventário mostrou que cerca de 8 regras atuais (`.dtd40k .attack-card-extra` e parecidas) nunca casam, porque os
  cartões são irmãos dentro de `.message-content`, sem um `.dtd40k` acima.
- Os dados recebem a faceta de d10: `.roll-die.kept`, `.dropped` e `.exploded`. O resultado tem faixa com texto.
- As mensagens simples em `<p>`, sem `.dtd40k`, ficam como estão; não são cartões.

## R7 — Fontes

- **Decisão**: oito `.woff2` latinos do @fontsource 5.3.0, todos OFL:
  - Cinzel 500, 700 e 900
  - Cinzel Decorative 700
  - Crimson Pro 400, 400 itálico e 600
  - Share Tech Mono 400

  Ficam em `fonts/`, com um `OFL-<família>.txt` para cada família, 130 KB no total. `font-display: swap`.
- O workflow de release (`.github/workflows/release.yml` L55) passa a incluir `fonts` no zip, senão a instalação pelo
  manifesto fica sem as fontes.

## R8 — Verificação automática

- **Decisão**: `tests/unit/design-tokens.test.mjs`, em Node e sem Foundry:
  - lê `styles/tokens.css`, extrai as duas variantes e confere o contraste dos tokens de texto sobre `paper` e
    `paper-raised` (≥ 4.5) (SC-003);
  - confere que todo arquivo de `system.json → styles` existe e que toda `url()` de `fonts.css` aponta para um
    arquivo existente (SC-005).
- O resto é visual: quickstart no Foundry, nos dois temas.

## R9 — Mockups

- `docs/design/` continua como referência visual. A fonte da verdade dos tokens passa a ser `styles/tokens.css`, e o
  `docs/design-system.md` aponta para ela.

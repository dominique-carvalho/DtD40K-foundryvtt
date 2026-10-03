# Design system — Scriptorium Machina

Identidade visual do sistema Dungeons the Dragoning 40K para as fichas, os diálogos e os cartões de chat. Os arquivos de
referência ficam em [`docs/design/`](design/):

- [`tokens.css`](design/tokens.css): tokens.
- [`components.css`](design/components.css): componentes.
- [`guia.html`](design/guia.html): guia visual, com as duas variantes lado a lado.
- `proposta-a/b/c-*.html`: três propostas para a ficha de personagem.

## 1. Ideia

DtD é um pastiche: o grimdark do 40K, a fantasia de D&D e os dots da White Wolf. O design toma o lado **gótico
imperial** como base: pergaminho, lacre, ouro gasto e capitulares. Sobre ele, aplica o lado **grimório tech**: ferro,
rebites, leituras de cogitador e linhas de circuito. O nome resume a mistura: um *scriptorium* movido a máquina.

As duas metades viram as duas variantes do tema do Foundry:

| Tema do Foundry | Variante | Ideia |
|---|---|---|
| Claro | **Vellum** | Manuscrito iluminado: pergaminho, tinta ferrogálica, lacre vermelho, latão |
| Escuro | **Cogitator** | Console sagrado: ferro escuro, osso, fósforo verde, latão aceso |

Os componentes são os mesmos nas duas variantes; só os tokens mudam.

## 2. Princípios

1. **A regra primeiro.** O ornamento nunca esconde um número. Valores usados na mesa (dots, HP, defesas, paradas) ficam
   sempre legíveis em um relance.
2. **Forma, não só cor.** Estado se mostra por forma e preenchimento, além da cor. Uma gema cheia é diferente de uma
   vazia; uma caixa marcada tem um X; sucesso e fracasso têm texto.
3. **Ornamento em CSS.** Grão do papel, cantoneiras, rebites, selos e gemas são feitos com CSS ou SVG inline. Não há
   imagens a carregar, tudo funciona offline e nada pesa na ficha.
4. **Contraste AA.** Os tokens de texto (`ink`, `ink-muted`, `ink-subtle`, `lapis`) passam de 4.5:1 sobre o papel nas
   duas variantes. O latão do claro e o lacre do escuro ficam abaixo disso (3.4:1 e 3.5:1): servem para ornamento, texto
   grande (capitulares, títulos) ou com peso alto, nunca para texto pequeno. O fósforo é reservado a dados e
   destaques, nunca a parágrafos.
5. **Escopo próprio.** Tudo vive sob `.dtd40k` com prefixo `--dtd-`. Nada vaza para o resto da interface do Foundry.

## 3. Tokens

### Cores

| Token | Vellum | Cogitator | Uso |
|---|---|---|---|
| `--dtd-paper` | `#efe4cc` | `#141719` | fundo da ficha |
| `--dtd-paper-raised` | `#f6eedb` | `#1c2124` | painéis, cartões |
| `--dtd-paper-sunken` | `#e2d2ae` | `#0d1011` | campos, trilhos, abas inativas |
| `--dtd-paper-edge` | `#c4ab7c` | `#3a4246` | bordas e filetes finos |
| `--dtd-ink` | `#2a1f17` | `#e8dfca` | texto principal |
| `--dtd-ink-muted` / `-subtle` | `#5c4a3a` / `#6f5c47` | `#b3a88f` / `#978f7b` | rótulos, texto secundário, não treinado |
| `--dtd-seal` (lacre) | `#8e1b1b` | `#c8372f` | ação primária, dano, HP, capitulares, aba ativa |
| `--dtd-brass` (latão) | `#9a7328` | `#c09a48` | ornamentos, molduras, filetes |
| `--dtd-phosphor` (fósforo) | `#2d6e45` | `#62f08f` | sucesso, leituras de máquina, gemas no escuro |
| `--dtd-lapis` (lápis-lazúli) | `#2a5a8c` | `#64a2dc` | Resolve, mental, magia, anotações |
| `--dtd-iron` (ferro) | `#3a3834` | `#4a5257` | rebites, placas, trilhos |

Semânticos: `--dtd-hp` (lacre), `--dtd-resolve` (lápis), `--dtd-success` (fósforo), `--dtd-failure` (lacre),
`--dtd-warning` e `--dtd-focus` (latão claro).

### Tipografia

Todas as fontes têm licença OFL e vão empacotadas no sistema (`fonts/`), sem depender de CDN.

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Cinzel** | nomes, títulos de seção, abas, rótulos em caixa-alta espaçada |
| Capitular | **Cinzel Decorative** | primeira letra do nome e das seções principais |
| Texto | **Crimson Pro** | descrições, nomes de perícias, texto corrido |
| Dados | **Share Tech Mono** | números, paradas (`8k4`), TN, XP, leituras |

Escala: `xs 0.72rem` · `sm 0.82` · `md 0.95` · `lg 1.15` · `xl 1.5` · `xxl 2.1`. Rótulos em caixa-alta usam
espaçamento de 0.08 a 0.16em.

### Espaço e forma

- Grade de 4 px (`--dtd-space-1…6`).
- Cantos quase retos (`--dtd-radius: 2px`): placas e pergaminho, nunca pílulas.
- Profundidade com sombra curta no claro e sombra densa no escuro (`--dtd-shadow`, `--dtd-shadow-inset`).
- Grão do papel com ruído SVG (`--dtd-grain`), com opacidade 0.18 no claro e 0.08 no escuro.

## 4. Ornamentos (a assinatura)

| Ornamento | O que é | Onde |
|---|---|---|
| **Gema** | O dot da White Wolf como losango. Cheio: lacre (claro) ou fósforo aceso (escuro). Vazio: só o aro. O 6º dot (exceção) é tracejado e dourado; o bônus de raça ou exaltação tem o aro em latão claro | características, perícias, escolas, recursos |
| **Selo de pureza** | Disco de lacre com fita de pergaminho e texto em Cinzel. Variantes: lacre (condição), latão (asset, feat, traço) e máquina (automação) | condições, palavras-chave, etiquetas |
| **Filete** | Título de seção entre filete duplo de latão com um losango | seções |
| **Cantoneiras** | Quatro cantos em latão no painel gótico | painéis do tema claro |
| **Rebites** | Quatro rebites de ferro na placa | painéis do tema escuro e da proposta B |
| **Traço de circuito** | Linha de latão com nós nas pontas | divisórias |
| **Faceta de d10** | Dado em hexágono: mantido em tinta (ou fósforo), explodido em lacre, descartado riscado | cartões de rolagem |
| **Capitular** | Primeira letra em Cinzel Decorative, em lacre | nome do personagem, títulos de cartão |

## 5. Componentes

- **Tubo de recurso:** barra segmentada em décimos, com leitura `11 / 14` em mono. HP usa lacre e Resolve usa lápis.
- **Placa:** valor derivado (Static Defense, Mental Defense, Resilience) em placa octogonal com aro duplo.
- **Botões:**
  - Primário: lacre. Use um por contexto (Rolar, Aplicar).
  - Secundário: papel com aro de latão.
  - Fantasma: só texto.
  - Foco visível sempre em latão claro.
- **Chave segmentada:** Edição / Jogo / Evolução. No claro, o item ativo fica em lacre; no escuro, aceso em fósforo
  com um traço embaixo.
- **Campo:** fundo afundado, filete inferior de latão, número em mono.
- **Cartão de chat:**
  - Filete de lacre no topo e título em Cinzel com a parada à direita.
  - Facetas de d10 para os dados.
  - Total grande em mono, com o TN.
  - Faixa de resultado com as pontas recortadas: fósforo no sucesso, lacre no fracasso.

## 6. Aplicação no sistema

1. `styles/tokens.css`: os tokens sob `.dtd40k` (Vellum) e `.dtd40k.themed.theme-dark`, `.theme-dark .dtd40k`
   (Cogitator). Os cartões de chat seguem o tema do chat.
2. `fonts/` com as quatro famílias e um `@font-face` no CSS do sistema.
3. As variáveis atuais (`--dtd-text`, `--dtd-accent`, `--dtd-hp`, `--dtd-resolve`) passam a apontar para os tokens. A
   troca é incremental, uma ficha e um cartão por vez.
4. As classes dos componentes ganham o visual sem mudar a estrutura dos templates sempre que possível. A ficha
   escolhida entre as propostas abaixo é a que muda de layout.

## 7. Propostas para a ficha de personagem

Todas as propostas usam os mesmos tokens e componentes e mostram a aba *Características e Perícias*. O exemplo é a
Jane, a personagem de exemplo da p. 18.

| | A — Iluminura | B — Cogitador | C — Dossiê |
|---|---|---|---|
| Metáfora | página de códice iluminado | console de cogitador | registro de agente do Ordo |
| Retrato | arco gótico com moldura de latão | octógono com linhas de varredura | pict com clipe, levemente torto |
| Cabeçalho | nome com capitular, linhagem em caixa-alta, selos | trilho lateral fixo com dados de identificação | campos datilografados, carimbo, lacre com o nível |
| Recursos | tubos e placas numa faixa | trilho lateral sempre visível; LEDs para Fatigue e Hero | caixas de marcar como na ficha de papel |
| Abas | fitas de marcador penduradas numa haste | teclas com LED | abas de pasta na borda direita |
| Características | tríptico da p. 17 com medalhões | módulos rebitados com número grande | tabela 3 × 3 da ficha oficial |
| Perícias | índice com pontilhado e parada discreta | tabela densa com botão de rolar que mostra a parada | linhas de formulário com especialidade "à mão" |
| Melhor para | quem quer a cara de livro | quem joga combate e rola muito | quem gosta da ficha de papel |
| Largura | 780 px | 900 px | 820 px |

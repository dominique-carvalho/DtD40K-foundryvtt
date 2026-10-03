# Feature Specification: Design system Scriptorium Machina (fichas e chat)

**Feature Branch**: `021-design-system`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Definir um design system ligado à identidade do sistema, incorporado às fichas e ao chat;
implementar as propostas A (Iluminura) e B (Cogitador) para a ficha de personagem, com B como padrão. A escolha é pelo
seletor de ficha do Foundry; a ficha atual é substituída; os cartões de chat entram no design system; as outras fichas e
os diálogos ganham cores, fontes e componentes, sem mudar o layout; fontes OFL empacotadas no sistema."

**Referência**: [docs/design-system.md](../../docs/design-system.md) e os mockups em `docs/design/` (guia, propostas A e B).
Constituição v1.2.1.

**Depende de**: todas as fichas e cartões existentes (001–020); nenhuma regra de jogo muda.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ficha Cogitador como padrão (Priority: P1)

Ao abrir um personagem, a ficha vem no layout **Cogitador**:
- **Trilho lateral fixo:** retrato em octógono, nome, identificação (raça, exaltação, classe, nível, tamanho e patrono),
  HP e Resolve em tubos com leitura numérica, Fatigue e Hero Points em LEDs, Power Stat, selos de condição e XP em
  contador.
- **Coluna principal:** leituras das defesas e da iniciativa, chave Edição/Jogo/Evolução e abas em teclas com ícone.
- **Aba Características e Perícias:** características em módulos rebitados com o número grande e as gemas, e perícias
  em tabela com botão de rolar que mostra a parada.

As outras abas mantêm o conteúdo e as ações de hoje, com o visual do design system. No tema escuro a ficha fica em
ferro e fósforo; no claro, em latão e marfim.

**Why this priority**: é a ficha que todos veem; resolve a queixa de que a ficha está sem graça.

**Independent Test**: abrir Aldred Kain nos dois temas, conferir trilho, abas, módulos e tabela, rolar uma perícia pelo
botão e ver a mesma parada da ficha atual.

**Acceptance Scenarios**:

1. **Given** um personagem, **When** a ficha abre sem escolha anterior, **Then** ela vem no layout Cogitador.
2. **Given** a ficha Cogitador, **When** o usuário rola a aba, **Then** o trilho lateral com HP, Resolve, Fatigue, Hero Points e condições continua visível.
3. **Given** a aba de características, **When** o jogador clica numa perícia ou no botão de parada, **Then** a rolagem é a mesma de hoje (mesma parada e mesmo diálogo).
4. **Given** os modos Edição e Evolução, **When** ativados, **Then** os campos e os botões de compra da ficha atual continuam disponíveis no novo layout.
5. **Given** o tema escuro ou o claro do Foundry, **When** a ficha abre, **Then** ela usa a variante Cogitator ou Vellum dos tokens.

---

### User Story 2 - Ficha Iluminura como alternativa (Priority: P2)

No menu de ficha da janela, o dono escolhe **Iluminura**:
- **Cabeçalho:** retrato em arco gótico, nome com capitular, linhagem em caixa-alta, selos, chave de modo, XP e Power
  Stat.
- **Faixa de recursos:** tubos e placas.
- **Abas:** fitas de marcador penduradas numa haste.
- **Características:** tríptico da p. 17 com medalhões.
- **Perícias:** índice com pontilhado e parada discreta.

O Mestre pode tornar a Iluminura o padrão do mundo pela configuração de fichas do Foundry.

**Why this priority**: segunda opção pedida; reaproveita o mesmo conteúdo de abas.

**Independent Test**: trocar a ficha de um personagem para Iluminura, conferir o layout, rolar uma perícia e voltar
para Cogitador.

**Acceptance Scenarios**:

1. **Given** a ficha Cogitador, **When** o dono escolhe Iluminura no menu de ficha, **Then** a ficha reabre no layout Iluminura e a escolha fica salva no ator.
2. **Given** a Iluminura, **When** o jogador usa qualquer aba, **Then** todas as funções da ficha atual estão disponíveis.
3. **Given** a configuração de fichas do mundo, **When** o Mestre define Iluminura como padrão, **Then** os personagens sem escolha própria abrem nela.

---

### User Story 3 - Cartões de chat no design system (Priority: P2)

Todos os cartões de chat do sistema (rolagem, ataque, dano, defesa, magia, perigos, zonas, veículos, naves etc.)
passam a usar o design system:
- filete de lacre no topo e título em Cinzel com a parada em mono;
- dados em facetas de d10: mantidos em tinta (ou fósforo, no escuro), explodidos em lacre, descartados riscados;
- total grande com o TN;
- faixa de sucesso ou fracasso com texto;
- botões no estilo do sistema.

Seguem o tema do Foundry.

**Why this priority**: o chat é a outra metade da mesa; foi pedido junto com as fichas.

**Independent Test**: rolar uma perícia, um ataque com dano e um perigo, e conferir os cartões nos dois temas.

**Acceptance Scenarios**:

1. **Given** uma rolagem, **When** o cartão aparece, **Then** os dados mostram mantidos, explodidos e descartados por forma e cor, e o resultado tem texto.
2. **Given** cartões com botões (aplicar dano, defender, resolver), **When** exibidos, **Then** os botões funcionam como hoje e seguem o estilo do sistema.
3. **Given** o tema claro ou o escuro, **When** o chat é exibido, **Then** os cartões usam a variante correspondente.

---

### User Story 4 - Resto do sistema em tokens (Priority: P3)

As fichas de NPC, minion, esquadrão, veículo, nave e itens, e os diálogos do sistema, passam a usar as cores, as
fontes e os componentes do design system (títulos, gemas, selos, botões, campos), **sem mudar o layout**.

**Why this priority**: dá unidade visual sem redesenhar tudo agora.

**Independent Test**: abrir um NPC, um veículo, uma nave, um item e um diálogo de rolagem nos dois temas; tudo legível e
coerente, sem quebra de layout.

**Acceptance Scenarios**:

1. **Given** qualquer outra ficha ou diálogo do sistema, **When** aberto, **Then** usa as cores, as fontes e os componentes do design system, nos dois temas.
2. **Given** essas fichas, **When** usadas, **Then** nenhuma função ou campo deixa de aparecer.

---

### Edge Cases

- Personagem com 6 numa característica ou perícia: a 6ª gema aparece tracejada e dourada.
- Bônus de raça ou exaltação nas características: as gemas do bônus aparecem com aro claro, como hoje ele é indicado.
- Perícia avançada sem treino: marcada e sem parada.
- Personagem em criação (016): o painel da criação aparece no novo layout.
- Janela estreita: os layouts não estouram; a Cogitador tem largura padrão maior.
- Sem retrato próprio: o retrato padrão do Foundry aparece na moldura.
- Usuário com outro sistema de fontes: as fontes vêm do próprio sistema; sem internet, a ficha continua igual.
- Módulos de terceiros que estilizam o chat: o estilo do sistema vale só dentro dos cartões do sistema.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST ter os tokens do design system (cores, tipografia, espaço, forma, grão) em duas variantes, Vellum (tema claro) e Cogitator (tema escuro), aplicadas só aos elementos do sistema.
- **FR-002**: As fontes Cinzel, Cinzel Decorative, Crimson Pro e Share Tech Mono MUST vir empacotadas no sistema, com as licenças OFL, sem depender de internet.
- **FR-003**: A ficha de personagem MUST ter dois layouts registrados no seletor de ficha do Foundry: Cogitador (padrão) e Iluminura.
- **FR-004**: Os dois layouts MUST manter todas as abas, campos, modos (Edição, Jogo, Evolução) e ações da ficha atual.
- **FR-005**: A ficha atual MUST ser substituída pelos dois layouts; personagens que tinham a ficha atual escolhida abrem na Cogitador.
- **FR-006**: O layout Cogitador MUST manter HP, Resolve, Fatigue, Hero Points, Power Stat, condições e XP visíveis num trilho lateral fixo em todas as abas.
- **FR-007**: As gemas MUST distinguir cheio e vazio pela forma, a 6ª gema (exceção) e o bônus de raça ou exaltação.
- **FR-008**: A tabela de perícias da Cogitador e o índice da Iluminura MUST mostrar a parada de cada perícia, calculada como a rolagem já calcula.
- **FR-009**: Todos os cartões de chat do sistema MUST usar o design system, nos dois temas, mantendo as ações dos botões.
- **FR-010**: As outras fichas e os diálogos MUST usar tokens, fontes e componentes do design system, sem mudança de layout nem perda de campos.
- **FR-011**: Texto MUST ter contraste de pelo menos 4.5:1 sobre o fundo nas duas variantes; latão (claro) e lacre (escuro) só em ornamento ou texto grande.
- **FR-012**: Estados MUST ser indicados também por forma ou texto, não só por cor.
- **FR-013**: Textos novos MUST existir em inglês e pt-BR.

### Key Entities

- **Tokens**: variáveis de cor, tipo, espaço e forma, por variante.
- **Layout de ficha**: Cogitador ou Iluminura; escolha por ator (seletor do Foundry) com padrão do mundo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das funções da ficha atual (abas, modos, botões, campos) continuam acessíveis nos dois layouts, conferidas por roteiro.
- **SC-002**: Todos os cartões de chat do sistema (19 templates) aparecem no design system nos dois temas.
- **SC-003**: Todas as combinações de texto e fundo dos tokens passam de 4.5:1, exceto latão (claro) e lacre (escuro), restritos a ornamento e texto grande.
- **SC-004**: A ficha abre e troca de aba sem atraso perceptível em relação à atual.
- **SC-005**: A ficha funciona sem internet (fontes e ornamentos locais).

## Assumptions

- O conteúdo das abas (traços, equipamento, combate, magia, marcial, classe e XP) é o mesmo nos dois layouts; muda o visual, não a estrutura dos dados.
- As propostas A e B dos mockups são a referência visual; pequenas adaptações para caber os campos reais (modo Edição, criação) são esperadas.
- A proposta C (Dossiê) fica fora; o design system permite fazê-la depois.
- Fora de escopo: novos layouts para NPC, itens, veículos e naves; temas além de claro e escuro; animações.

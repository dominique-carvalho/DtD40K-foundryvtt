# Feature Specification: Ícones próprios dos compêndios (Scriptorium Machina)

**Feature Branch**: `024-compendium-icons`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Ícones próprios para todos os documentos de compêndio, no visual Scriptorium Machina da
021: placa Cogitador (octógono de ferro, aro e rebites de latão, glifo chapado na cor da categoria), um glifo por item,
atores incluídos; glifos do game-icons.net (CC BY 3.0) com créditos."

**Referência visual**: design system da 021 (`styles/tokens.css`, ficha Cogitador). Constituição v1.2.1.

**Depende de**: todos os compêndios existentes (002–019, 022), 021 (design system).

## Decisões do usuário (2026-10-04)

- Moldura A, **placa Cogitador**: octógono de ferro, aro e quatro rebites de latão, filete interno e glifo na cor da
  categoria. Cada imagem é autocontida (com fundo) e precisa ficar legível nos temas claro e escuro e fora das fichas.
- **Um glifo por item**, escolhido para o que o item é (Autopistol com pistola, Power Sword com espada); quando não há
  glifo próprio, vale o glifo padrão da subcategoria.
- **Atores entram também**: NPCs, Minion Squads, naves e veículos do compêndio (imagem do ator e do token).
- Glifos do game-icons.net (CC BY 3.0), com crédito aos autores.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Itens de compêndio com ícone próprio (Priority: P1)

O Mestre ou o jogador abre qualquer compêndio de itens do sistema (equipamento, armas, feats, magias, classes, raças,
exaltações, divindades, escolas marciais, componentes de veículo e nave) e vê cada entrada com um ícone na placa
Cogitador, com um glifo que representa aquele item e a cor da sua categoria. Ao arrastar o item para uma ficha, o
ícone aparece na linha do item.

**Why this priority**: é o pedido central: hoje os ~1.100 itens dividem cerca de 40 ícones genéricos do Foundry, que não
distinguem os itens nem combinam com o visual do sistema.

**Independent Test**: abrir o compêndio de equipamento e o de magias; conferir que nenhum item usa ícone do Foundry, que
itens diferentes da mesma subcategoria têm glifos diferentes quando o livro os distingue (pistola, espada, granada) e
que a Autopistol arrastada para a ficha de Aldred mostra o mesmo ícone.

**Acceptance Scenarios**:

1. **Given** qualquer compêndio de itens do sistema, **When** listado, **Then** todas as entradas mostram um ícone na placa Cogitador, nenhum do Foundry.
2. **Given** dois itens de mesma subcategoria e natureza diferente (Autopistol e Lasgun; Power Sword e Chainaxe), **When** comparados, **Then** os glifos são diferentes.
3. **Given** a categoria do item, **When** o ícone é exibido, **Then** o glifo e o filete usam a cor fixada para a categoria (armas em lacre, drogas em âmbar, cibernéticos em fósforo, magias e divindades em ouro…).
4. **Given** os temas claro e escuro do Foundry e os dois layouts de ficha (Cogitador e Iluminura), **When** o item aparece no diretório, na ficha e no chat, **Then** o ícone é legível em todos.

---

### User Story 2 - Atores de compêndio com ícone e token próprios (Priority: P2)

NPCs, Minion Squads, naves e veículos do compêndio têm retrato e token na placa Cogitador, com glifo que lembra a
criatura ou a máquina (dragão, fantasma, drone, caça, tanque). Os itens dentro deles (armas, componentes) usam os mesmos
ícones dos itens equivalentes do compêndio.

**Why this priority**: completa o compêndio; no mapa, tokens distintos ajudam a reconhecer cada NPC.

**Independent Test**: importar o Dragon, um veículo e uma nave, colocar os tokens numa cena e conferir retrato, token e
os ícones das armas e componentes na ficha.

**Acceptance Scenarios**:

1. **Given** um ator do compêndio, **When** importado, **Then** o retrato e o token usam o ícone próprio, nenhum do Foundry.
2. **Given** uma arma embutida num NPC com o mesmo nome de uma arma do compêndio, **When** exibida, **Then** usa o mesmo ícone.
3. **Given** uma arma ou componente embutido sem equivalente no compêndio, **When** exibido, **Then** usa um glifo próprio ou o padrão da subcategoria.

---

### User Story 3 - Ícones padrão para documentos novos e itens antigos do mundo (Priority: P3)

Um item ou ator criado no mundo, sem vir de compêndio, nasce com o ícone padrão do seu tipo no mesmo estilo. Itens que já
estão no mundo vindos do compêndio, ainda com o ícone antigo do Foundry, podem ser atualizados pelo Mestre com uma ação
própria, que pede confirmação e não toca em imagens escolhidas pelo usuário.

**Why this priority**: mantém o visual coerente fora dos compêndios; os mundos em uso já têm itens importados antes.

**Independent Test**: criar uma arma e um NPC em branco e ver os ícones padrão; no mundo Mist of Imlarin, rodar a
atualização e ver os itens de Aldred com os ícones novos e uma imagem personalizada preservada.

**Acceptance Scenarios**:

1. **Given** a criação de um item ou ator de um tipo do sistema sem imagem, **When** criado, **Then** recebe o ícone padrão do tipo.
2. **Given** itens do mundo com o ícone antigo e origem num compêndio do sistema, **When** o Mestre roda a atualização e confirma, **Then** passam a usar o ícone novo do item de origem.
3. **Given** um item com imagem escolhida pelo usuário, **When** a atualização roda, **Then** a imagem é mantida.

---

### Edge Cases

- Item cujo nome não tem glifo curado: usa o glifo padrão da subcategoria e entra na lista de pendências de curadoria.
- Itens com o mesmo nome em compêndios diferentes (ex.: arma de NPC e arma do equipamento): o mesmo ícone, salvo quando a tabela distingue.
- Tabelas de rolagem: cada tabela recebe um ícone da sua natureza (crítico, perigo, encontro), sem ícone por resultado.
- Pastas dos compêndios: ficam como estão (o Foundry não mostra imagem de pasta).
- Ícone muito pequeno (lista compacta, 24 px): o glifo continua reconhecível; a placa não pode engolir o glifo.
- Repetição do processo: rodar a geração de novo produz os mesmos arquivos e os mesmos caminhos (sem diferença de conteúdo).
- Item novo adicionado a um compêndio no futuro sem ícone: o teste acusa até ele receber um.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo documento dos compêndios do sistema (itens, atores, tabelas) MUST ter imagem própria do sistema; nenhum pode usar imagem do Foundry nem apontar para arquivo inexistente.
- **FR-002**: As imagens MUST seguir a placa Cogitador: octógono de ferro, aro e quatro rebites de latão, filete interno e glifo chapado na cor da categoria, com as cores da paleta do design system da 021.
- **FR-003**: Cada categoria MUST ter uma cor fixa e documentada (armas, armaduras, drogas, cibernéticos, equipamento, artefatos, magias, feats, Assets, Hindrances, Exalted Assets, raças, exaltações, classes, divindades, escolas marciais, componentes de veículo, componentes de nave, NPCs, naves, veículos, tabelas).
- **FR-004**: Cada item MUST ter um glifo escolhido para ele por uma tabela curada; sem escolha, vale o glifo padrão da subcategoria.
- **FR-005**: Itens embutidos em atores MUST usar o mesmo ícone do item de mesmo nome e tipo do compêndio, ou o seu próprio, ou o padrão da subcategoria.
- **FR-006**: Atores MUST ter retrato e token com o mesmo ícone.
- **FR-007**: As imagens MUST ser geradas de forma reprodutível a partir da tabela curada e dos glifos versionados no repositório, sem depender de rede para gerar nem para rodar o sistema.
- **FR-008**: O sistema MUST trazer os créditos dos glifos (autores e licença CC BY 3.0) num arquivo de créditos e no README.
- **FR-009**: Itens e atores criados no mundo sem imagem MUST receber o ícone padrão do seu tipo.
- **FR-010**: O Mestre MUST poder atualizar os documentos do mundo que vieram de um compêndio do sistema e ainda usam a imagem antiga do Foundry; a ação pede confirmação, informa quantos documentos mudam e não altera imagens personalizadas.
- **FR-011**: Um teste automatizado MUST falhar se algum documento de compêndio usar imagem do Foundry, apontar para arquivo inexistente ou ficar sem imagem.
- **FR-012**: O pacote publicado (release) MUST incluir as imagens.

### Key Entities

- **Categoria de ícone**: agrupamento visual (ex.: armas) com cor e glifo padrão; cobre um ou mais tipos/subcategorias de documento.
- **Glifo**: desenho monocromático vindo do banco de ícones, com autor e licença.
- **Tabela de curadoria**: associa cada documento (por compêndio, tipo e nome) a um glifo e a uma categoria.
- **Ícone gerado**: imagem final (placa + glifo + cor) com caminho estável por categoria e nome do documento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos documentos de compêndio (≈1.249, mais os ≈328 itens embutidos nos atores) com imagem do sistema; 0 com imagem do Foundry.
- **SC-002**: Pelo menos 90% dos itens com glifo próprio (não o padrão da subcategoria); os demais listados nas pendências de curadoria.
- **SC-003**: Em cada subcategoria com mais de um item de natureza diferente, nenhum par de itens distintos do livro (ex.: pistola e fuzil) compartilha o glifo sem justificativa na tabela.
- **SC-004**: Os ícones são reconhecíveis a 24 px e a 64 px nos temas claro e escuro, conferidos nas duas fichas, no diretório e no chat.
- **SC-005**: Gerar de novo os ícones não altera nenhum arquivo.
- **SC-006**: O pacote da release continua instalável pelo manifesto e com tamanho até 2× o atual (≈1,2 MB).

## Assumptions

- Glifos do game-icons.net, licença CC BY 3.0: uso, recoloração e redistribuição permitidos com crédito; só os glifos usados ficam no repositório.
- Imagens em SVG vetorial: nítidas em qualquer tamanho e leves; o Foundry 13 aceita SVG como imagem de item, ator e token.
- A placa é idêntica nos dois layouts de ficha (decisão A); a Iluminura usa a mesma imagem.
- Pastas de compêndio não têm imagem.
- Tabelas recebem ícone por tabela, não por resultado.
- O nome do item (em inglês, como no compêndio) é a chave da curadoria.
- Fora de escopo, registrado em `docs/pendencias.md`: ícones das condições (status effects) e arte ilustrada de retrato ou token.

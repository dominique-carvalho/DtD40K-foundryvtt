# Feature Specification: Descrições no montador de personagem

**Feature Branch**: `026-builder-descriptions`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Melhoria para o character builder: uma breve descrição dos itens escolhidos para a ficha
(Assets, Hindrances e outros), com o mínimo de informação para que o jogador que está criando a ficha não precise
consultar o livro sobre todos os detalhes."

**Referência**: DtD 7.7a — raças (cap. 4), exaltações (cap. 5), classes (cap. 6), Assets e Hindrances (p. 179),
Backgrounds (pp. 280–283), divindades (cap. 12), equipamento (caps. XIII–XIV). Constituição v1.2.1.

**Depende de**: 023 (montador de personagem); compêndios 002–011 e 007 (descrições resumidas já existentes).

## Decisões do usuário (2026-10-05)

- **Linha + painel**:
  - Nas listas (feats, Assets, Hindrances, classes, compras de XP, equipamento), uma linha curta sob cada opção.
  - Nos cartões (raça, exaltação, divindade, Exalted Asset), um painel com o resumo da opção selecionada.
- **Todos os passos**: raça, exaltação, classe, backgrounds, divindade, Assets e Hindrances, Exalted Asset, compras de
  XP e equipamento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traços com descrição curta (Priority: P1)

O jogador, no passo Assets e Hindrances, vê sob cada nome uma linha com o que o traço faz e o que custa ou dá, e decide
sem abrir o livro. O mesmo vale para os Exalted Assets e para os feats nas compras de XP.

**Why this priority**: é onde o jogador mais escolhe às cegas; são dezenas de opções com nomes pouco descritivos.

**Independent Test**: no passo Assets e Hindrances, ler a linha de Enemy, Impulsive e Appearance e conferir que dizem o
efeito; marcar Appearance e ver o custo no saldo.

**Acceptance Scenarios**:

1. **Given** a lista de Hindrances e de Assets, **When** exibida, **Then** cada opção tem uma linha com o efeito resumido e o valor em XP.
2. **Given** uma opção com pré-requisito (raça, exaltação, outro feat), **When** exibida, **Then** a linha diz o pré-requisito.
3. **Given** os Exalted Assets da exaltação, **When** um é selecionado, **Then** o painel mostra o efeito e o custo.
4. **Given** um feat escolhido na lista de compras de XP, **When** selecionado no seletor, **Then** a descrição aparece antes de comprar; a lista de compras mostra a linha de cada um.

---

### User Story 2 - Raça, exaltação, classe e divindade com resumo (Priority: P2)

Ao clicar num cartão de raça, exaltação ou divindade, um painel mostra o essencial da opção. Para raça e exaltação,
o resumo é montado dos dados do compêndio e vem antes do texto. Na lista de classes, cada classe mostra uma linha com o
papel e os pré-requisitos.

**Why this priority**: são as escolhas que definem o personagem, mas o texto do livro é longo; o resumo aponta o que
muda na ficha.

**Independent Test**: escolher Tiefling, Werewolf, Mercenary e Malal e conferir o painel e a linha de cada um.

**Acceptance Scenarios**:

1. **Given** uma raça selecionada, **When** o painel aparece, **Then** mostra os bônus de característica e perícia, o tamanho, o poder racial com o efeito e um parágrafo de apresentação.
2. **Given** uma exaltação selecionada, **When** o painel aparece, **Then** mostra o Power Stat, o recurso, os poderes iniciais e um parágrafo de apresentação.
3. **Given** a lista de classes, **When** exibida, **Then** cada classe tem uma linha com o papel e os pré-requisitos (nível, perícias, feats).
4. **Given** uma divindade selecionada, **When** o painel aparece, **Then** mostra o resumo do deus e o panteão.

---

### User Story 3 - Backgrounds e equipamento com descrição (Priority: P3)

Cada background tem uma linha que diz o que os pontos dão. Em cada vaga de equipamento, o item escolhido mostra o
efeito e os números principais: dano, Pen e alcance das armas, AP das armaduras, efeito do equipamento.

**Why this priority**: completa o assistente; backgrounds hoje só têm o nome e o equipamento só o nome e a raridade.

**Independent Test**: no passo Backgrounds, ler a linha de Allies, Contacts e Wealth; no passo Equipamento, escolher uma
Autopistol e uma armadura e ver a linha com os números.

**Acceptance Scenarios**:

1. **Given** os 11 backgrounds, **When** listados, **Then** cada um tem uma linha com o que os pontos dão.
2. **Given** uma vaga de equipamento com item escolhido, **When** exibida, **Then** mostra o efeito e os números principais do item.

---

### Edge Cases

- Descrição longa: a linha mostra só o começo (até o fim da primeira frase, com limite de tamanho); o painel mostra o resumo dos dados e o primeiro parágrafo.
- Item sem descrição: a linha mostra só os números ou nada; o assistente não quebra.
- Idioma: os textos fixos novos (backgrounds, rótulos do painel) existem em pt-BR e en; as descrições dos compêndios seguem em inglês, como nas fichas.
- Opção bloqueada (classe sem pré-requisito, feat fora da lista): a linha continua visível, com o motivo do bloqueio ao lado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: As listas de Assets, Hindrances, Exalted Assets, classes e feats de compra MUST mostrar sob cada opção uma linha curta com o efeito, tirada da descrição do compêndio.
- **FR-002**: A linha de Assets, Hindrances e feats MUST trazer o valor em XP (custo ou ganho) e os pré-requisitos, quando houver.
- **FR-003**: Os passos de cartões (raça, exaltação, divindade, Exalted Asset) MUST mostrar um painel com o resumo da opção selecionada.
- **FR-004**: O resumo da raça MUST listar os bônus de característica e perícia, o tamanho e o poder racial com o efeito; o da exaltação, o Power Stat, o recurso e os poderes iniciais; ambos seguidos de um parágrafo de apresentação.
- **FR-005**: Os 11 backgrounds MUST ter uma linha descritiva própria (texto novo, redação própria, pt-BR e en).
- **FR-006**: As vagas de equipamento e o seletor de compras de XP MUST mostrar a descrição e os números principais do item escolhido.
- **FR-007**: A redução de texto (linha curta, primeiro parágrafo, resumo dos dados) MUST ser feita por regras puras e testadas, sem mudar os compêndios.

### Key Entities

- **Linha de opção**: texto curto (efeito + números) derivado de um item do compêndio.
- **Painel de resumo**: lista de fatos (bônus, recursos, poderes) + parágrafo de apresentação da opção selecionada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das opções dos passos listados com linha ou painel; nenhum sem texto quando o compêndio tem descrição.
- **SC-002**: Cada linha cabe em até 2 linhas da janela (~180 caracteres de texto).
- **SC-003**: Montar a Jane (p. 18) usando só o assistente, sem consultar o livro para entender as opções escolhidas.

## Assumptions

- As descrições dos compêndios (já resumidas, redação própria) são a fonte; esta feature não reescreve os compêndios.
- Painel abaixo dos cartões, dentro do passo; o resumo lateral do personagem continua como está.
- Fora de escopo: descrições nos passos de características, perícias e especialidades (o assistente já explica a regra do passo).

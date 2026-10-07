# Feature Specification: Compêndio de cenário (cap. XVIII)

**Feature Branch**: `028-setting-compendium`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Implementar o capítulo que falta (XVIII, Setting), com as recomendações: referência curta,
só links no texto e compêndio aberto com os ganchos de aventura só para o Mestre."

**Referência**: DtD 7.7a, cap. XVIII Setting (pp. 454–507): History of the Wheel, The Great Wheel, Sigil, Notable
Crystal Spheres. Constituição v1.2.1.

**Depende de**: compêndios *Races* (002), *Exaltations* (004), *Deities* (011), *Ship Components*/viagem pelo Warp
(014) — como destino de links; ícones (024).

## Decisões do usuário (2026-10-06)

- **Referência curta**: um a dois parágrafos por bloco, para o Mestre e os jogadores consultarem na mesa; não é uma
  reescrita do capítulo.
- **Só links no texto**: deuses, raças, exaltações e outros termos que já existem nos compêndios viram links; as
  integrações com o Backing (facções de Sigil) e com a viagem pelo Warp (esfera de destino) ficam para depois.
- **Compêndio aberto, ganchos só para o Mestre**: todos leem o cenário; as páginas de ganchos de aventura (spoilers)
  só aparecem para o Mestre.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar uma esfera de cristal (Priority: P1)

O Mestre prepara uma sessão em Baator. Abre o compêndio de cenário, encontra a esfera e lê, em poucos parágrafos, como
ela é fisicamente, quem vive lá e os lugares de destaque; na página de ganchos, vê ideias de aventura. Um jogador que
abre a mesma esfera lê tudo, menos os ganchos.

**Why this priority**: as 15 esferas são a maior parte do capítulo e o que o Mestre mais consulta durante o jogo.

**Independent Test**: abrir "Baatorian" como Mestre e como jogador; conferir as páginas e que os ganchos só aparecem
para o Mestre.

**Acceptance Scenarios**:

1. **Given** o compêndio de cenário, **When** aberto, **Then** as 15 esferas do capítulo estão numa pasta própria, uma entrada por esfera.
2. **Given** uma esfera, **When** aberta, **Then** tem as páginas condições físicas, habitantes, locais e ganchos de aventura, cada uma com um resumo curto em redação própria.
3. **Given** um jogador (não Mestre), **When** abre uma esfera, **Then** vê condições, habitantes e locais, mas não a página de ganchos.

---

### User Story 2 - História, cosmologia e Sigil (Priority: P2)

Um jogador novo quer entender o mundo: lê a história do Wheel (das guerras antigas à era atual), como funcionam o Astral
Sea, os portais, as naves e o Warp, e o que é Sigil, com a Lady of Pain e as facções.

**Why this priority**: dá o contexto que as escolhas da ficha supõem (raças, exaltações, deuses, Backing em facções),
mas é lido menos vezes que as esferas.

**Independent Test**: abrir as entradas de história, cosmologia e Sigil e conferir as seções e as facções.

**Acceptance Scenarios**:

1. **Given** o compêndio, **When** aberto, **Then** há entradas para a história do Wheel, a cosmologia (Astral Sea, portais, naves, Warp, Umbra) e Sigil, em pastas próprias.
2. **Given** a entrada de Sigil, **When** aberta, **Then** tem uma visão geral, a Lady of Pain, as facções (cada uma com a filosofia em uma ou duas frases e o seu líder) e os locais.
3. **Given** a história, **When** lida, **Then** segue a ordem das eras do capítulo, cada era em um ou dois parágrafos.

---

### User Story 3 - Navegar pelos links (Priority: P3)

Lendo uma esfera ou a história, o usuário clica no nome de um deus, de uma raça ou de uma exaltação citada e abre a
entrada correspondente dos compêndios do sistema.

**Why this priority**: liga o cenário ao que já está no sistema, sem integração nova.

**Independent Test**: numa esfera que cita um deus e uma raça, clicar nos dois links e ver as fichas do compêndio.

**Acceptance Scenarios**:

1. **Given** um texto que cita um deus, uma raça ou uma exaltação que existe nos compêndios, **When** exibido, **Then** o nome é um link para a entrada do compêndio.
2. **Given** os links do compêndio, **When** conferidos, **Then** nenhum aponta para uma entrada que não existe.

---

### Edge Cases

- Termo do cenário sem entrada nos compêndios (uma facção, um lugar): fica como texto, sem link.
- Mesmo termo citado várias vezes numa página: só a primeira citação vira link, para o texto não ficar poluído.
- Idioma: os textos do compêndio ficam em inglês, como os demais compêndios; nomes de pastas e do compêndio seguem a tradução do sistema quando houver.
- Jogador sem permissão: vê o compêndio e as entradas, mas não pode editá-los.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST ter um compêndio de cenário com entradas de diário para a história do Wheel, a cosmologia, Sigil e cada uma das 15 esferas de cristal do capítulo, organizadas em pastas (História, Cosmologia, Sigil, Esferas).
- **FR-002**: Cada esfera MUST ter as páginas condições físicas, habitantes, locais e ganchos de aventura.
- **FR-003**: A página de ganchos de cada esfera MUST ser visível só para o Mestre; as demais páginas, para todos.
- **FR-004**: A entrada de Sigil MUST trazer a visão geral, a Lady of Pain, cada facção com a filosofia resumida e o líder, e os locais.
- **FR-005**: Os textos MUST ser resumos curtos em redação própria (um a dois parágrafos por bloco), sem trechos copiados do livro, verificados pelo mesmo teste de trechos repetidos dos demais compêndios.
- **FR-006**: Deuses, raças e exaltações citados que existem nos compêndios MUST virar links para essas entradas (a primeira citação em cada página).
- **FR-007**: Um teste MUST conferir a quantidade de entradas e páginas, a visibilidade dos ganchos e que todos os links apontam para entradas existentes.
- **FR-008**: As entradas MUST ter ícones no padrão dos compêndios do sistema.

### Key Entities

- **Entrada de cenário**: um diário com título, pasta e páginas de texto.
- **Página**: título, texto curto e visibilidade (todos ou só o Mestre).
- **Link de compêndio**: referência no texto para um deus, raça ou exaltação dos compêndios do sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As 15 esferas, a história, a cosmologia e Sigil estão no compêndio (18 entradas), e cada esfera tem as 4 páginas.
- **SC-002**: Nenhuma página de ganchos aparece para um jogador; todas aparecem para o Mestre.
- **SC-003**: 0 trechos de 6 palavras em comum com o texto do capítulo; cada bloco com no máximo 2 parágrafos.
- **SC-004**: 100% dos links abrem a entrada certa; nenhum link quebrado.
- **SC-005**: O Mestre encontra uma esfera e lê o essencial dela em menos de 1 minuto.

## Assumptions

- O capítulo não tem regra mecânica: nada é automatizado, só consultado.
- Os nomes próprios (esferas, facções, lugares, personagens) são mantidos como no livro; o texto em volta é próprio.
- Fora de escopo: facções de Sigil como sugestão no Backing do montador, esfera de destino na viagem pelo Warp,
  mapas e imagens ilustradas, e os capítulos XIX (Story Master) e o exemplo de jogo.

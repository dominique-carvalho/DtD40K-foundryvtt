# Feature Specification: Backing e Inheritance no montador de personagem

**Feature Branch**: `027-builder-backing-inheritance`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Campo de Backing e escolha dos itens de Inheritance no montador de personagem."

**Referência**: DtD 7.7a — Backgrounds na criação (pp. 15–16), Artifact, Backing e Inheritance (pp. 280–282).
Constituição v1.2.1.

**Depende de**: 011 (Backgrounds na ficha: lista de Backings, contagem da Inheritance), 023 (montador de personagem),
026 (descrições no montador).

## Decisões do usuário (2026-10-06)

- **Backing como lista, igual a Artifact**: no passo Backgrounds, um botão adiciona uma organização (nome e pontos de 1
  a 5); pode haver várias.
- **Inheritance com itens do compêndio**: o jogador escolhe os itens de verdade, com aviso quando não cabem na nota.
- **No passo Equipamento**: uma seção "Inheritance" abaixo das vagas iniciais; a nota continua no passo Backgrounds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backing no passo Backgrounds (Priority: P1)

O jogador cujo herói serve a uma organização (um exército, um sindicato, uma ordem) adiciona um Backing com o nome da
organização e os pontos, vê o texto que explica o Backing, e o custo entra na conta dos Backgrounds. Ao concluir, a
ficha tem o Backing com o mesmo nome e os mesmos pontos.

**Why this priority**: hoje o Backing não pode ser escolhido no montador; o jogador precisa lembrar de comprá-lo depois,
na ficha, com outra conta de pontos.

**Independent Test**: adicionar "Harmonium" com 2 pontos e "Doomguard" com 1; conferir os pontos gratuitos e o XP;
concluir e ver os dois Backings na ficha.

**Acceptance Scenarios**:

1. **Given** o passo Backgrounds, **When** exibido, **Then** há uma seção Backing com o texto explicativo e um botão para adicionar uma organização.
2. **Given** uma organização adicionada, **When** o jogador escreve o nome e os pontos (1 a 5), **Then** os pontos entram nos 7 gratuitos e no XP como os dos demais Backgrounds.
3. **Given** duas ou mais organizações, **When** listadas, **Then** cada uma pode ser editada ou removida sem afetar as outras.
4. **Given** o personagem concluído, **When** a ficha abre, **Then** cada organização com nome aparece como Backing com os seus pontos, e o XP gasto é o mesmo que o montador mostrou.

---

### User Story 2 - Itens da Inheritance no passo Equipamento (Priority: P1)

O jogador com Inheritance escolhe, no passo Equipamento, os itens que herdou: por exemplo, com Inheritance 2, um item
Rare ou dois itens Uncommon. Cada item mostra a linha de descrição. Se os itens não cabem na nota, um aviso diz isso, e
o Mestre pode liberar. Ao concluir, os itens estão no inventário.

**Why this priority**: é a outra metade que a 023 deixou para a ficha; sem ela, a nota de Inheritance não dá nada no
montador.

**Independent Test**: com Inheritance 2, escolher um item Rare; trocar por dois Uncommon; tentar três Uncommon e ver o
aviso; concluir e ver os itens no inventário.

**Acceptance Scenarios**:

1. **Given** Inheritance 0, **When** o passo Equipamento abre, **Then** a seção Inheritance mostra só o texto explicativo, sem seletores.
2. **Given** Inheritance de 1 a 5, **When** o jogador adiciona um item, **Then** pode escolher qualquer item não artefato do compêndio de equipamento, de qualquer raridade, e o mesmo item pode se repetir.
3. **Given** itens escolhidos, **When** exibidos, **Then** cada um mostra a raridade e a linha de descrição (números e efeito), e a seção mostra quanto da nota foi usado.
4. **Given** itens que não cabem na nota (ex.: três Uncommon com Inheritance 2), **When** exibidos, **Then** o passo avisa que passam da Inheritance; o Mestre pode liberar o passo.
5. **Given** o personagem concluído, **When** a ficha abre, **Then** os itens da Inheritance estão no inventário e a contagem por raridade da Inheritance na ficha corresponde aos itens escolhidos.

---

### Edge Cases

- Organização sem nome: não é criada na ficha; o passo avisa.
- Nota de Inheritance reduzida depois de escolher os itens: os itens ficam no rascunho e o aviso aparece no passo Equipamento.
- Itens da Inheritance não ocupam as vagas iniciais (1 Rare, 1 Uncommon, 2 Common, 2 Very Common), e as vagas não contam na Inheritance.
- Artefatos (hearthstones, materiais, maravilhas) não aparecem nos seletores da Inheritance: são comprados como Artifact.
- Rascunho salvo antes desta feature: abre sem Backings e sem itens de Inheritance, e continua válido.
- Backing acima de 3 pontos custa XP como os demais Backgrounds; acima de 5 é bloqueado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O passo Backgrounds MUST ter uma seção Backing com o texto explicativo e uma lista de organizações (nome e pontos de 1 a 5) em que se adicionam, editam e removem entradas.
- **FR-002**: Os pontos de cada Backing MUST contar nos 7 pontos gratuitos e no XP de Backgrounds pelas mesmas regras dos demais (grátis até 3 enquanto houver pontos gratuitos; 50 XP por ponto de 1 a 3 e 100 por ponto de 4 a 5).
- **FR-003**: O passo Equipamento MUST ter uma seção Inheritance: com nota 0, só o texto explicativo; com nota de 1 a 5, uma lista em que se adicionam, trocam e removem itens não artefatos do compêndio, de qualquer raridade, com repetição.
- **FR-004**: Cada item da Inheritance MUST mostrar a raridade e a linha de descrição da 026.
- **FR-005**: O passo Equipamento MUST avisar quando os itens da Inheritance não cabem na nota (p. 282: na nota 1, um Uncommon, dois Common, quatro Very Common ou oito Ubiquitous; cada nota acima permite um item mais raro ou duas escolhas da nota anterior; na 5, qualquer item não artefato). O passo fica bloqueado e o Mestre pode liberá-lo, como nos demais passos.
- **FR-006**: A seção Inheritance MUST mostrar quanto da nota os itens escolhidos usam.
- **FR-007**: Ao concluir, cada organização com nome MUST virar um Backing na ficha com os seus pontos, e os itens da Inheritance MUST entrar no inventário, com a contagem por raridade gravada na Inheritance da ficha.
- **FR-008**: Rascunhos salvos antes desta feature MUST abrir sem erro, com as listas novas vazias.
- **FR-009**: A conta dos itens da Inheritance MUST usar as regras puras e testadas que a ficha já usa.

### Key Entities

- **Backing do rascunho**: nome da organização e pontos (1 a 5); vira um Backing da ficha.
- **Item de Inheritance do rascunho**: referência a um item do compêndio de equipamento; vários podem ser o mesmo item.
- **Contagem da Inheritance**: quantos itens de cada raridade, gravada na ficha a partir dos itens escolhidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um personagem com dois Backings e Inheritance 2 é montado e concluído sem passar pela ficha para completar Backgrounds ou itens herdados.
- **SC-002**: O XP de Backgrounds mostrado no montador é igual ao XP registrado na ficha depois de concluir, em 100% dos casos testados (com e sem Backing acima de 3).
- **SC-003**: Toda combinação de itens que a ficha considera dentro da Inheritance também é aceita no montador, e vice-versa.
- **SC-004**: 100% dos itens escolhidos na Inheritance aparecem no inventário depois de concluir.

## Assumptions

- O Mestre decide quantos Backings são permitidos (p. 280); o montador não limita a quantidade.
- Os itens da Inheritance contam pela raridade do item no compêndio (de Ubiquitous a Mythic Rare).
- Itens herdados entram no inventário como os iniciais, sem cobrar dinheiro.
- Fora de escopo: as missões e os Backgrounds temporários do Backing (ficam com o Mestre); idiomas continuam como lembrete.

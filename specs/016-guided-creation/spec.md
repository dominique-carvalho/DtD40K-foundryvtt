# Feature Specification: Criação guiada (DtD 7.7a)

**Feature Branch**: `016-guided-creation`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Contadores na ficha enquanto a criação está ativa: características 6/4/2 por grupo (máx. 4
na etapa), perícias 8/6/4 por categoria (máx. 3 na etapa), Backgrounds 7 pontos; mudanças além dos pontos ou limites
recusadas com aviso e liberadas pelo Mestre; XP inicial 600 + 100 por Hindrance conferido com o gasto; especialidades ao
chegar a 4 pontos; checklist de etapas com o botão de encerrar a criação. Máximo geral 5 (6 nas exceções); na criação
só classes de nível 1; Assets e Hindrances só na criação; idiomas só como lembrete."

**Referência de regras**: DtD **7.7a** — cap. 2 "Character Creation", pp. 12–19 (pontos iniciais p. 13–14, raça p. 14,
exaltação pp. 14–15, classe p. 15, Backgrounds p. 15, alinhamento pp. 15–16, XP e custos p. 16, equipamento p. 16,
exemplo pp. 18–19); faixa das notas p. 22; especialidades p. 23; idiomas p. 24; traços raciais p. 30; Assets e
Hindrances p. 179; exceções ao máximo pp. 68, 76, 84, 213. Constituição v1.2.1.

**Depende de**: 002 (raças), 004 (exaltações), 005 (feats, Assets, Hindrances), 006 (classes e XP), 007 (itens
iniciais), 011 (Backgrounds e alinhamento).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Distribuir características e perícias com contadores (Priority: P1)

Com a criação ativa, a ficha mostra um **painel de criação**. As características começam em 1 e os três grupos
(Physical: Str/Dex/Con; Social: Cha/Fel/Cmp; Mental: Int/Wis/Wil) recebem 6, 4 e 2 pontos; as perícias começam em 0 e
as três categorias (Mental, Physical, Social) recebem 8, 6 e 4 pontos, independentemente da ordem das características.
O painel mostra, por grupo, os pontos gastos e os que faltam, e qual prioridade o grupo ocupa. Nenhuma característica
passa de 4 e nenhuma perícia de 3 com esses pontos. O bônus da raça (e de fontes como Veteran o' the Wheel) e os pontos
comprados com XP **não** consomem esses pontos e podem passar dos limites da etapa.

**Why this priority**: é o núcleo da criação e o que hoje não tem controle nenhum.

**Independent Test**: o personagem de exemplo do livro (Traya, pp. 18–19) — características base Str 4, Dex 2, Con 3,
Cha 1, Fel 2, Cmp 2, Int 1, Wis 2, Wil 4 com Con +1 da raça — aparece com Physical 6/6, Mental 4/4, Social 2/2; as
perícias com Physical 8/8, Social 6/6, Mental 4/4, sem contar Intimidation e Weaponry da raça.

**Acceptance Scenarios**:

1. **Given** um personagem novo em criação, **When** o jogador sobe Str de 1 para 4, **Then** o painel mostra 3 pontos gastos em Physical e a prioridade ajustada.
2. **Given** um grupo já com os pontos da sua prioridade, **When** o jogador tenta subir mais uma característica dele, **Then** a mudança é recusada com aviso, e o Mestre pode permitir mesmo assim.
3. **Given** uma característica em 4 pelos pontos da etapa, **When** o jogador tenta 5, **Then** é recusado (limite da etapa); com o +1 da raça, a mesma característica chega a 5 sem gastar pontos.
4. **Given** uma perícia em 3, **When** o jogador tenta 4 no modo de edição, **Then** é recusado; comprada com XP, sobe normalmente sem entrar na conta.
5. **Given** a criação encerrada, **When** a ficha é aberta, **Then** o painel some e as notas voltam a ser editadas como antes.

---

### User Story 2 - XP inicial, especialidades e limites da criação (Priority: P2)

O painel mostra o **XP da criação**: 600 mais 100 por Hindrance (no máximo 2), o gasto e o que sobra (sobrar é
permitido). **Assets** e **Hindrances** só podem ser tomados com a criação ativa; na criação só entra **classe de nível
1**. O máximo geral de uma nota passa a ser **5**; só as exceções do livro (Daemonhost, Paragon, Atlantean, Mark of
Slaanesh) liberam 6, na criação e nas compras com XP. Cada característica ou perícia com 4 ou mais pede **uma
especialidade**; especialidades extras vêm de Skill Focus, Expanded Knowledge e Education, e o painel mostra as que faltam
ou sobram.

**Why this priority**: completa as regras de criação; depende do painel da US1.

**Independent Test**: com 2 Hindrances, o XP da criação é 800; o exemplo do livro gasta 750 e sobram 50. Uma terceira
Hindrance é recusada. Com a criação encerrada, comprar um Asset é recusado (o Mestre libera). Uma classe de nível 2 é
recusada na criação. Brawl em 4 sem especialidade aparece como pendente no painel.

**Acceptance Scenarios**:

1. **Given** criação ativa e uma Hindrance tomada, **When** o painel é aberto, **Then** mostra XP 700, o gasto e o saldo.
2. **Given** duas Hindrances, **When** o jogador toma a terceira, **Then** é recusada com aviso (o Mestre pode permitir).
3. **Given** criação encerrada, **When** o jogador compra um Asset ou toma uma Hindrance, **Then** é recusado com aviso (o Mestre pode permitir).
4. **Given** criação ativa sem classe, **When** o jogador adiciona uma classe de nível 2 ou mais, **Then** é recusada com aviso.
5. **Given** um personagem sem exceção, **When** uma nota em 5 tenta subir a 6 (edição ou XP), **Then** é recusada; com uma exceção que cubra a nota, sobe a 6.
6. **Given** uma nota com 4 ou mais sem especialidade, **When** o painel é aberto, **Then** ela aparece como especialidade pendente; uma especialidade numa nota abaixo de 4 sem fonte extra aparece como excedente.

---

### User Story 3 - Checklist e encerramento (Priority: P3)

O painel lista as **etapas** da criação com o estado de cada uma: raça, exaltação (quando houver), classe, alinhamento
(divindade escolhida, Devotion 6), características, perícias, Backgrounds (7 pontos, máx. 3), XP, especialidades,
itens iniciais (1 Rare, 1 Uncommon, 2 Common, 2 Very Common, mais os da Inheritance) e um **lembrete de idiomas**
(idioma da raça + Trade + um por ponto de Int acima de 2). O botão **Encerrar criação** fica no painel: com pendências,
pede confirmação listando o que falta; encerrar é do Mestre, como hoje.

**Why this priority**: organiza o fluxo; os cálculos já vêm das US1 e US2.

**Independent Test**: um personagem só com raça mostra raça ✓ e as demais etapas pendentes; o exemplo do livro completo
mostra todas ✓ (idiomas como lembrete); encerrar com pontos sobrando pede confirmação com a lista.

**Acceptance Scenarios**:

1. **Given** criação ativa, **When** a ficha é aberta, **Then** o checklist mostra cada etapa como feita, pendente ou com aviso.
2. **Given** pontos ou especialidades sobrando/faltando, **When** o Mestre encerra a criação, **Then** uma confirmação lista as pendências e só encerra se confirmada.
3. **Given** tudo feito, **When** o Mestre encerra, **Then** encerra sem confirmação extra e o painel some.

---

### Edge Cases

- Personagem já em jogo (criação encerrada) com notas acima dos limites: nada muda nele; os limites da etapa só valem com a criação ativa. O máximo geral 5 vale para novas subidas; notas já em 6 sem exceção ficam como estão (aviso na ficha, sem alteração automática).
- Criação reaberta pelo Mestre: os contadores voltam a aparecer e contam de novo a partir das notas e do log de XP.
- Compra de XP desfeita: o ponto volta a ser contado como ponto da criação só se continuar no valor; o contador acompanha o log.
- Raça trocada durante a criação: o bônus da raça antiga sai e o da nova entra, sem mexer nos pontos gastos.
- Empate de gastos entre grupos (por exemplo 4 e 4): o painel atribui as prioridades na ordem que ainda cabe nos 6/4/2 e avisa quando nenhuma ordem cabe.
- Mestre editando: nunca é bloqueado; recebe o aviso e escolhe permitir.
- NPCs: fora do escopo (a criação é só de personagens).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com a criação ativa, a ficha MUST mostrar um painel de criação com os contadores de características (6/4/2 por grupo), perícias (8/6/4 por categoria), Backgrounds (7), XP e especialidades.
- **FR-002**: Os pontos de criação de uma nota MUST ser calculados como o valor próprio da nota menos a base (1 para características, 0 para perícias) menos os pontos comprados com XP no log; bônus de raça, exaltação e Assets não entram. Nada novo é guardado para essa conta.
- **FR-003**: As prioridades dos grupos MUST ser deduzidas dos gastos (o grupo que mais gasta ocupa a maior prioridade), sem escolha separada; o painel mostra a prioridade de cada grupo.
- **FR-004**: Com a criação ativa, uma mudança no modo de edição que faça os gastos não caberem em 6/4/2 (características) ou 8/6/4 (perícias), ou que leve uma característica acima de 4 ou uma perícia acima de 3 pelos pontos da criação, MUST ser recusada com aviso; o Mestre MUST poder permitir mesmo assim.
- **FR-005**: O máximo geral de características e perícias MUST ser 5; MUST passar a 6 só para as notas cobertas por uma exceção do livro (Daemonhost: características; Paragon Swift as a Coursing River: características e perícias; Atlantean: as três perícias escolhidas; Mark of Slaanesh: as seis perícias escolhidas), na edição e nas compras com XP.
- **FR-006**: O XP da criação MUST ser 600 mais 100 por Hindrance; o painel MUST mostrar total, gasto e saldo; sobrar XP é permitido.
- **FR-007**: Tomar uma terceira Hindrance MUST ser recusado com aviso (o Mestre pode permitir).
- **FR-008**: Com a criação encerrada, comprar Assets e tomar Hindrances MUST ser recusado com aviso (o Mestre pode permitir).
- **FR-009**: Com a criação ativa, adicionar uma classe de nível acima de 1 MUST ser recusado com aviso (o Mestre pode permitir).
- **FR-010**: O painel MUST apontar, por nota, especialidades pendentes (nota em 4+ sem especialidade) e excedentes (especialidade além de uma por nota em 4+ e das fontes extras: Skill Focus, Expanded Knowledge, Education).
- **FR-011**: O painel MUST mostrar o checklist: raça, exaltação (se houver), classe, alinhamento (divindade, Devotion 6), características, perícias, Backgrounds, XP, especialidades, itens iniciais e o lembrete de idiomas (texto calculado pela Int, sem campo novo).
- **FR-012**: O botão de encerrar a criação MUST ficar no painel e continuar só do Mestre; com pendências, MUST pedir confirmação listando-as.
- **FR-013**: Com a criação encerrada, o painel MUST sumir e os limites da etapa (4/3 e 6/4/2, 8/6/4) MUST deixar de valer.
- **FR-014**: Textos da interface MUST existir em inglês e português.

### Key Entities

- **Resumo da criação** (derivado, não guardado): por grupo de características e categoria de perícias — gasto, prioridade deduzida, limite; XP da criação (total, gasto, saldo); especialidades pendentes/excedentes; estado de cada etapa do checklist.
- **Exceção ao máximo**: fonte (raça, exaltação, feat/poder) e as notas que ela libera até 6.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O personagem de exemplo do livro reproduzido na ficha fecha exatamente 6/4/2, 8/6/4, 7 Backgrounds e 800 de XP com 50 de saldo.
- **SC-002**: 100% das mudanças além dos pontos ou limites na criação são recusadas para o jogador, e nenhuma é bloqueada para o Mestre que confirma.
- **SC-003**: Um jogador que nunca criou personagem na DtD consegue terminar a distribuição de pontos só pelo painel, sem consultar o livro.
- **SC-004**: Personagens já em jogo não têm nenhuma nota alterada pela feature.

## Assumptions

- As prioridades são deduzidas dos gastos em vez de escolhidas (sem campo novo); em empate, a ordem que cabe vale.
- Especialidades não têm cota na criação: a regra é uma por nota em 4+ (p. 23), valendo também para notas que chegaram a 4 pelo bônus da raça ou por XP; o exemplo do livro não mostra especialidades e isso é tratado como omissão.
- As fontes que dão pontos fora dos 6/4/2 e 8/6/4 (raça, Veteran o' the Wheel, Paragon Statuesque) já entram nas notas por efeito, então não são cobradas.
- Os custos de XP continuam os da feature 006 (fixos, conferidos com o exemplo).
- Idiomas continuam sem campo na ficha; o checklist só lembra a conta.
- O encerramento da criação continua sendo do Mestre (feature 007).

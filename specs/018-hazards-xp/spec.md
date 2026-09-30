# Feature Specification: Perigos e XP de encontro (DtD 7.7a)

**Feature Branch**: `018-hazards-xp`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Ferramenta do Mestre para queda, sufocamento e marcha forçada nos tokens selecionados, com
cartão e dano pelo Aplicar da 008; sufocamento e marcha resolvidos um intervalo por clique; diálogo de XP para o grupo
pela tabela de encontros (50–250) ou 500 por sessão, com bônus manual. Queda pela categoria escolhida pelo Mestre;
imunidades detectadas e ajustáveis no diálogo; desmaio por Fatigue só informado."

**Referência de regras**: DtD **7.7a** — queda p. 434; dano direto p. 436; Fatigue pp. 17, 443; sufocamento p. 444;
marcha forçada e viagem p. 445; XP por sessão p. 514; Encounter Difficulty p. 515; Catfall p. 181; Sand p. 207;
Promethean p. 87; Vampire pp. 91, 93; traits de NPC pp. 521–522; equipamento pp. 335–356. Constituição v1.2.1.

**Depende de**: 004 (exaltações), 005 (feats e assets), 006 (log de XP), 007 (equipamento), 008 (dano, críticos,
Fatigue, condições), 012 (traits de NPC).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Queda (Priority: P1)

O Mestre seleciona tokens, abre a **ferramenta de perigos** e escolhe **Queda**: curta (1 ferimento), longa (1d10
ferimentos) ou fatal (1d5 ferimentos e 1d5 de Critical Damage num local sorteado), e se a queda foi **intencional**. O
dano é de Impacto e fere direto (sem armadura nem Resilience). Numa queda intencional, cada personagem pode rolar
**Acrobatics TN 15**: o sucesso tira 1 ferimento e mais 1 por raise (nunca numa queda fatal). **Catfall** baixa a queda
um degrau (fatal → longa → curta → nada) e o personagem cai de pé. Um cartão por token mostra o dano e o botão Aplicar.

**Why this priority**: é o perigo mais comum em mesa e o que mais precisa do dano da 008.

**Independent Test**: queda longa em dois tokens: 1d10 rolado para cada um; aplicado, o HP cai exatamente o rolado,
ignorando armadura e Resilience; queda fatal soma 1d5 de Critical Damage num local sorteado mesmo com HP sobrando;
queda intencional com Acrobatics 2 raises tira 3 ferimentos.

**Acceptance Scenarios**:

1. **Given** tokens selecionados, **When** o Mestre aplica uma queda curta, **Then** cada um recebe um cartão de 1 ferimento de Impacto, aplicado sem armadura nem Resilience.
2. **Given** uma queda fatal, **When** aplicada, **Then** o personagem perde 1d5 HP e recebe 1d5 de Critical Damage num local sorteado, com o efeito crítico de Impacto.
3. **Given** uma queda intencional não fatal, **When** o dono rola Acrobatics TN 15 pelo cartão, **Then** o dano cai 1 mais 1 por raise (mínimo 0).
4. **Given** um personagem com Catfall, **When** cai, **Then** a categoria baixa um degrau e o cartão avisa que cai de pé.

---

### User Story 2 - XP de encontro (Priority: P2)

O Mestre abre o **diálogo de XP** e escolhe **Encontro** (Easy 50, Routine 70, Ordinary 100, Average 130,
Challenging 170, Hard 200, Very Hard 250) ou **Sessão** (500), marca os personagens (os do combate atual ou todos os
personagens com dono) e opcionalmente um **bônus** com motivo. Cada personagem recebe o valor inteiro no log de XP com o
motivo; o bônus entra como linha separada. Tudo pode ser desfeito pelo log (006).

**Why this priority**: tira do Mestre uma conta repetitiva ficha a ficha; independente dos perigos.

**Independent Test**: "Hard" para três personagens com bônus 20 "Plano engenhoso": cada log ganha 200 ("Encounter:
Hard") e 20 ("Plano engenhoso"); o XP disponível de cada um sobe 220.

**Acceptance Scenarios**:

1. **Given** o diálogo, **When** o Mestre escolhe uma dificuldade e personagens, **Then** cada um recebe o valor da tabela no log com o motivo.
2. **Given** Sessão, **When** confirmado, **Then** 500 para cada marcado.
3. **Given** um bônus, **When** confirmado, **Then** uma segunda linha com o valor e o motivo do bônus.
4. **Given** um jogador, **When** tenta abrir o diálogo, **Then** não há botão (só o Mestre).

---

### User Story 3 - Sufocamento e marcha forçada (Priority: P3)

**Sufocamento**: o Mestre escolhe se o personagem **poupa o ar** (intervalo de 1 minuto, fôlego de Constitution minutos)
ou está **em esforço** (intervalo de 1 rodada, fôlego de 2 × Constitution rodadas). Cada clique em "Próximo intervalo"
rola **Constitution TN 10** para cada personagem do cartão: falha dá **1 Fatigue**. Quando o fôlego acaba, o personagem
fica **Unconscious**; daí em diante cada intervalo tira **1 HP** até morrer. "Respirou" encerra o cartão. **Marcha
forçada**: cada clique em "Próxima hora" rola **Constitution TN 10, +5 por hora depois da primeira**; falha dá 1 Fatigue;
o cartão mostra a hora, o TN seguinte e a distância (dobro do normal, Speed km por hora × 2). Imunes (não respiram;
imunes a Fatigue) são detectados e ajustáveis no diálogo.

**Why this priority**: menos frequentes; usam a Fatigue da 008.

**Independent Test**: Con 3 em esforço: fôlego 6 rodadas; seis cliques com falhas dão Fatigue; no sétimo fica
Unconscious; no oitavo perde 1 HP. Marcha: horas 1, 2, 3 com TN 10, 15, 20.

**Acceptance Scenarios**:

1. **Given** sufocamento em esforço, **When** o Mestre clica em "Próximo intervalo", **Then** cada personagem rola Con TN 10, falha soma 1 Fatigue e o cartão conta os intervalos restantes de fôlego.
2. **Given** o fôlego esgotado, **When** o próximo intervalo passa, **Then** o personagem fica Unconscious; nos seguintes perde 1 HP por intervalo, e com 0 HP morre.
3. **Given** um Vampire, Promethean ou NPC Undead/Machine/Stuff of Nightmares, ou alguém com Rebreather/Void Suit equipado, **When** o diálogo abre, **Then** ele vem marcado como imune e não rola.
4. **Given** a marcha forçada, **When** o Mestre clica em "Próxima hora", **Then** o TN é 10 na primeira hora e sobe 5 a cada hora; falha soma 1 Fatigue; Promethean imune.
5. **Given** Fatigue acima do máximo, **When** acontece, **Then** o personagem fica Unconscious e o cartão diz por quantas horas (10 − Constitution); a Fatigue volta ao máximo.

---

### Edge Cases

- Tokens sem ator de personagem ou NPC (veículos, naves, esquadrões): ignorados com aviso.
- Queda com o personagem já com 0 HP: o dano segue as regras da 008 (Critical Damage pelos ferimentos além do HP).
- Sufocamento com o personagem já Unconscious por Fatigue: o fôlego continua contando; o HP começa a cair quando o fôlego acaba.
- Cartão de sufocamento ou marcha usado por um jogador: só o Mestre avança os intervalos.
- Fatigue com Sand: o máximo é Constitution + 2 (corrige o limite atual da 008, que usa só Constitution).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Um botão só do Mestre MUST abrir a ferramenta de perigos (queda, sufocamento, marcha forçada) para os tokens selecionados.
- **FR-002**: Queda MUST rolar por token: curta 1, longa 1d10, fatal 1d5 ferimentos + 1d5 Critical Damage num local sorteado; Impacto; sem armadura nem Resilience; cartão com Aplicar pelo dano da 008.
- **FR-003**: Queda intencional não fatal MUST oferecer Acrobatics TN 15 ao dono: sucesso reduz 1 + 1 por raise.
- **FR-004**: Catfall MUST baixar a queda um degrau e avisar que cai de pé.
- **FR-005**: Sufocamento MUST resolver um intervalo por clique (minuto poupando, rodada em esforço), com Con TN 10 (falha +1 Fatigue), fôlego de Con minutos ou 2 × Con rodadas, Unconscious ao esgotar e −1 HP por intervalo depois, morte com 0 HP.
- **FR-006**: Marcha forçada MUST resolver uma hora por clique, com Con TN 10 + 5 por hora depois da primeira (falha +1 Fatigue) e mostrar a distância percorrida.
- **FR-007**: Imunidades MUST ser detectadas (não respira: Vampire, Promethean, traits Undead/Machine/Stuff of Nightmares, Rebreather/Void Suit/Bionic Respiratory System equipados; imune a Fatigue: Promethean) e MUST poder ser ajustadas no diálogo.
- **FR-008**: Fatigue acima do máximo (Constitution, +2 com Sand) MUST deixar Unconscious, voltar ao máximo e informar as horas (10 − Constitution).
- **FR-009**: O diálogo de XP (só Mestre) MUST conceder o valor de Encounter Difficulty (50, 70, 100, 130, 170, 200, 250) ou Sessão (500) a cada personagem marcado, no log de XP com o motivo; bônus opcional em linha separada.
- **FR-010**: Textos da interface MUST existir em inglês e português.

### Key Entities

- **Cartão de queda**: por token, categoria, ferimentos, Critical Damage, local, intencional, redução.
- **Cartão de intervalo** (sufocamento/marcha): personagens, modo, intervalos passados, fôlego ou hora, TN seguinte, estado de cada um.
- **Entrada de XP**: já existe (006), tipo prêmio com motivo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma queda em N tokens é resolvida com um diálogo e um clique de Aplicar por token.
- **SC-002**: Um prêmio de XP para o grupo leva um diálogo, em vez de uma edição por ficha.
- **SC-003**: Cada intervalo de sufocamento ou marcha leva um clique, sem conta manual de TN ou fôlego.
- **SC-004**: O dano comum da 008 continua igual (os novos modos só valem para cartões de perigo).

## Assumptions

- Categoria da queda escolhida pelo Mestre (o livro não dá distâncias); efeitos de Grav Bomb e Ejector Seat ficam fora.
- Local de Critical Damage de quedas curtas e longas, quando o HP acaba: sorteado como no ataque.
- Acrobatics com a característica padrão (Dexterity); Catfall e Acrobatics se somam.
- Stuff of Nightmares imune só a sufocamento; demais "perigos do ambiente" ficam com o Mestre.
- Mudar entre poupar o ar e esforço = novo cartão; o TN da marcha recomeça numa nova marcha.
- XP inteiro para cada personagem (o livro não divide).

# Feature Specification: Backgrounds e Alinhamento (DtD 7.7a)

**Feature Branch**: `011-backgrounds-alignment`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Backgrounds (cap. XI) e Alinhamento (cap. XII) da DtD 7.7a: os 11 Backgrounds (0–5) na ficha com descrição por valor; criação com 7 pontos (máx. 3 sem XP), XP 50/100 só na criação; Artifact e Backing repetíveis com nome (Artifact máx. 5 na criação); Wealth ligado ao Wealth da 007; Inheritance aumenta os itens iniciais por raridade; Contacts rola Contacts + Cha/Fel; compêndio dos 21 deuses em 3 panteões arrastados para a ficha; Alignment Check (d10 + bônus ≥ Devotion; falha −1 Devotion; em 6 ou menos, segundo teste e Degeneration); tabela de Degeneration com efeitos simples aplicados e registrada por ponto de Devotion; recuperar Devotion cura; Devotion 0 = fora de jogo; troca de alinhamento uma vez; Devotion sem compra por XP (só pelo teste de recuperar ou pelo Mestre)."

**Referência de regras**: DtD **7.7a** — cap. XI "Backgrounds", pp. 280–283; cap. XII "Alignment", pp. 284–312
(Devotion e Alignment Check p. 284; Degeneration, recuperar e trocar pp. 285–286; tabela p. 286; deuses pp. 287–291;
páginas dos deuses pp. 292–312); criação pp. 15–16 (7 pontos, máx. 3, XP 50/100). Constituição v1.2.1.

**Depende de**: 001 (rolagem, Devotion na ficha), 005 (hindrance Night Terrors), 006 (XP e histórico, compra de
características), 007 (Wealth e itens iniciais por raridade), 008 (derangements).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar os deuses no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Deities** e encontra os 21 deuses em 3 pastas (Ruinous Powers, Blessed
Pantheon, Gray Council; 7 em cada, incluindo Chaos Undivided, Blessed Order e Unaligned). Cada deus mostra o panteão,
um resumo, os 3 mandamentos, as 5 palavras-chave, as 5 diretrizes (com o título do livro) e os 2 cultos. A tabela de
Degeneration (16 linhas) também pode ser consultada.

**Why this priority**: base do alinhamento na ficha e das regras de Devotion.

**Independent Test**: abrir Slaanesh (Ruinous Powers, p. 295; Excellence, Experience, Excess, Self-Indulgence, Pride;
cultos Noise Marines e The S Academy) e Sigmar.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Deities", **Then** há 21 deuses em 3 pastas, 7 em cada.
2. **Given** Slaanesh, **When** aberto, **Then** mostra os dados da Tabela de referência.
3. **Given** a tabela de Degeneration, **When** consultada, **Then** tem 16 linhas de 01 a 00 com o efeito de cada uma.
4. **Given** pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Backgrounds na criação (Priority: P2)

A ficha tem uma seção **Backgrounds** com os 11 Backgrounds (0–5) e a descrição do valor atual. Durante a criação o
jogador distribui **7 pontos** (nenhum acima de 3); pontos além disso ou acima de 3 custam XP (50 por ponto de 1 a 3,
100 por ponto de 4 a 5), só durante a criação e com o histórico da 006. **Artifact** e **Backing** podem ser tomados
várias vezes, cada um com um nome (o artefato ou a organização); Artifact soma no máximo 5 pontos na criação. **Wealth**
é o mesmo valor do Wealth usado na aquisição da 007. **Inheritance** dá escolhas de itens iniciais por raridade (ex.:
Inheritance 1 = 1 Uncommon ou 2 Common ou 4 Very Common ou 8 Ubiquitous; níveis acima dão um item mais raro ou duas
escolhas do nível anterior), somadas aos itens iniciais da 007. **Contacts** tem um botão de rolagem (Contacts +
Charisma ou Fellowship). Depois da criação, só o Mestre muda os Backgrounds.

**Why this priority**: os Backgrounds fazem parte da criação e alimentam Wealth e equipamento inicial.

**Independent Test**: personagem em criação coloca Contacts 3, Wealth 2 e Fame 2 (7 pontos, sem XP); tenta Fame 4 e
paga 100 XP pelo ponto 4; cria Artifact "Sword of Ages" 3 e é avisado dos pontos; Inheritance 1 com a escolha "2 Common"
aumenta as vagas de Common dos itens iniciais; rola Contacts com Fellowship.

**Acceptance Scenarios**:

1. **Given** criação ativa, **When** distribui 7 pontos em Backgrounds até 3, **Then** nenhum XP é gasto e a ficha mostra 7/7.
2. **Given** os 7 pontos usados, **When** sobe mais um ponto de 1 a 3, **Then** custa 50 XP; um ponto 4 ou 5 custa 100 XP, no histórico.
3. **Given** criação encerrada, **When** um jogador tenta mudar um Background, **Then** recusa (o Mestre pode).
4. **Given** dois Artifacts somando 6 pontos na criação, **When** salvo, **Then** recusa acima de 5 (override do Mestre).
5. **Given** Wealth 2 no Background, **When** faz um teste de aquisição da 007, **Then** usa Wealth 2.
6. **Given** Inheritance 1 com "2 Common", **When** escolhe itens iniciais, **Then** há 2 vagas de Common a mais.
7. **Given** Contacts 3, **When** clica em rolar, **Then** rola Contacts + a característica escolhida (Charisma ou Fellowship).
8. **Given** desfazer uma compra de Background no histórico, **When** confirmado, **Then** o valor e o XP voltam.

---

### User Story 3 - Alinhamento e Alignment Check (Priority: P3)

O jogador arrasta um deus do compêndio para a ficha e ele vira o **alinhamento** (um por personagem). A ficha mostra o
deus, o panteão, os mandamentos e a **Devotion** (começa em 6). O botão **Alignment Check** rola 1d10 + bônus (do
diálogo e de efeitos de feats/assets): igual ou acima da Devotion passa; abaixo, a Devotion cai 1 permanentemente e, se
a nova Devotion for 6 ou menos, um **segundo teste** contra a nova Devotion decide se há **Degeneration**. O botão
**Recuperar Devotion** (com o Mestre) rola o mesmo teste: passando, +1 Devotion; falhando, nada. Devotion 0 marca o
personagem como fora de jogo. **Trocar de alinhamento** é permitido uma vez: deus do mesmo panteão −2 Devotion (mínimo
1); de outro panteão, Devotion 4 e uma Degeneration no ponto 7.

**Why this priority**: é o uso do alinhamento em jogo; depende do compêndio (P1).

**Independent Test**: personagem com Sigmar e Devotion 6 falha o teste: Devotion 5, segundo teste falhado, Degeneration
rolada; recupera a Devotion 6 e a Degeneration do ponto 5 sai; troca para Pelor (mesmo panteão) e fica com 4.

**Acceptance Scenarios**:

1. **Given** um deus arrastado, **When** a ficha é aberta, **Then** mostra o alinhamento; um segundo deus pede para trocar.
2. **Given** Devotion 6 e 1d10 = 7, **When** faz o Alignment Check, **Then** passa, sem mudança.
3. **Given** Devotion 8 e 1d10 = 3, **When** falha, **Then** Devotion 7 e nenhum segundo teste.
4. **Given** Devotion 6 e falha, **When** a Devotion cai para 5, **Then** faz o segundo teste; passando, sem Degeneration; falhando, rola na tabela.
5. **Given** um bônus +2 no diálogo, **When** rola 1d10 = 4 contra Devotion 6, **Then** passa (4 + 2 ≥ 6).
6. **Given** Recuperar Devotion com 1d10 ≥ Devotion, **When** passa, **Then** Devotion +1; falhando, nada muda.
7. **Given** Devotion 1 e falha, **When** cai para 0, **Then** a ficha marca o personagem como fora de jogo.
8. **Given** trocar de Sigmar para Pelor com Devotion 6, **When** confirmado, **Then** Devotion 4; para Khorne, Devotion 4 e Degeneration no ponto 7; uma segunda troca é recusada (override do Mestre).

---

### User Story 4 - Degeneration (Priority: P4)

A Degeneration é rolada em 1d100 na tabela e **registrada no ponto de Devotion** em que aconteceu (ex.: "5: Palsy").
Resultados repetidos são rolados de novo. Os efeitos simples são aplicados: **−1 numa característica** (Palsy, Dark-
Hearted, Morbid, Wasted Frame, Poor Health, Malign Sight, Distrustful, Fell Obsession, Mood Swings), que **impede
comprar essa característica com XP** enquanto durar; **Night Terrors** (hindrance da 005, sem XP; já tendo, rola de
novo); **derangement menor** (Blighted Mind, na lista da 008); **−2k0 nos testes sociais** (Skin Affliction). Os demais
(Ill-fortuned, Witch-mark, Ashen Taste, Blackouts) ficam como texto. Ao **recuperar** o ponto de Devotion seguinte, a
Degeneration registrada no ponto abaixo é curada e seus efeitos saem.

**Why this priority**: completa o capítulo; depende do Alignment Check (P3).

**Independent Test**: Degeneration forçada em 01 (Palsy) no ponto 5: Dexterity −1 e compra de Dexterity recusada;
recuperar para 6 remove a Palsy e libera a compra.

**Acceptance Scenarios**:

1. **Given** Degeneration 05 no ponto 5, **When** aplicada, **Then** Palsy: Dexterity −1 (efeito), registrada em 5.
2. **Given** Palsy ativa, **When** tenta comprar Dexterity com XP, **Then** recusa (override do Mestre).
3. **Given** rolar Palsy de novo, **When** já existe, **Then** rola outra vez até sair outra.
4. **Given** Horrific Nightmare, **When** aplicada, **Then** o personagem ganha Night Terrors sem XP; se já tem, rola de novo.
5. **Given** Blighted Mind, **When** aplicada, **Then** um derangement menor entra na lista.
6. **Given** Skin Affliction, **When** faz um teste de perícia social, **Then** −2k0.
7. **Given** Devotion recuperada de 5 para 6, **When** a Degeneration estava no ponto 5, **Then** ela e seus efeitos saem.

---

### Edge Cases

- **Faixas sobrepostas** na tabela (Malign Sight 59–62 e Ashen Taste 62–69): 62 fica com Malign Sight.
- **Acererak / Acerath**: nome da página do deus (Acerath), com a outra grafia como nota.
- **Unaligned**: na Gray Council (ordem das páginas; o livro não diz).
- **Dado do Alignment Check**: d10 (o livro diz "um dado"); Devotion máxima 10 (limite atual da ficha).
- **Artifact 4–5 na criação**: o teto de 3 sem XP vale por instância; acima de 3 paga XP.
- **Sem alinhamento**: os botões de teste funcionam; a troca não se aplica.
- **Personagem fora de jogo** (Devotion 0): a ficha avisa; o Mestre pode ajustar.
- **Usuário sem permissão**: vê Backgrounds e alinhamento só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndio**

- **FR-001**: Tipo de item **Deus** com panteão, resumo, mandamentos, palavras-chave, título e diretrizes, cultos (nome e resumo) e página.
- **FR-002**: Compêndio "Deities" com os 21 deuses da Tabela de referência em 3 pastas; texto próprio em inglês (constituição V).
- **FR-003**: Tabela **Degeneration** (16 linhas, 1d100) como conteúdo, com a automação dos efeitos simples.
- **FR-004**: Os 11 Backgrounds com descrição própria por valor (onde o livro dá) como dados do sistema.

**Backgrounds**

- **FR-005**: O personagem MUST ter os 11 Backgrounds (0–5); Artifact e Backing como listas de instâncias com nome e valor.
- **FR-006**: Na criação: 7 pontos grátis, máximo 3 por Background sem XP; pontos além disso 50 XP (1–3) ou 100 XP (4–5), histórico e desfazer da 006; Artifact no máximo 5 pontos no total; recusas com override do Mestre.
- **FR-007**: Fora da criação, só o Mestre altera Backgrounds (sem XP).
- **FR-008**: Wealth do Background MUST ser o Wealth da aquisição da 007.
- **FR-009**: Inheritance MUST somar vagas de itens iniciais por raridade conforme a escolha do nível.
- **FR-010**: Contacts MUST ter a rolagem Contacts + Charisma ou Fellowship.

**Alinhamento**

- **FR-011**: Arrastar um deus MUST definir o alinhamento (um por personagem); trocar segue FR-015.
- **FR-012**: Alignment Check MUST rolar 1d10 + bônus (diálogo e efeitos) contra a Devotion; falha −1 Devotion; se a nova Devotion ≤ 6, segundo teste contra ela; falhando, Degeneration.
- **FR-013**: Recuperar Devotion MUST rolar o mesmo teste: passando +1 (até 10); curar a Degeneration do ponto abaixo.
- **FR-014**: Devotion 0 MUST marcar o personagem como fora de jogo.
- **FR-015**: Troca de alinhamento uma vez: mesmo panteão −2 Devotion (mín. 1); outro panteão Devotion 4 e Degeneration no ponto 7; segunda troca recusada com override do Mestre.
- **FR-016**: Devotion MUST NOT ser comprada com XP.

**Degeneration**

- **FR-017**: Rolar 1d100 na tabela, rerrolar repetidos, registrar no ponto de Devotion.
- **FR-018**: Aplicar os efeitos simples (característica −1, Night Terrors, derangement menor, −2k0 social) e remover ao curar; característica reduzida MUST bloquear a compra dela por XP.

**Geral**

- **FR-019**: Textos de interface en e pt-BR; só o dono (e o Mestre) rola e altera; resultados no chat.

### Tabela de referência

| Panteão | Deuses (7) |
|---|---|
| Ruinous Powers | Chaos Undivided, Khorne, Nurgle, Slaanesh, Tzeentch, Malal, Tiamat |
| Blessed Pantheon | Blessed Order, Cuthbert, Sigmar, Bahamut, Moradin, Pelor, Omnissiah |
| Gray Council | Unaligned, Raven Queen, Vectron, Corellon, Luna, Acerath, Lolth |

Backgrounds: Allies, Artifact (repetível), Backing (repetível), Contacts, Fame, Followers, Holdings, Inheritance, Mentor,
Status, Wealth. Degeneration: 01–07 Palsy (Dex −1), 08–11 Dark-Hearted (Fel −1), 12–21 Ill-fortuned, 22–28 Skin
Affliction (−2k0 social), 29–32 Morbid (Int −1), 33–41 Witch-mark, 42–45 Wasted Frame (Str −1), 46–54 Horrific Nightmare
(Night Terrors), 55–58 Poor Health (Con −1), 59–62 Malign Sight (Wis −1), 62–69 Ashen Taste, 70–76 Blackouts, 77–80
Distrustful (Cha −1), 81–85 Fell Obsession (Wil −1), 86–90 Mood Swings (Cmp −1), 91–00 Blighted Mind (derangement menor).

### Key Entities *(include if feature involves data)*

- **Deus**: dados do livro; no personagem, o alinhamento.
- **Background**: valor 0–5 por Background; instâncias nomeadas de Artifact e Backing; escolha de Inheritance.
- **Alinhamento do personagem**: deus, trocas feitas, fora de jogo.
- **Degeneration registrada**: ponto de Devotion, resultado, efeitos criados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 21 deuses e das 16 linhas batem com o inventário (panteão, palavras-chave, faixas).
- **SC-002**: Em 100% dos cenários da US3 e US4, a Devotion e a Degeneration seguem as regras das pp. 284–286.
- **SC-003**: Fazer um Alignment Check leva no máximo 2 interações.
- **SC-004**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Devotion por XP**: não há compra (o livro não dá custo); só o teste de recuperar e o Mestre.
- **Custo de Background por ponto**: 50 XP cada ponto de 1 a 3, 100 XP cada ponto de 4 a 5 (o livro não diz "por ponto").
- **Pontos de criação**: os 7 pontos valem enquanto a criação estiver ativa (o modo da 007).
- **Bônus do Alignment Check**: feats e assets que dão bônus (Pure Faith, Virgil's Guidance etc.) somam por efeito ou no diálogo; a vantagem Devotion da 010 fica como texto.
- **Degenerations em texto**: Ill-fortuned, Witch-mark, Ashen Taste e Blackouts.
- **Marks e outros efeitos de alinhamento** (feats Mark of X, Chosen, magias Atonement/Divine Power, nota de Khorne): fora do escopo, como hoje.

# Feature Specification: Magia (DtD 7.7a)

**Feature Branch**: `009-magic`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Magia da DtD 7.7a (cap. VIII): compêndio com as 9 Magic Schools e as 126 magias; escolas como pontos no personagem (teto = Level) compradas com XP pelas listas da classe (sistema da 006), cada ponto liberando uma magia do nível ou abaixo; Focus Power pela ficha com TN, keywords, Fettered/Unfettered/Push; dano de magia com o Aplicar da 008 (Aura); efeitos simples como condições/modificadores; Psychic Phenomena e Perils of the Warp rolados e aplicados; magias sustentadas (Concentration) com o custo por rodada; Spell Combos e Implements."

**Referência de regras**: DtD **7.7a** — cap. VIII "Magic", pp. 224–259 (força da conjuração pp. 226–227; escolas,
keywords e duração pp. 227–229; combos pp. 229–230; Psychic Phenomena p. 231; Perils of the Warp p. 232; magias
pp. 233–259); custos de XP p. 16 e p. 514; ação Focus Power p. 426; Aura contra dano de magia pp. 431–436; feat Tested
p. 196; Implement p. 335. Constituição v1.2.1.

**Depende de**: 001 (rolagem), 005 (feats: Tested, Spell Book, Improvisational Magic), 006 (classes com Magic Schools,
XP e histórico), 007 (gear Implement), 008 (Aplicar dano com Aura, condições, turno, ação Focus Power).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar as magias no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Spells** e encontra as 126 magias em 9 pastas (uma por escola, 14 magias
de nível 1 a 5 cada). Cada magia mostra escola, nível, teste (escola + característica), TN, ação, keywords, alcance,
alvo/área, duração, dano, efeito e o que cada raise faz. As 9 escolas e as 13 keywords têm descrição consultável.

**Why this priority**: base das escolas, do aprendizado e da conjuração.

**Independent Test**: abrir o compêndio e conferir Magic Missile (Evocation 1, TN 15, Half Action, Attack, Combo-OK,
Somatic, Instant, 30 m, 2k1 E, uma cópia extra por raise até o Level) e Armoring Aura.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Spells", **Then** há 126 magias em 9 pastas, 14 por escola, 3/3/3/3/2 por nível.
2. **Given** Magic Missile, **When** aberta, **Then** mostra os dados da Tabela de referência.
3. **Given** uma keyword na ficha da magia, **When** o usuário passa o mouse, **Then** vê a regra dela.
4. **Given** pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Escolas e magias aprendidas (Priority: P2)

O personagem tem as 9 Magic Schools como pontos (0 a Level). No modo Evolução da 006, a escola mostra o custo do
próximo ponto (nova 200; melhorar 100 × valor atual) e só pode ser comprada se estiver na lista de Magic Schools da
classe atual (Free Study: das classes concluídas; fora das listas o Mestre pode incluir sem custo). Cada ponto novo
libera **uma magia daquela escola com nível até o novo valor**: o jogador arrasta a magia do compêndio para a ficha e o
sistema confere a vaga (o Mestre pode permitir extras, como Spell Book). Desfazer a compra devolve o XP e tira a vaga.

**Why this priority**: sem escola e magia aprendida não há conjuração (P3).

**Independent Test**: personagem Level 2 na classe Apprentice (lista com Evocation) compra Evocation 1 (200 XP) e
aprende Magic Missile; tenta aprender uma segunda magia de Evocation e é recusado; compra Evocation 2 (100 XP) e
aprende uma magia de nível 2; tenta Evocation 3 e é recusado pelo Level.

**Acceptance Scenarios**:

1. **Given** Level 2, classe atual com Evocation na lista, **When** compra Evocation 0 → 1, **Then** custa 200 XP e fica no histórico.
2. **Given** Evocation 1, **When** compra 1 → 2, **Then** custa 100 XP; 2 → 3 recusado (teto = Level 2).
3. **Given** uma escola fora da lista da classe, **When** tenta comprar, **Then** recusa (Mestre inclui sem custo).
4. **Given** Evocation 1 e nenhuma magia aprendida, **When** arrasta Magic Missile, **Then** aprende; uma segunda magia de Evocation é recusada (vagas 1/1).
5. **Given** Evocation 2, **When** arrasta uma magia de nível 3, **Then** recusa (nível acima do valor).
6. **Given** desfazer a compra de Evocation 2, **When** confirmado, **Then** o valor volta a 1, o XP é devolvido e a ficha avisa se sobra magia além das vagas.

---

### User Story 3 - Conjurar (Priority: P3)

Clicar numa magia aprendida abre o **Focus Power**: rolagem de (escola + característica) k característica contra o TN
da magia, escolhendo a força: **Fettered** (dados rolados pela metade, nunca Phenomena), **Unfettered** (Phenomena só
se um dado explodido for mantido; sem o feat Tested soma +5 × nível da magia) ou **Push** +1 a +3 (Tested) / +1 a +4
(sem Tested) na escola, sempre com Phenomena (+5 ou +10 por ponto). As keywords são conferidas (Somatic bloqueada se
agarrado/contido; Social recusada em combate; Focus/Material pedem o item) e os raises aparecem com o efeito "por
raise" da magia. O cartão mostra sucesso, raises, efeito e, quando há, o **dano** (com o Aplicar da 008 usando a Aura
do alvo) e o **teste de resistência** (Saving Throw: o alvo testa contra o resultado do conjurador). Magias com efeito
simples aplicam condições ou modificadores (ex.: Armoring Aura dá Aura 1 + 1 por raise). Quando há Phenomena, o
sistema rola 1d100 + modificadores na tabela e, com 75+, os Perils of the Warp, aplicando os efeitos simples.

**Why this priority**: é o uso principal da magia; depende das escolas (P2).

**Independent Test**: Charisma 3, Evocation 2: Magic Missile Unfettered = 5k3 contra TN 15; Fettered = 3k3 (metade
dos 5 rolados, arredondando para cima); Push +2 sem Tested = 7k3 e Phenomena com +20; dano 2k1 E aplicado ao alvo com
Aura 2.

**Acceptance Scenarios**:

1. **Given** Evocation 2, Charisma 3, **When** conjura Magic Missile Unfettered, **Then** 5k3 contra TN 15; o cartão mostra os raises e as cópias extras (até o Level).
2. **Given** Fettered, **When** conjura, **Then** dados rolados pela metade (arredondando para cima, kept não passa dos rolados) e nenhum Phenomena.
3. **Given** Unfettered e um dado mantido que explodiu, **When** resolvido, **Then** rola Phenomena (sem Tested: +5 × nível da magia).
4. **Given** Push +2 sem Tested, **When** conjura, **Then** escola conta +2 e Phenomena com +20; com Tested, +10; Push acima do máximo recusado.
5. **Given** Phenomena com total 75 ou mais, **When** resolvido, **Then** rola Perils of the Warp; efeitos simples (condições, Insanity, dano) aplicados; os demais como texto.
6. **Given** uma magia com dano, **When** acerta, **Then** o cartão de dano sai com `magia` e o Aplicar da 008 usa a Aura do alvo.
7. **Given** Saving Throw, **When** o cartão é exibido, **Then** o dono do alvo tem o botão de resistir (Arcana + característica contra o resultado do conjurador).
8. **Given** o conjurador agarrado, **When** conjura magia Somatic, **Then** recusa; magia Social em combate, recusa.
9. **Given** o sistema de turno da 008 em combate, **When** conjura, **Then** a ação da magia (meia, completa, reação) é gasta.
10. **Given** Armoring Aura com 2 raises no alvo, **When** aplicada, **Then** o alvo ganha Aura 3 pela duração (uma cena).

---

### User Story 4 - Sustentadas, combos e implements (Priority: P4)

Magias de **Concentration** ficam como "sustentadas" na ficha; a cada turno do conjurador em combate o sistema cobra a
ação de concentração (meia ou reação) e avisa; encerrar remove os efeitos que ela criou. Durações em rodadas/minutos
viram efeitos com fim. **Spell Combos**: o personagem aprende uma combinação de magias Combo-OK conhecidas pagando
50 XP × soma dos níveis (fora da criação); conjurar o combo usa a menor escola e a menor característica, TN = maior TN
+ 5 por magia extra, nunca Fettered, Phenomena +5 por magia. **Implements**: com um Implement equipado, os feats e
bônus que dependem dele valem (Implement Focus: rerrolar um dado; bônus de classe "−1 TN com Implement").

**Why this priority**: completa o capítulo sobre a base da conjuração.

**Independent Test**: sustentar Scry (Concentration Half) e ver a meia ação cobrada no turno; aprender o combo Magic
Missile + outra Combo-OK de Evocation e conferir o custo e o TN; equipar Implement e ver o reroll oferecido.

**Acceptance Scenarios**:

1. **Given** Scry sustentada, **When** começa o turno do conjurador, **Then** a meia ação é gasta e o cartão lembra; sem ação livre, a magia termina.
2. **Given** encerrar uma sustentada, **When** confirmado, **Then** os efeitos dela saem.
3. **Given** duas magias Combo-OK conhecidas de níveis 1 e 2, **When** aprende o combo, **Then** custa 150 XP (recusa durante a criação).
4. **Given** o combo, **When** conjurado, **Then** menor escola e característica; TN = maior TN + 5; Fettered indisponível; Phenomena +10.
5. **Given** Implement equipado e o feat Implement Focus, **When** conjura, **Then** o diálogo oferece rerrolar um dado.

---

### Edge Cases

- **Caster level** (não definido no livro): o Level do personagem, ajustável por efeito (drogas Null −1, Spook +1).
- **TN "—"**: sem TN mínimo; **"Special"** (Detect Thoughts): Mental Defense do alvo.
- **Magia de nível acima da escola** (Improvisational Magic): pagar 1 Hero Point permite conjurar magia não aprendida de nível abaixo da maior escola.
- **Totais de tabela acima de 100**: usa a última linha.
- **Efeitos que não acumulam**: vale o maior (efeitos da mesma magia substituem o anterior).
- **Magia com dano escalando por Level** (Energy Burst +2 rolados por Level etc.): calculada com o caster level.
- **Push acima de 6 na escola**: permitido pelo livro.
- **Sem Implement**: a magia funciona; só os bônus condicionados somem.
- **Usuário sem permissão**: vê escolas e magias só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndio**

- **FR-001**: Tipo de item **Magia** com escola, nível (1–5), teste (característica da escola), TN (número, "—" ou "Special"), ação, keywords, alcance, alvo/área, duração (tipo e valor; Concentration com a ação), dano (XkY, tipo, escala por Level), resistência (característica), efeito, efeito por raise e automação.
- **FR-002**: Compêndio "Spells" com as 126 magias da Tabela de referência em 9 pastas; texto próprio em inglês (constituição V).
- **FR-003**: Tabelas **Psychic Phenomena** (26 linhas) e **Perils of the Warp** (18 linhas) como conteúdo com automação dos efeitos simples.
- **FR-004**: Ficha da magia com keywords e escola com descrição; compêndio bloqueado só leitura.

**Escolas e aprendizado**

- **FR-005**: O personagem MUST ter as 9 escolas (0 a Level; o livro limita ao Level).
- **FR-006**: Compra de escola no modo Evolução: 0 → 1 200 XP; depois 100 × valor atual; só se a escola estiver na lista de Magic Schools da classe atual (Free Study: classes concluídas); recusas com override do Mestre sem custo; histórico e desfazer da 006.
- **FR-007**: Cada ponto de escola MUST dar uma vaga de magia daquela escola; aprender (arrastar) exige vaga livre e nível ≤ valor da escola; o Mestre pode permitir extras.

**Conjuração**

- **FR-008**: Focus Power MUST rolar (escola + característica) k característica contra o TN, com a força escolhida (Fettered, Unfettered, Push) e os modificadores do diálogo; efeitos de caster level com o Level (± modificadores).
- **FR-009**: Phenomena MUST ser rolados conforme a força (Unfettered com dado explodido mantido; Push sempre) com os modificadores (+5 × nível sem Tested no Unfettered; +5/+10 por ponto de Push; +5 por magia no combo); 75+ → Perils; efeitos simples aplicados.
- **FR-010**: Keywords MUST ser conferidas (Somatic: não agarrado/contido; Social: fora de combate; Focus/Material: aviso do item; Verbal: aviso) com override do Mestre; Saving Throw MUST oferecer ao alvo o teste de resistência contra o resultado.
- **FR-011**: Magias com dano MUST gerar o cartão de dano com `magic` para o Aplicar da 008; magias de ataque à distância por toque (Ranged Touch) pedem o ataque de Ballistics.
- **FR-012**: Efeitos simples das magias (Aura, modificadores, condições) MUST ser aplicados como Active Effects com a duração da magia no alvo ou no conjurador.
- **FR-013**: Em combate, conjurar MUST gastar a ação da magia pelo turno da 008.

**Sustentadas, combos, implements**

- **FR-014**: Magias Concentration MUST ficar como sustentadas e cobrar a ação a cada turno do conjurador em combate; encerrar remove os efeitos.
- **FR-015**: Spell Combos: aprender (50 XP × soma dos níveis, histórico da 006, fora da criação) e conjurar com as regras do livro.
- **FR-016**: Implement equipado MUST habilitar Implement Focus (rerrolar um dado) e os bônus de classe que o exigem.

**Geral**

- **FR-017**: Textos de interface en e pt-BR; só o dono (e o Mestre) aprende, compra e conjura.

### Tabela de referência

| Escola | Característica | Magias |
|---|---|---|
| Abjuration, Conjuration | Willpower | 14 cada |
| Divination, Healing, Transmutation | Wisdom | 14 cada |
| Enchantment, Evocation | Charisma | 14 cada |
| Illusion, Necromancy | Intelligence | 14 cada |

Por escola: 3 de nível 1, 3 de nível 2, 3 de nível 3, 3 de nível 4, 2 de nível 5. Psychic Phenomena 26 linhas (75+ →
Perils); Perils of the Warp 18 linhas (00 = Destruction). 13 keywords.

### Key Entities *(include if feature involves data)*

- **Magia**: dados do livro e automação; no personagem, aprendida (escola, vaga).
- **Escola no personagem**: valor 0–Level.
- **Magia sustentada**: magia, alvo, ação por rodada, efeitos criados.
- **Spell Combo**: nome e magias.
- **Resultado de conjuração**: teste, força, raises, Phenomena/Perils, dano, efeitos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 126 magias batem com o inventário (escola, nível, TN, ação, keywords, duração, dano).
- **SC-002**: Em 100% dos cenários da US3, parada, TN e gatilho de Phenomena seguem a regra da força escolhida.
- **SC-003**: Conjurar uma magia aprendida leva no máximo 2 interações.
- **SC-004**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Caster level** = Level do personagem (o livro não define), com `modifiers.magic.casterLevel`.
- **Push**: cada ponto de Push = +1 na escola e +5 (Tested) ou +10 (sem Tested) na rolagem de Phenomena; o +5 × nível do Unfettered sem Tested não se soma ao Push (o livro não diz).
- **Fettered**: metade dos dados rolados arredondando para cima; kept limitado aos rolados.
- **Sanctioned** = feat Tested.
- **TNs suspeitos** (Energy Bits 5, Geas 20, Energy Aura 15) ficam como impressos, com nota.
- **Spell Book / feats de magia**: Spell Book e Improvisational Magic entram; Spell Focus, Penetration, Might, Mastery e Parry ficam como texto nesta feature.
- **Magias de efeito complexo** (ilusões, invocações, teleporte etc.): texto no cartão.

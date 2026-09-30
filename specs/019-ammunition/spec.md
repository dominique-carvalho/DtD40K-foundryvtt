# Feature Specification: Controle de munição (DtD 7.7a)

**Feature Branch**: `019-ammunition`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Cada arma guarda os tiros no pente e os pentes de reserva; recarregar gasta um pente;
sem tiros o ataque é recusado (Mestre libera); Reload gasta meia ou ação completa e, para 2+ Full, o progresso fica na
arma entre turnos. Progresso perdido se o personagem fizer outra ação; pente trocado descarta a sobra; rajada com menos
tiros que o ROF dispara com o que tem; NPCs também; lançadores gastam o item; emperrar trava a arma até o Clear Jam."

**Referência de regras**: DtD 7.7a — Clip e Reload p. 318; Overheats p. 320; ações longas p. 424; Full Auto Burst pp.
426–427; Multiple Attacks p. 428; Reload p. 429; Suppressing Fire e Overwatch pp. 429–430; Jam e Clear Jam p. 435;
munição e reabastecimento pp. 317, 334. Constituição v1.2.1.

**Depende de**: 007 (armas, ataque, lançadores, qualidades), 008 (turno, ações), 012 (NPCs), 015 (armas montadas), 017
(Suppressing Fire, Overwatch).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tiros e pentes (Priority: P1)

Cada arma de pente (Clip maior que 0) mostra na ficha os **tiros no pente** e os **pentes de reserva**. Um tiro simples
gasta 1; uma rajada (Full Auto Burst) gasta o ROF automático; Suppressing Fire gasta o ROF ao confirmar a zona e o
Overwatch ao disparar; cada tiro de Multiple Attacks gasta o seu. Sem tiros, o ataque é **recusado** com aviso (o Mestre
pode permitir); com menos tiros que o ROF, a rajada sai com os que restam e o ROF efetivo cai para eles. Lançadores
gastam 1 unidade do item de munição (granada, míssil) por disparo.

**Why this priority**: sem gasto a contagem não tem sentido; é o que aparece em todo combate.

**Independent Test**: Autogun (Clip 30, ROF 10) com o pente cheio: tiro simples → 29; rajada → 19; mais duas rajadas →
0 (a segunda com 9 tiros, ROF efetivo 9); próximo ataque recusado. Lança-granadas: um disparo tira 1 granada do
inventário.

**Acceptance Scenarios**:

1. **Given** uma arma com pente, **When** o jogador ataca em tiro simples, **Then** o pente perde 1 tiro e o cartão mostra os restantes.
2. **Given** uma rajada, **When** disparada, **Then** o pente perde o ROF automático (ou o que restar, com ROF efetivo igual).
3. **Given** o pente vazio, **When** o jogador ataca, **Then** o ataque é recusado com aviso; o Mestre pode permitir.
4. **Given** Suppressing Fire ou Overwatch, **When** a zona é confirmada ou o Overwatch dispara, **Then** o pente perde o ROF automático (ou o que restar).
5. **Given** um lançador, **When** dispara, **Then** o item de munição escolhido perde 1 unidade; com 0, some da lista.

---

### User Story 2 - Recarga (Priority: P2)

A ação **Reload** usa o tempo da arma: **Half** (meia ação), **Full** (ação completa) ou **N Full** (N ações completas).
Para N Full, cada Reload guarda o progresso na arma; na última, o pente enche. **Qualquer outra ação** (exceto livres e
reações) zera o progresso. Recarregar gasta **1 pente de reserva**; o pente antigo é descartado (a sobra se perde); sem
reserva, não recarrega. Os pentes de reserva são editados na ficha (compra e reabastecimento pelo Mestre ou jogador,
como o livro deixa à mesa).

**Why this priority**: fecha o ciclo do tiro; depende da contagem.

**Independent Test**: Plasma Gun (8 Full) com 2 pentes de reserva: 8 Reloads em turnos seguidos enchem na oitava e sobra
1 pente; começar de novo, fazer 3 Reloads e um Standard Attack zera o progresso.

**Acceptance Scenarios**:

1. **Given** uma arma de Reload Full e 1 pente de reserva, **When** o jogador usa Reload, **Then** gasta uma ação completa, o pente enche e a reserva vai a 0.
2. **Given** uma arma de 2 Full, **When** o jogador usa Reload duas vezes (em turnos seguidos), **Then** o pente só enche na segunda e o cartão mostra o progresso 1/2.
3. **Given** progresso 1/2, **When** o personagem faz outra ação que não seja livre ou reação, **Then** o progresso volta a 0.
4. **Given** reserva 0, **When** tenta recarregar, **Then** é recusado com aviso.
5. **Given** uma arma com Reload Half ou Free, **When** recarrega, **Then** gasta meia ação (Free: ação livre) e enche.

---

### User Story 3 - Emperrar e superaquecer (Priority: P3)

Quando o ataque **emperra**, a arma fica **travada** (não ataca) até o **Clear Jam** (Tech-Use ou Ballistics TN 15, ação
completa): o sucesso destrava e **esvazia o pente** (é preciso recarregar). Uma arma com **Overheats** que emperra também
fica vazia. A ficha mostra a arma travada.

**Why this priority**: completa as regras do livro; hoje o emperrar é só um aviso.

**Independent Test**: ataque emperra → arma travada, ataque seguinte recusado; Clear Jam com sucesso → destravada com 0
tiros; recarrega e volta a atacar.

**Acceptance Scenarios**:

1. **Given** um ataque que emperra, **When** resolvido, **Then** a arma fica travada e o próximo ataque é recusado (Mestre libera).
2. **Given** Clear Jam com sucesso, **When** rolado, **Then** a arma destrava com o pente vazio.
3. **Given** uma arma com Overheats que emperra, **When** resolvido, **Then** o pente fica vazio.

---

### Edge Cases

- Armas sem pente (corpo a corpo, arremessáveis, Clip 0 — NPCs "Clip -", armas de veículo e de nave): não contam tiros.
- Armas existentes: começam com o pente cheio e 2 pentes de reserva (premissa, editável).
- Pente com tamanho mudado (Extended Clip, Low Ammo, Las na montagem da 015): o máximo acompanha o Clip da arma; tiros acima do novo máximo são cortados.
- Arma trocada de ator ou desequipada: os tiros e a reserva ficam com a arma.
- Fim do combate: o progresso de recarga zera; tiros e reserva ficam.
- Twin-Linked não dobra o gasto (7.7a).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Armas com Clip > 0 MUST guardar os tiros no pente (inicial: cheio), os pentes de reserva (inicial: 2) e o progresso de recarga; a ficha MUST mostrar e permitir editar tiros e reserva.
- **FR-002**: O ataque MUST gastar 1 tiro no tiro simples, o ROF automático na rajada e 1 por tiro de Multiple Attacks; Suppressing Fire ao confirmar a zona e Overwatch ao disparar gastam o ROF automático.
- **FR-003**: Sem tiros, o ataque MUST ser recusado com aviso (Mestre libera); com menos tiros que o ROF, a rajada MUST sair com os restantes e o ROF efetivo MUST ser o número de tiros.
- **FR-004**: Lançadores MUST gastar 1 unidade do item de munição por disparo.
- **FR-005**: Reload MUST usar o tempo da arma (Free, Half, Full, N Full; grafias "2Full"/"2 Full"; "-" = sem recarga); N Full guarda o progresso e enche na última ação.
- **FR-006**: Qualquer ação que não seja livre ou reação MUST zerar o progresso de recarga das armas do personagem (exceto o próprio Reload daquela arma).
- **FR-007**: Recarregar MUST gastar 1 pente de reserva e encher o pente (sobra descartada); sem reserva, MUST ser recusado.
- **FR-008**: Um ataque que emperra MUST travar a arma; o Clear Jam com sucesso MUST destravar e esvaziar o pente; Overheats que emperra MUST esvaziar o pente.
- **FR-009**: NPCs com armas de pente MUST seguir as mesmas regras.
- **FR-010**: Textos da interface MUST existir em inglês e português.

### Key Entities

- **Estado de munição da arma**: tiros no pente, pentes de reserva, progresso de recarga, travada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um combate inteiro com armas de pente não exige contagem de tiros à mão.
- **SC-002**: Nenhum ataque com pente vazio passa sem aviso (o Mestre sempre decide).
- **SC-003**: Recargas longas terminam com o número de ações do livro, em qualquer número de turnos, se nada interromper.
- **SC-004**: Armas sem pente e armas de veículo/nave continuam iguais.

## Assumptions

- O livro não dá preço de munição: pentes de reserva são editados na ficha; armas existentes começam com o pente cheio e 2 de reserva.
- Um pente de reserva é por arma (não compartilhado entre armas do mesmo tipo).
- Reduções de tempo de recarga por raça (Thri-Kreen Multi-Armed) e efeitos de recarga grátis (Reloading Kata, Mithril, Gun Blessing, Wraithbone, Jumping Dove) ficam como nota; os mods da 015 já mudam o Reload da arma.
- Fan the Hammer limitado pelos tiros no pente.

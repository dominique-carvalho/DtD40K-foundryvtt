# Feature Specification: Ações de combate (DtD 7.7a)

**Feature Branch**: `017-combat-actions`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Automatizar Suppressing Fire com Pinning, Overwatch, Grapple completo, Delay e Tactical
Advance no turno da 008. Zona de 45° como template no mapa; teste de Pinning pelo cartão e condição Pinned, com a saída no
fim do turno. Suppressing Fire pelo texto da ação (Pinning na hora, rajada no início do próximo turno do atirador contra
os descobertos). Testes opostos pelo maior total, um raise a cada 5, servindo Grapple, Bull Rush, Knock Down, Disarm e
Feint. Condição 'Em cobertura' com o AP da cobertura. Munição fora do escopo."

**Referência de regras**: DtD **7.7a** — cap. XV "Combat": Delay p. 426, Grapple p. 427, Overwatch p. 429, Suppressing
Fire e Tactical Advance p. 430, cobertura p. 433, Pinning pp. 443–444; feats Fearless p. 185, Headstrong p. 187, Bear Hug
p. 181, Crushing Bear p. 182, Mobbing Up p. 204, Squat Stability p. 204, Mark of Moradin p. 213. Constituição v1.2.1.

**Depende de**: 001 (rolagem), 005 (feats), 007 (armas, ROF, ataque), 008 (turno, ações, condições, dano e cobertura),
012 (NPCs e testes pelo cartão).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Suppressing Fire e Pinning (Priority: P1)

Com uma arma que dispara em automático, o personagem escolhe **Suppressing Fire** (ação completa) e coloca um **cone de
45°** a partir do seu token. Todos os tokens dentro do cone recebem um cartão de **teste de Pinning** (Willpower TN 20);
quem falha fica **Pinned**. No início do próximo turno do atirador, o sistema rola **um Full Auto Burst** e acerta cada
alvo ainda dentro do cone, **sem a condição Em cobertura**, cuja Static Defense fica abaixo do total — no máximo tantos
alvos quanto o ROF automático, sem dano extra por raise. O cone some ao fim da rajada.

**Why this priority**: é a ação de área mais usada e a que dá sentido ao Pinning, hoje só texto.

**Independent Test**: atirador com ROF 10 coloca o cone sobre três tokens (um com Em cobertura): três cartões de Pinning;
um falha e fica Pinned; no turno seguinte do atirador, uma rolagem de 25 acerta os dois descobertos com SD 20 e 22 e não o
coberto; o cone é removido.

**Acceptance Scenarios**:

1. **Given** uma arma sem automático (ou pesada sem Brace), **When** o jogador escolhe Suppressing Fire, **Then** a ação é recusada com aviso.
2. **Given** o cone colocado, **When** confirmado, **Then** cada token dentro (exceto o atirador) recebe um cartão de Pinning; Fearless e Headstrong ficam imunes (aviso no cartão).
3. **Given** um teste de Pinning falho, **When** rolado, **Then** o personagem fica Pinned.
4. **Given** o início do próximo turno do atirador, **When** o turno começa, **Then** um cartão de rajada lista os alvos descobertos no cone, a rolagem e quem foi acertado (SD < total, até o ROF, escolha aleatória se passar), com Aplicar dano e Dodge por alvo.
5. **Given** um personagem Pinned, **When** tenta uma ação completa, **Then** é recusada (o Mestre pode permitir); no fim do turno dele, um cartão de teste de saída aparece: TN 20 se ainda estiver dentro de uma zona ativa, TN 10 se não; sucesso tira o Pinned. Estar em grapple libera automaticamente.

---

### User Story 2 - Testes opostos e Grapple (Priority: P2)

Um **teste oposto** rola os dois lados e o maior total vence (empate: quem defende), com **um raise a cada 5 pontos** de
diferença. Ele passa a servir Bull Rush, Knock Down, Disarm e Feint (hoje contra TN 15) e o **Grapple**: o ataque para
entrar é de **Brawl** (desarmado), com Dodge/Parry normais; acertando, o atacante fica **Grappling** e o alvo
**Grappled**, ligados um ao outro. A cada turno o controlador gasta uma ação completa e ganha a **Strength oposta** para
escolher uma opção: **Atacar com arma** (acerto automático, só armas de uma mão, raises do teste), **Derrubar** (Prone),
**Empurrar** (2 m + 2 m por raise, até a Speed), **Ready/Stand/Usar item**; perdendo, nada acontece. O grappled só pode
tentar **Break Free** (Strength oposta), **Slip Free** (Dexterity TN 20) ou **Take Control** (Strength oposta, e então uma
opção imediata); escapar devolve meia ação. Feats: Bear Hug (+1 Strength ao manter, Slip Free TN 25), Crushing Bear (dano
desarmado a cada turno), Squat Stability (imune a empurrar/derrubar).

**Why this priority**: o grapple tem várias etapas que hoje o Mestre conduz de cabeça; depende do teste oposto.

**Independent Test**: A (Str 3) agarra B com Brawl; A Grappling, B Grappled; no turno seguinte A escolhe Empurrar, rola
Strength 22 contra 13: vence com 1 raise, B vai 4 m; B tenta Break Free e perde; depois Slip Free com 21 e escapa, com
meia ação de volta.

**Acceptance Scenarios**:

1. **Given** Bull Rush, Knock Down, Disarm ou Feint com um alvo, **When** a ação é usada, **Then** um cartão de teste oposto rola os dois lados e mostra vencedor e raises.
2. **Given** a ação Grapple, **When** usada, **Then** o ataque é de Brawl desarmado mesmo com arma equipada, e o alvo pode Dodge/Parry.
3. **Given** o acerto, **When** resolvido, **Then** as condições Grappling e Grappled ligam os dois; Grappled não se move.
4. **Given** o controlador no turno dele, **When** escolhe uma opção, **Then** a Strength oposta decide e o efeito é aplicado (dano pelo Aplicar, Prone, distância no cartão).
5. **Given** o grappled no turno dele, **When** tenta uma ação que não é Break Free, Slip Free ou Take Control (nem livre), **Then** é recusada (o Mestre pode permitir); escapando, as duas condições saem e ele fica com meia ação.

---

### User Story 3 - Overwatch, Delay e Tactical Advance (Priority: P3)

**Overwatch** (ação completa, arma automática): o jogador coloca o cone e escolhe Full Auto Burst ou Suppressing Fire e o
gatilho (texto). Até o próximo turno, um botão no cartão dispara o ataque escolhido **antes** da ação que o provocou,
**uma vez**; qualquer ação ou reação do personagem encerra o Overwatch (ações livres não). **Delay** (meia ação): guarda
uma meia ação para usar até o próximo turno; um botão no tracker/ficha a usa (vai antes da ação que interromper); a ordem
de iniciativa não muda. **Tactical Advance** (ação completa): move até 2× Speed, sem provocar, e **mantém a condição Em
cobertura** durante o movimento.

**Why this priority**: completa as ações de turno; usa o cone e a cobertura das US1.

**Independent Test**: Overwatch com gatilho "quem sair da porta": no turno do inimigo, o botão dispara a rajada antes do
movimento e o Overwatch acaba; Delay de uma Standard Attack usada no turno do inimigo; Tactical Advance mantém Em
cobertura.

**Acceptance Scenarios**:

1. **Given** Overwatch declarado, **When** o botão do cartão é usado antes do próximo turno, **Then** o ataque escolhido é resolvido sobre o cone (Suppressing Fire: Pinning e a rajada; Full Auto Burst: os alvos no cone) e o Overwatch termina.
2. **Given** Overwatch ativo, **When** o personagem usa uma ação ou reação, **Then** o Overwatch termina e o cone some.
3. **Given** Delay, **When** o personagem usa a meia ação guardada antes do próximo turno, **Then** ela não consome as ações do novo turno e some no início dele se não for usada.
4. **Given** Tactical Advance com Em cobertura, **When** usada, **Then** a condição continua e não há ataque de oportunidade.

---

### Edge Cases

- Token que entra no cone depois da declaração: não testa Pinning (só quem estava dentro), mas conta para a rajada se estiver dentro e descoberto no início do turno do atirador.
- Aliados dentro do cone: testam e podem ser acertados (a zona não escolhe lados).
- Atirador fora de combate ou derrubado antes do turno: a rajada não sai; o cone some no fim do combate.
- Grapple com o controlador ou o grappled incapacitado: as condições saem.
- Delay ou Overwatch no fim do combate: somem.
- Pinned e Grappled ao mesmo tempo: estar em grapple conta como corpo a corpo, então o Pinned sai.
- Munição: não é contada; o cartão da rajada lembra o gasto (ROF automático) em texto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Suppressing Fire e Overwatch MUST exigir arma com ROF automático (pesada: com Brace); senão, recusa com aviso (Mestre libera).
- **FR-002**: A zona MUST ser um cone de 45° colocado a partir do token do atirador, com comprimento inicial igual ao alcance da arma e ajustável até 4×; os tokens dentro são detectados pelo sistema.
- **FR-003**: Suppressing Fire MUST gerar um cartão de Pinning (Willpower TN 20, modificadores gerais das rolagens) para cada token no cone exceto o atirador; Fearless e Headstrong imunes; falha aplica Pinned.
- **FR-004**: No início do próximo turno do atirador, o sistema MUST rolar um Full Auto Burst (+2k1, bônus de feats de Full Auto Burst) e marcar como acertados os tokens no cone sem Em cobertura com Static Defense menor que o total, até o ROF automático (sorteio se passar), sem dano extra por raise; cada acertado tem Aplicar dano e Dodge; o cone é removido depois.
- **FR-005**: Pinned MUST recusar ações completas (Mestre libera) e MUST oferecer, no fim de cada turno do personagem, o teste de saída: TN 20 dentro de uma zona ativa, TN 10 fora; sucesso remove a condição; entrar em grapple remove a condição.
- **FR-006**: Um teste oposto MUST rolar os dois lados, dar a vitória ao maior total (empate: defensor) e contar raises = diferença ÷ 5 (arredondado para baixo); Bull Rush, Knock Down, Disarm e Feint MUST usar o teste oposto quando há alvo.
- **FR-007**: Grapple MUST atacar com Brawl desarmado; no acerto, MUST aplicar Grappling ao atacante e Grappled ao alvo, ligados; Grappled não se move.
- **FR-008**: O controlador MUST poder escolher, com ação completa e Strength oposta, Atacar com arma (acerto automático, uma mão, raises do teste), Derrubar, Empurrar (2 m + 2 m/raise, até Speed), Ready, Stand ou Usar item; perdendo, nada acontece.
- **FR-009**: O grappled MUST ter só Break Free (Strength oposta), Slip Free (Dexterity TN 20) e Take Control (Strength oposta; vencendo, troca o controle e escolhe uma opção); outras ações recusadas (Mestre libera), exceto livres e reações; escapar remove as condições e deixa meia ação.
- **FR-010**: Bear Hug, Crushing Bear e Squat Stability MUST alterar o grapple como no livro; Mobbing Up e Mark of Moradin aparecem como nota.
- **FR-011**: Overwatch MUST guardar a zona, o ataque escolhido e o gatilho até o próximo turno; um botão MUST disparar o ataque uma vez e encerrar; uma ação ou reação do personagem MUST encerrar o Overwatch.
- **FR-012**: Delay MUST guardar uma meia ação até o início do próximo turno do personagem, usável fora do turno sem consumir as ações do turno seguinte; a iniciativa não muda.
- **FR-013**: Tactical Advance MUST mover sem provocar e manter Em cobertura.
- **FR-014**: A condição Em cobertura MUST guardar o AP da cobertura (4, 8, 12, 16 ou 32) e os locais cobertos, alimentando o AP de cobertura do dano da 008.
- **FR-015**: Textos da interface MUST existir em inglês e português.

### Key Entities

- **Zona de tiro**: cone no mapa ligado ao atirador; tipo (Suppressing Fire, Overwatch), arma, ataque escolhido, gatilho, validade (até o próximo turno do atirador).
- **Grapple**: ligação controlador ↔ grappled pelas condições Grappling/Grappled.
- **Delay**: meia ação guardada no combatente, com validade até o próximo turno dele.
- **Em cobertura**: condição com AP e locais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um Suppressing Fire sobre N tokens resolve Pinning e a rajada sem o Mestre calcular nada à mão (só confirmar).
- **SC-002**: Um grapple completo (entrar, manter com uma opção, escapar) leva no máximo um cartão por passo.
- **SC-003**: 100% das ações recusadas para Pinned/Grappled podem ser liberadas pelo Mestre.
- **SC-004**: Nenhuma ação existente da 008 muda de comportamento fora das cinco ações e das quatro ações opostas.

## Assumptions

- O texto da ação vale sobre a tabela da p. 423 (sem −2k0), como na 008.
- Suppressing Fire conta como Full Auto Burst para feats (Rock and Roll, Storm of Iron, Steel Rain); a trick shot Crisis Zone continua como está (texto).
- "Sob fogo" = dentro de uma zona ativa de Suppressing Fire ou Overwatch.
- Movimento obrigatório do Pinned (ficar/ir para a cobertura, afastar-se) é lembrete, não bloqueio.
- A cobertura vale contra todos os atacantes (sem direção).
- Munição fica fora (registrar em pendências).

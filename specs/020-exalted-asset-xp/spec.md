# Feature Specification: Custo de XP dos Exalted Assets (DtD 7.7a)

**Feature Branch**: `020-exalted-asset-xp`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Exalted Assets custam 100 XP como os Assets; o Paragon Racial Asset da Perfection é
grátis e as Paragon Assets compradas depois da criação também custam 100; sem XP, recusa e o Mestre libera; a devolução
é só pelo desfazer do log; personagens que já têm assets não são cobrados."

**Referência de regras**: DtD 7.7a — tabela de XP "Buy an Asset 100" p. 16; exemplo de criação p. 18 (200 XP por dois
assets, um deles Exalted); Assets e Exalted Assets p. 179; Perfection do Paragon p. 83; Exalted Assets pp. 211–223.
Constituição v1.2.1.

**Depende de**: 004 (exaltações e Exalted Assets), 005 (feats e assets), 006 (XP e log), 016 (criação guiada).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprar um Exalted Asset com XP (Priority: P1)

Ao arrastar um Exalted Asset para a ficha, depois das checagens que já existem (exaltação, raça, limite de um asset,
só na criação), o sistema pede confirmação da compra por **100 XP**, mostrando o XP disponível. Confirmada, o asset entra
na ficha e o log de XP ganha a linha da compra; recusada, nada muda. Sem XP suficiente, a compra é **recusada** com aviso;
o Mestre pode adicioná-lo mesmo assim, **sem cobrar**.

**Why this priority**: é a regra que falta; sem ela a criação dá 100 XP a mais para quem escolhe um Exalted Asset.

**Independent Test**: personagem em criação com 600 XP disponíveis e exaltação Werewolf: arrastar Black Spiral Dancers,
confirmar → 500 disponíveis e uma linha "Black Spiral Dancers · 100" no log.

**Acceptance Scenarios**:

1. **Given** um personagem com XP suficiente, **When** arrasta um Exalted Asset válido e confirma, **Then** o asset entra e 100 XP são gastos, com a linha no log.
2. **Given** a confirmação, **When** o jogador cancela, **Then** o asset não entra e nenhum XP é gasto.
3. **Given** menos de 100 XP disponíveis, **When** um jogador arrasta o asset, **Then** a compra é recusada com aviso.
4. **Given** menos de 100 XP disponíveis, **When** o Mestre arrasta o asset e confirma a liberação, **Then** o asset entra sem custo e sem linha de compra.
5. **Given** uma recusa de regra (segundo Exalted Asset, fora da criação, exaltação errada) liberada pelo Mestre, **When** ele confirma, **Then** a compra segue pelo mesmo preço de 100 XP, como nos feats.

---

### User Story 2 - Paragon (Priority: P2)

O Paragon Racial Asset que vem da **Perfection** continua grátis (é um poder da exaltação). As **Paragon Assets**
compradas — na criação ou depois dela, como a Perfection permite — custam 100 XP cada.

**Why this priority**: o Paragon é a única exaltação que compra assets depois da criação; precisa seguir a mesma regra.

**Independent Test**: escolher a exaltação Paragon para um Elf → Elven Perfection entra sem cobrança; depois da criação,
arrastar Action Hero → 100 XP gastos e +1 Hero Point.

**Acceptance Scenarios**:

1. **Given** a escolha da exaltação Paragon, **When** a Perfection adiciona o Paragon Racial Asset, **Then** nenhum XP é gasto e não há linha de compra.
2. **Given** um Paragon fora da criação, **When** compra uma Paragon Asset, **Then** 100 XP são gastos.

---

### User Story 3 - Desfazer a compra (Priority: P3)

Desfazer a linha da compra no log de XP apaga o asset (com os efeitos dele) e devolve os 100 XP, como nos feats.
Remover o asset pela ficha não devolve XP; a linha fica no log e, se for desfeita depois, só devolve o XP.

**Why this priority**: corrige erros de compra com o mesmo fluxo já conhecido.

**Independent Test**: comprar um Exalted Asset e desfazer a linha → o asset some e o XP volta a 600.

**Acceptance Scenarios**:

1. **Given** uma compra de Exalted Asset no log, **When** o dono desfaz a última linha (ou o Mestre qualquer uma), **Then** o asset é apagado e os 100 XP voltam.
2. **Given** o asset já removido pela ficha (ou levado pela troca de exaltação), **When** a linha é desfeita, **Then** só o XP volta.

---

### Edge Cases

- Action Hero comprado e desfeito: o asset some; o Hero Point extra segue o que a remoção do asset já faz hoje.
- Exalted Asset que concede feats (grants): os feats concedidos seguem o fluxo de remoção do asset que já existe.
- Arrastar para um NPC ou outro tipo de ator: recusado como hoje, sem cobrança.
- Personagens que já têm Exalted Assets sem cobrança (Aldred Kain, Milton): nada muda; o Mestre ajusta à mão se quiser.
- O checklist e o resumo da criação passam a refletir os 100 XP pelo total disponível, sem regra nova.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A compra de um Exalted Asset arrastado para a ficha MUST custar 100 XP (p. 16), depois das checagens de exaltação, raça, limite e criação.
- **FR-002**: A compra MUST pedir confirmação mostrando o custo e o XP disponível; cancelar MUST não adicionar o asset.
- **FR-003**: A compra MUST ficar no log de XP com o nome do asset, o custo e o vínculo com o item.
- **FR-004**: Sem XP suficiente, a compra MUST ser recusada com aviso; o Mestre MUST poder adicionar o asset sem cobrar (constituição IV).
- **FR-005**: O asset concedido pela Perfection MUST continuar grátis e sem linha de compra.
- **FR-006**: As Paragon Assets compradas, na criação ou depois, MUST custar 100 XP.
- **FR-007**: Desfazer a linha da compra MUST apagar o asset (se ainda existir) e devolver os 100 XP.
- **FR-008**: Remover o asset pela ficha MUST não devolver XP.
- **FR-009**: Personagens existentes MUST não ser alterados (sem cobrança retroativa).
- **FR-010**: Textos novos MUST existir em inglês e pt-BR.

### Key Entities

- **Exalted Asset**: feat da categoria Exalted Asset (004); preço fixo de 100 XP.
- **Linha do log de XP**: compra do tipo asset, com custo e item vinculado (006).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O exemplo da p. 18 fecha na ficha: 800 XP com duas Hindrances, menos 200 por Black Spiral Dancers e Appearance, menos 400 em feats, menos 150 → 50 XP restantes.
- **SC-002**: Em 100% das compras confirmadas o XP disponível cai 100 e há uma linha no log; em 100% das canceladas ou recusadas, nada muda.
- **SC-003**: O asset da Perfection nunca gera cobrança.
- **SC-004**: Desfazer a compra devolve o XP e remove o asset em um clique (mais a confirmação).

## Assumptions

- O preço é fixo em 100 XP, igual ao "Buy an Asset" da tabela; o campo de custo do item não é usado.
- A liberação do Mestre para uma recusa de regra mantém o preço (igual aos feats da 005/006); só a falta de XP é liberada sem custo.
- A troca de exaltação continua apagando os assets ligados a ela sem devolver XP; a linha fica no log para o desfazer.
- Fora de escopo: cobrar assets já existentes, mudar o preço dos feats e dos assets comuns.

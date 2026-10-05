# Feature Specification: Ícones das condições e dos efeitos (Scriptorium Machina)

**Feature Branch**: `025-condition-icons`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Ícones das condições no mesmo estilo do sistema: selo redondo (disco de ferro, anel na cor
da gravidade, glifo claro); entram as 30 condições e os efeitos criados pelos serviços."

**Referência visual**: design system da 021 e ícones da 024 (glifos do game-icons.net, cores de `styles/tokens.css`).
Constituição v1.2.1.

**Depende de**: 008 (condições), 011 (degeneração), 010 (escolas marciais), 013 (manobras de veículo), 024 (pipeline de
ícones).

## Decisões do usuário (2026-10-05)

- Estilo **B — selo redondo**: disco de ferro, anel na cor da gravidade e glifo claro. Distingue condição de item e é
  legível a 20 px sobre o token.
- Entram as **30 condições** e os **efeitos criados pelos serviços**: degeneração, ataques e técnicas marciais,
  manobra Barrel Roll.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Condições com ícone próprio (Priority: P1)

O Mestre marca uma condição num token, pelo HUD ou pela ficha (Stunned, On Fire, Prone, Grappled…). O token passa a
mostrar um selo redondo com o glifo da condição e o anel na cor da gravidade. A mesma imagem aparece no HUD e na lista de
condições da ficha.

**Why this priority**: as condições aparecem em todo combate e são o que mais se vê sobre os tokens. Hoje usam os
ícones genéricos do Foundry, e vários se repetem (perda de membro, por exemplo).

**Independent Test**: num token, ligar Stunned, On Fire, Prone e Unconscious; ver os quatro selos no token a 20 px, no
HUD e na ficha, todos distintos.

**Acceptance Scenarios**:

1. **Given** qualquer uma das 30 condições, **When** aplicada a um token, **Then** o token mostra o selo próprio dela, nenhum ícone do Foundry.
2. **Given** duas condições diferentes (Lost Hand × Lost Arm, Grappled × Grappling), **When** comparadas, **Then** os glifos são diferentes.
3. **Given** a gravidade da condição, **When** o selo é exibido, **Then** o anel usa a cor do grupo (dano em lacre, incapacidade em âmbar, restrição em tinta suave, postura vantajosa em fósforo).
4. **Given** uma condição marcada como "dead", **When** aplicada, **Then** a sobreposição de derrotado do Foundry usa o selo próprio.

---

### User Story 2 - Efeitos dos serviços e dos itens (Priority: P2)

Os efeitos criados pelo sistema também usam os ícones do sistema:
- degeneração do alinhamento, ataques e técnicas das escolas marciais e a manobra Barrel Roll recebem selos próprios;
- os efeitos que vêm dentro de itens do compêndio (armaduras de força, cibernéticos, drogas, hearthstones) usam o ícone
  do item.

**Why this priority**: completa a troca dos ícones do Foundry iniciada na 024; esses efeitos aparecem na ficha e no
token.

**Independent Test**: provocar uma degeneração, usar uma técnica marcial com efeito e um Barrel Roll, e ativar uma
droga; conferir os ícones dos efeitos na ficha e no token.

**Acceptance Scenarios**:

1. **Given** um efeito criado por um serviço, **When** aplicado, **Then** usa o selo do seu tipo, nenhum ícone do Foundry.
2. **Given** um item do compêndio com efeito, **When** o efeito aparece, **Then** usa o ícone do item.

---

### Edge Cases

- Condições já aplicadas em mundos antigos guardam a imagem antiga no efeito; o menu "Atualizar ícones" da 024 passa a trocá-las também (só as que ainda usam imagem do Foundry).
- Várias condições ao mesmo tempo num token pequeno: os selos continuam distinguíveis lado a lado.
- Condição sem glifo bom no banco: usa o glifo padrão do grupo e entra nas pendências de curadoria.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada uma das 30 condições MUST ter um selo próprio (glifo distinto) no estilo B.
- **FR-002**: O anel MUST usar a cor do grupo de gravidade, só com cores de `tokens.css`: lacre (dano: Blood Loss, On Fire, Dead, membros perdidos), âmbar (incapacidade: Blinded, Deafened, Dazed, Stunned, Diseased, Helpless, Surprised, Jaded, Unconscious), tinta suave (restrição e posição: Prone, Restrained, Immobilized, Pinned, Grappled, Grappling, In Cover) e fósforo (posturas e efeitos favoráveis: Full Defense, Fight Defensively, All Out Attack, Healing Surge, Running, Incorporeal).
- **FR-003**: Os efeitos criados pelos serviços (degeneração, ataque e técnica marcial, Barrel Roll) MUST usar selos próprios no mesmo estilo.
- **FR-004**: Os efeitos dentro de itens dos compêndios MUST usar o ícone do item.
- **FR-005**: Os selos MUST ser gerados pelo mesmo pipeline reprodutível da 024 (glifos versionados, sem rede para gerar nem rodar), com créditos atualizados.
- **FR-006**: O menu "Atualizar ícones" da 024 MUST também trocar os efeitos do mundo que ainda usam a imagem do Foundry de uma condição ou de um efeito do sistema; imagens personalizadas continuam intactas.
- **FR-007**: Um teste MUST falhar se alguma condição ou efeito dos compêndios usar imagem do Foundry ou apontar para arquivo inexistente.

### Key Entities

- **Selo de condição**: imagem final (disco + anel + glifo) por condição ou efeito, com caminho estável.
- **Grupo de gravidade**: cor do anel compartilhada por várias condições.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 30 de 30 condições e os efeitos dos serviços e dos compêndios com ícone do sistema; 0 do Foundry.
- **SC-002**: 30 glifos distintos para as 30 condições.
- **SC-003**: Selos reconhecíveis a 20 px sobre o token e a 44 px no HUD, nos temas claro e escuro.
- **SC-004**: Gerar de novo os ícones não altera nenhum arquivo; o zip da release continua até 2,5 MB.

## Assumptions

- O selo tem o mesmo formato SVG da 024 (512 px, autocontido).
- A distribuição das condições pelos grupos de gravidade segue FR-002; o usuário pode ajustar na revisão.
- Tokens já colocados em cenas mostram o selo novo assim que o efeito for atualizado (a imagem do token não muda).
- Fora de escopo: arte ilustrada; efeitos de módulos de terceiros.

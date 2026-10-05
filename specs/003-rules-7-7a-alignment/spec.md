# Feature Specification: Ajuste da fundação (001) às regras da DtD 7.7a

**Feature Branch**: `003-rules-7-7a-alignment`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Ajuste da feature 001 (fundação: ficha, rolagem Roll & Keep, diálogo) às regras da DtD 7.7a, conforme docs/comparativo-7.7a.md §1 e constituição v1.2.0. Mudanças: (1) Acrobatics passa a ser perícia Básica — ficam 7 Avançadas; (2) Athletics passa a usar Strength; (3) stunt dice passam a dar +1k1 cada (+XkX); (4) tabela de TN com 10 degraus e nomes da 7.7a, exibida como sugestão no diálogo; (5) Fatigue máxima = Con exibida na ficha; (6) iniciativa social 1d10 + Fel + Cmp exibida no rodapé. Atualizar citações de página das specs da 001 para a 7.7a."

**Referência de regras**: DtD 7.7a — pp. 16–17 (derivados e Fatigue), p. 25 (perícias), p. 417
(tabela de TN), pp. 418–419 (stunts), p. 446 (iniciativa social); `docs/comparativo-7.7a.md` §1.

**Numeração**: `003` porque o número `002` já está em uso pela feature de raças (branch
`002-race-compendium`), ainda não integrada à `main`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Perícias conforme a 7.7a (Priority: P1)

Um jogador abre a ficha e vê Acrobatics como perícia Básica (sem a marca de Avançada) e Athletics
associada a Strength. Ao rolar Acrobatics sem treino, a rolagem acontece como qualquer perícia
básica sem treino, em vez de ser bloqueada; ao rolar Athletics, a parada usa Strength.

**Why this priority**: são as únicas mudanças que alteram o resultado de rolagens já disponíveis;
sem elas a mesa joga com regra desatualizada.

**Independent Test**: com um personagem de Dex 3, Str 4 e 0 pontos em Acrobatics e Athletics,
conferir a marca de Avançada e rolar as duas perícias.

**Acceptance Scenarios**:

1. **Given** Acrobatics com 0 pontos e Dex 3, **When** o jogador rola Acrobatics, **Then** a rolagem
   acontece como perícia básica sem treino (2k2) e o cartão indica "sem treino".
2. **Given** a ficha no modo edição, **When** o jogador olha as perícias físicas, **Then** Acrobatics
   não tem a marca de Avançada e Pilot continua com ela.
3. **Given** Athletics com 2 pontos e Str 4 (Con 2), **When** o jogador rola Athletics, **Then** a
   parada é 6k4 (Strength), e a ficha mostra a abreviação de Strength ao lado da perícia.
4. **Given** qualquer perícia avançada da 7.7a (Academic Lore, Common Lore, Forbidden Lore, Medicae,
   Pilot, Politics, Tech-Use) com 0 pontos, **When** o jogador tenta rolar, **Then** a rolagem
   continua bloqueada com aviso.

---

### User Story 2 - Stunts e dificuldade no diálogo de rolagem (Priority: P2)

Ao abrir o diálogo de rolagem, o jogador escolhe o nível de stunt concedido pelo Mestre (0 a 3) e
cada nível soma um dado rolado e um dado mantido. Para o TN, o diálogo sugere os 10 degraus de
dificuldade da 7.7a com seus nomes, mantendo a possibilidade de digitar qualquer valor ou deixar
em branco.

**Why this priority**: stunts mudam o total das rolagens de forma significativa; a tabela de TN
ajuda o Mestre a escolher dificuldades com o vocabulário do livro.

**Independent Test**: abrir o diálogo, aplicar 2 níveis de stunt em uma parada 5k3 e escolher o
degrau "Hard" na lista de sugestões.

**Acceptance Scenarios**:

1. **Given** uma parada 5k3, **When** o jogador aplica stunt nível 2, **Then** a parada passa a 7k5.
2. **Given** uma parada 9k8, **When** o jogador aplica stunt nível 3, **Then** a parada 12k11 é
   normalizada pela regra de mais de 10 dados (10k10 + 15: dois dados rolados e um mantido excedentes, +5 cada) e o cartão mostra a conversão.
3. **Given** o campo de TN, **When** o jogador abre as sugestões, **Then** aparecem os 10 degraus na
   ordem: 5 Trivial, 10 Easy, 15 Average, 20 Advanced, 25 Hard, 30 Very Hard, 35 Exceptional,
   40 Heroic, 45 Never Done Before, 50 Never to be Done Again.
4. **Given** o campo de TN, **When** o jogador digita 18 ou deixa em branco, **Then** a rolagem aceita
   o valor digitado ou mostra só o total, como antes.
5. **Given** o nível de stunt, **When** o jogador informa 5 ou −1, **Then** o valor é limitado a 3 ou 0.

---

### User Story 3 - Fatigue e iniciativa social na ficha (Priority: P3)

A ficha passa a mostrar a Fatigue atual (editável) e a Fatigue máxima, igual à Constitution, e o
rodapé mostra, ao lado da iniciativa de combate, a iniciativa social (1d10 + Fel + Cmp).

**Why this priority**: são informações de consulta, sem efeito automático nesta feature, mas
presentes na ficha oficial da 7.7a.

**Independent Test**: com Con 3, Fel 3 e Cmp 2, conferir Fatigue "0 / 3" e iniciativa social
"1d10 + 5"; alterar Con para 4 e ver o máximo mudar na hora.

**Acceptance Scenarios**:

1. **Given** Con 3, **When** a ficha é exibida, **Then** a Fatigue mostra 0 / 3.
2. **Given** Con 3, **When** Con passa a 4, **Then** o máximo de Fatigue passa a 4 imediatamente.
3. **Given** Fel 3 e Cmp 2, **When** o rodapé é exibido, **Then** a iniciativa social mostra 1d10 + 5.
4. **Given** a Fatigue atual, **When** o jogador a altera no modo jogo, **Then** o valor é salvo
   (valores negativos não são aceitos).

---

### Edge Cases

- **Personagens já existentes**: nada armazenado muda; a nova regra de Acrobatics e a nova
  característica de Athletics valem imediatamente para eles. Fatigue atual começa em 0.
- **Stunt com parada perto de 10 dados**: a soma de rolados e mantidos passa pela mesma regra de
  normalização de mais de 10 dados já existente.
- **Fatigue atual acima do máximo** (ex.: Con reduzida depois): o valor é mantido e exibido acima do
  máximo, sem ser cortado automaticamente.
- **Medicae**: o livro a marca como Avançada no texto (p. 27) e sem asterisco na ficha
  (pp. 19, 577); segue-se o texto (Avançada), conforme `docs/comparativo-7.7a.md` §1.

## Requirements *(mandatory)*

### Functional Requirements

**Perícias (US1)**

- **FR-001**: Acrobatics MUST ser perícia Básica. As perícias Avançadas MUST ser exatamente:
  Academic Lore, Common Lore, Forbidden Lore, Medicae, Pilot, Politics, Tech-Use (7.7a p. 25).
- **FR-002**: A característica padrão de Athletics MUST ser Strength (7.7a p. 25), usada pela
  rolagem, pela parada exibida no modo jogo e pela abreviação ao lado da perícia.

**Diálogo de rolagem (US2)**

- **FR-003**: O diálogo MUST oferecer um "nível de stunt" de 0 a 3; cada nível MUST somar um dado
  rolado e um dado mantido (+XkX) antes da normalização de mais de 10 dados (7.7a pp. 418–419).
- **FR-004**: O campo de TN MUST sugerir os 10 degraus da tabela da 7.7a com seus nomes
  (p. 417), mantendo a entrada livre de número e a opção de deixar em branco; o padrão continua 15.
- **FR-005**: Os nomes dos degraus MUST aparecer traduzidos em pt-BR e em inglês.

**Ficha (US3)**

- **FR-006**: A ficha MUST ter a Fatigue atual (inteiro ≥ 0, editável nos dois modos, padrão 0) e
  exibir a Fatigue máxima = Constitution (7.7a pp. 16–17), recalculada imediatamente.
- **FR-007**: O rodapé MUST exibir a iniciativa social 1d10 + Fellowship + Composure (7.7a p. 446)
  ao lado da iniciativa de combate.

**Documentação**

- **FR-008**: As specs e contratos da feature 001 MUST passar a citar as páginas da 7.7a nas regras
  alteradas por esta feature, com nota de que a fonte é a 7.7a (constituição v1.2.0).

### Key Entities *(include if feature involves data)*

- **Perícia**: muda a classificação Básica/Avançada de Acrobatics e a característica padrão de
  Athletics.
- **Personagem**: ganha Fatigue atual; Fatigue máxima é um valor derivado (Con).
- **Teste (modificadores)**: o stunt passa a somar dados rolados e mantidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das perícias exibem a classificação Básica/Avançada e a característica padrão
  conforme a p. 25 da 7.7a.
- **SC-002**: Os exemplos de stunt dos cenários (5k3 + 2 → 7k5; 9k8 + 3 → 10k10 + 15) produzem a
  parada correta em 100% dos testes.
- **SC-003**: Um jogador escolhe um degrau de dificuldade da tabela da 7.7a em no máximo 2 cliques
  no diálogo.
- **SC-004**: Toda a interface nova aparece traduzida ao alternar pt-BR e inglês (0 textos sem
  tradução).
- **SC-005**: Todas as rolagens e telas validadas na feature 001 continuam funcionando (nenhuma
  regressão no roteiro manual da 001).

## Assumptions

- **Fora de escopo**: efeitos automáticos da Fatigue (−1k0 em testes, inconsciência acima do máximo),
  demais mudanças da 7.7a (custos de XP, raças, combate, magia) — tratadas em features próprias.
- A Fatigue é apenas registrada e exibida; o Mestre aplica as penalidades manualmente.
- A regra da especialidade (rerrolar 1s uma vez) e o restante da rolagem não mudam.
- Atualizações de página nas specs da 001 cobrem só as regras tocadas por esta feature; a revisão
  completa de `docs/analise-dtd.md` acontece gradualmente, feature a feature.
- A feature de raças (002) pode ter feito mudanças parecidas na própria branch; a integração entre
  as duas será resolvida no merge.

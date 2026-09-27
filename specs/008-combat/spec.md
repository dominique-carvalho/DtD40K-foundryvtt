# Feature Specification: Combate, condições, social, medo e insanidade (DtD 7.7a)

**Feature Branch**: `008-combat`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Combate da DtD 7.7a (cap. XVII): aplicar o dano da 007 no alvo (AP da localização menos Pen, Aura contra magia, divisão pela Resilience, HP, Critical Damage com os efeitos das tabelas tipo × localização aplicados como condição quando simples); iniciativa no Combat Tracker, turnos com meia ação/ação completa, 1 reação por rodada, Dodge e Parry, e todas as ações de combate com seus modificadores num menu da ficha; condições como status effects com efeitos numéricos, fadiga, inconsciência e morte, cura natural e por Medicae; combate social com dano em Resolve, testes de medo com a Shock Table e insanidade com derangements e Mental Traumas."

**Referência de regras**: DtD **7.7a** — cap. XVII "Playing the Game", pp. 416–452: Hero Points e stunts pp. 418–420;
estrutura do combate, surpresa e iniciativa p. 422; ações pp. 423–430; ataque e dano pp. 431–432; modificadores e
cobertura pp. 433–435; dano, cura e Critical Damage pp. 436–437; tabelas de críticos pp. 438–441; condições pp. 442–444;
combate social pp. 446–447; medo e insanidade pp. 448–452. Derivados p. 17. Constituição v1.2.1.

**Depende de**: 001 (personagem, rolagem, diálogo, Hero Points), 002 (Size), 004 (Aura, Resource Points), 005 (feats
Ambidextrous, Two Weapon Fighting, Swift/Lightning Attack, Double Tap), 006 (Level), 007 (armas, AP por localização,
cartões de ataque e dano, localização d10, qualidades, emperramento).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aplicar o dano no alvo (Priority: P1)

O cartão de dano da 007 ganha o botão **Aplicar**. Para o alvo marcado (ou o token selecionado), o sistema subtrai
do dano o AP da localização atingida reduzido pela Pen da arma (magia: a Aura do alvo, sem AP), divide o resto
pela Resilience (mínimo 1; Tearing arredonda para cima) e tira o resultado do HP. O que passar do HP zero vira
**Critical Damage**, que se acumula; o sistema consulta a tabela do tipo de dano (Energy, Explosive, Impact,
Rending) e da localização (braço, corpo, entranhas, cabeça, pernas) na linha do total acumulado e aplica o
efeito: condições simples (Stunned, Dazed, Prone, Blinded, Blood Loss, fadiga, membro perdido, morte) como status
effects, o resto como texto no chat. Desarmado que tira HP também dá 1 de fadiga.

**Why this priority**: fecha o ciclo ataque → dano → alvo iniciado na 007; é o núcleo do combate.

**Independent Test**: alvo com Resilience 4, HP 10 e Carapace (AP 7); dano 19 com Pen 2 no corpo → 19 − (7 − 2) = 14
→ 3 HP; alvo com HP 1 recebe 12 de dano Rending na cabeça → 1 HP e 2 de Critical Damage → efeito da linha 2 de
Rending/Head aplicado.

**Acceptance Scenarios**:

1. **Given** um cartão de dano 19 (Pen 2, corpo) e um alvo com AP 7 no corpo e Resilience 4, **When** o Mestre clica em Aplicar, **Then** o alvo perde 3 HP e o chat registra 19 − 5 = 14 ÷ 4 = 3.
2. **Given** dano menor ou igual ao AP efetivo, **When** aplicado, **Then** nenhum efeito.
3. **Given** uma arma Tearing e 13 de dano efetivo com Resilience 4, **When** aplicado, **Then** 4 HP (arredonda para cima).
4. **Given** um alvo com 2 HP que sofreria 5, **When** aplicado, **Then** HP 0 e 3 de Critical Damage; o efeito da linha 3 da tabela do tipo e da localização aparece no chat e as condições dele entram no alvo.
5. **Given** Critical Damage acumulado 5 (ou mais), **When** novo crítico, **Then** o alvo morre (condição Dead).
6. **Given** dano de magia, **When** aplicado, **Then** a Aura do alvo substitui o AP.
7. **Given** o alvo atrás de cobertura AP 8 numa localização coberta, **When** aplicado, **Then** a cobertura absorve primeiro, o resto segue para a armadura, e o AP da cobertura cai 1 se foi atravessada.
8. **Given** um ataque desarmado que tira ao menos 1 HP, **When** aplicado, **Then** o alvo ganha 1 nível de fadiga.
9. **Given** um jogador sem permissão sobre o alvo, **When** clica em Aplicar, **Then** o pedido vai para o Mestre aplicar.

---

### User Story 2 - Iniciativa, turnos, ações e reações (Priority: P2)

No Combat Tracker, a iniciativa é 1d10 + Dex + Cmp, rolada uma vez no início (desempate: maior dado, depois maior
Dex, depois nova rolagem); um Hero Point faz o dado valer 10. A ficha tem um **menu de ações de combate** com as 38
ações do livro, cada uma com tipo (meia, completa, livre, reação), subtipos e efeito; escolher uma ação de ataque
abre o diálogo da 007 com o modificador dela (All Out Attack +2k0, Charge +1k0, Called Shot −2k0 e escolha de
localização, Fight Defensively −1k0...). O turno controla o que foi gasto: uma ação completa **ou** duas meias ações
diferentes, ações livres (cada uma uma vez por rodada) e **1 reação por rodada**. **Dodge** (Dex + Acrobatics) e
**Parry** (Weaponry ou Brawl, perícia k perícia + Level se proficiente) somam metade do total à Static Defense
contra aquele ataque. Ações defensivas duram até o próximo turno do personagem (Full Defense: +2 reações e +10
Static Defense; All Out Attack: sem reações). Surpresa: o surpreendido perde a rodada 1 e dá Combat Advantage.
Ataques múltiplos: com duas armas −3k0 cada (Ambidextrous −1k0 a menos, Two Weapon Fighting −2k0 a menos) e 1
reação por ataque além do primeiro.

**Why this priority**: organiza o combate e alimenta o ataque (P1) com os modificadores corretos.

**Independent Test**: rolar iniciativa de um personagem Dex 3, Cmp 2 e conferir 1d10 + 5; usar Full Defense e ver
+10 Static Defense e 3 reações até o próximo turno; tentar duas meias ações iguais e ver a recusa; esquivar com
total 18 e ver +9 na Static Defense contra aquele ataque.

**Acceptance Scenarios**:

1. **Given** um combate iniciado, **When** o personagem rola iniciativa, **Then** 1d10 + Dex + Cmp, uma vez por combate; empates seguem maior dado, maior Dex e rerrolagem.
2. **Given** a ação Standard Attack (meia), **When** usada duas vezes no mesmo turno, **Then** a segunda é recusada (meias ações diferentes); o Mestre pode permitir.
3. **Given** uma ação completa usada, **When** o personagem tenta outra meia ação, **Then** recusa.
4. **Given** uma reação já usada na rodada, **When** tenta Dodge, **Then** recusa (exceto com reações extras).
5. **Given** Dodge com total 18 contra um ataque, **When** resolvido, **Then** a Static Defense contra aquele ataque sobe 9 e o cartão do ataque mostra se ainda acerta.
6. **Given** Full Defense, **When** o turno acaba, **Then** até o próximo turno do personagem: +10 Static Defense e 2 reações extras.
7. **Given** All Out Attack, **When** atacado depois, **Then** sem reações até o próximo turno.
8. **Given** Called Shot, **When** ataca, **Then** −2k0 e o jogador escolhe a localização.
9. **Given** duas armas e Two Weapon Fighting, **When** Multiple Attacks, **Then** dois ataques a −1k0 cada e 1 reação gasta.
10. **Given** um personagem surpreendido, **When** a rodada 1 corre, **Then** ele pula o turno e seus atacantes ganham Combat Advantage (+1 free raise).
11. **Given** um alvo Prone, **When** atacado corpo a corpo, **Then** Combat Advantage; à distância (fora de queima-roupa), +1 raise exigido.

---

### User Story 3 - Condições, fadiga, morte e cura (Priority: P3)

As condições do livro são status effects no token e na ficha, com os efeitos numéricos aplicados: Stunned (não age,
dá Combat Advantage), Dazed (−1k0 em tudo), Prone (−1k0 corpo a corpo, −2k0 Dodge; atacantes ganham vantagem),
Blinded (Ballistics falha, −2k1 em testes visuais), Restrained, Immobilized, Helpless (ataques acertam, dano rola
duas vezes), Pinned, On Fire (−1 HP e +1 fadiga por rodada, Dex TN 15 para apagar), Blood Loss (1d10 no fim do turno,
1 = morte; Medicae TN 20 para estancar), Unconscious, Surprised, Deafened, Diseased, membros perdidos. **Fadiga**:
qualquer nível dá −1k0 em todos os testes; passar da Constitution derruba o personagem inconsciente por 10 − Con
horas. **Morte** vem dos críticos, de falhas "Con TN 20 ou morre", de Blood Loss e de sufocamento; um Hero Point
queimado evita uma morte. **Cura**: levemente ferido (HP perdido ≤ Willpower) recupera 1 HP por dia ou Con HP com um
dia de repouso; gravemente ferido, 1 HP por semana ou Con com uma semana de repouso; com Critical Damage, só com
repouso e atenção médica (Medicae), 1 ponto de crítico por semana.

**Why this priority**: os críticos (P1) e as ações (P2) dependem das condições para ter efeito.

**Independent Test**: marcar Dazed e conferir −1k0 numa rolagem; dar 1 de fadiga e ver −1k0 (2 de fadiga continua
−1k0); passar da Constitution e ver o personagem inconsciente; iniciar Blood Loss e ver o pedido de 1d10 no fim do
turno; aplicar um dia de repouso a um levemente ferido e ver +Con HP.

**Acceptance Scenarios**:

1. **Given** Dazed, **When** o personagem rola qualquer teste, **Then** −1k0 (visual: −2k0).
2. **Given** fadiga 1 ou mais, **When** rola, **Then** −1k0 (não acumula por nível).
3. **Given** fadiga acima da Constitution, **When** aplicada, **Then** Unconscious por 10 − Con horas e a fadiga volta à Constitution.
4. **Given** Stunned, **When** chega o turno, **Then** o Combat Tracker avisa que não age; gastar Hero Point ou Resource Point remove.
5. **Given** On Fire, **When** o turno acaba, **Then** −1 HP e +1 fadiga; a ação Extinguish Flames pede Dex TN 15.
6. **Given** Blood Loss, **When** o turno acaba, **Then** 1d10; resultado 1 = Dead; Staunch Bleeding pede Medicae TN 20 (30 em esforço); Bio-Foam remove.
7. **Given** um Hero Point, **When** o personagem receberia Dead, **Then** pode queimá-lo (−1 permanente no máximo) e sobreviver fora de combate.
8. **Given** levemente ferido, **When** o Mestre aplica um dia de descanso, **Then** +1 HP (repouso completo: +Con HP); gravemente ferido por semana; com críticos, só com atenção médica, −1 crítico por semana.
9. **Given** Helpless, **When** atacado, **Then** acerto automático e dano rolado duas vezes.

---

### User Story 4 - Combate social, medo e insanidade (Priority: P4)

**Combate social**: iniciativa 1d10 + Fel + Cmp; ataque social (Cha ou Fel + Charm, Command, Deceive,
Intimidation, Performer ou Persuasion) contra a Mental Defense; o alvo derrotado gasta 1 Resolve para resistir ou
cede; no máximo 4 Resolve drenados por cena, depois Jaded; Refute (reação, Wis + Scrutiny ou Int + Lore) soma
metade do total à Mental Defense; Poker Face (+1 reação, +10 Mental Defense); recuperação de Resolve pela manhã
(Cmp TN 10, 1 + 1 por raise). **Medo**: teste de Willpower contra Fear 1–5 (TN 15/20/25/30/35); a falha em combate
rola a Shock Table (1d10 + 1 por check) e aplica o resultado; fora de combate, −1k1 nas perícias e +1d5 Insanity;
"sair do choque" com Willpower contra o mesmo TN no início do turno. **Insanidade**: pontos de Insanity na ficha; a
cada 10, Trauma Test (Wil TN 10 + 1 por 5 pontos) com a tabela de Mental Traumas; a cada 20, um derangement novo ou
agravado (Minor, Severe, Acute); 100 retira o personagem de jogo.

**Why this priority**: completa o capítulo; usa as mesmas peças (iniciativa, reações, condições).

**Independent Test**: ataque social contra Mental Defense 15 que passa → o alvo escolhe gastar Resolve ou ceder;
quinto Resolve na cena → recusado (Jaded); Fear 2 falhado em combate com 2 checks → Shock Table 1d10 + 2 aplicado;
Insanity 18 → 20 pede o derangement e o Trauma Test.

**Acceptance Scenarios**:

1. **Given** um ataque social com Fel + Persuasion contra Mental Defense 15, **When** passa, **Then** o alvo recebe o pedido: gastar 1 Resolve ou ceder.
2. **Given** 4 Resolve já drenados na cena, **When** novo ataque passa, **Then** o alvo fica Jaded e não perde mais.
3. **Given** Refute com total 16, **When** resolvido, **Then** +8 na Mental Defense contra aquele ataque.
4. **Given** Fear 2 (TN 20) falhado em combate com 2 checks, **When** resolvido, **Then** rola 1d10 + 2 na Shock Table e aplica o resultado (condições quando simples).
5. **Given** falha de medo fora de combate, **When** resolvida, **Then** −1k1 nas perícias perto da fonte e +1d5 Insanity.
6. **Given** Insanity passando de 9 para 10, **When** registrada, **Then** o sistema pede o Trauma Test (TN 12) e, na falha, rola Mental Traumas.
7. **Given** Insanity passando de 19 para 20, **When** registrada, **Then** o sistema pede um derangement novo ou agravado.
8. **Given** Insanity 100, **When** registrada, **Then** a ficha avisa que o personagem sai de jogo.

---

### Edge Cases

- **Dodge/Parry no livro**: o texto das ações soma metade do total à Static Defense; a seção de ataque e a tabela-resumo dizem teste oposto que anula o acerto — vale o texto das ações (premissa).
- **Linha do crítico**: o total acumulado de Critical Damage escolhe a linha (1–5) da tabela do tipo e da localização do golpe novo; acima de 5 = morte (premissa; o livro não detalha).
- **Energy/Gizzards 4**: tratado como morte (o texto implica).
- **Resilience 0 ou menos**: conta como 1.
- **Fogo sem localização**: tabela Energy, corpo.
- **Alvo sem ficha DtD** (token de outro tipo): Aplicar recusa com aviso.
- **HP máximo reduzido**: o dano já sofrido fica; o HP atual cai e pode gerar críticos.
- **Condição aplicada a um personagem sem token**: vale na ficha.
- **Minions (squads)**: fora de escopo (ator próprio numa feature futura).

## Requirements *(mandatory)*

### Functional Requirements

**Dano e críticos**

- **FR-001**: O cartão de dano MUST ter **Aplicar** para os alvos marcados (ou tokens selecionados): efetivo = dano − max(0, AP da localização − Pen) (magia: − Aura, sem AP); ≤ 0 sem efeito; HP perdido = efetivo ÷ max(1, Resilience), para baixo (Tearing para cima).
- **FR-002**: O HP além de zero MUST virar Critical Damage acumulado; cada aumento MUST aplicar o efeito da linha min(total, 5) da tabela do tipo e da localização; as 20 tabelas (100 entradas) MUST ser dados com redação própria e automação (condições, fadiga, testes pedidos, morte).
- **FR-003**: Cobertura: o Mestre marca AP de cobertura e localizações cobertas no token; o golpe numa localização coberta passa primeiro pela cobertura, que perde 1 AP quando atravessada.
- **FR-004**: Aplicar MUST registrar no chat a conta completa e permitir desfazer (Mestre); jogador sem permissão sobre o alvo pede ao Mestre.

**Turnos e ações**

- **FR-005**: Iniciativa 1d10 + Dex + Cmp no Combat Tracker, uma vez por combate, com o desempate do livro; Hero Point faz o d10 valer 10; social: Fel + Cmp.
- **FR-006**: A ficha MUST ter o menu das 38 ações de combate (tipo, subtipos, efeito resumido); ações de ataque abrem o diálogo da 007 com o modificador da ação; ações com teste abrem a rolagem certa.
- **FR-007**: O sistema MUST controlar por turno do combate: 1 ação completa ou 2 meias ações diferentes; ações livres uma vez cada; 1 reação por rodada (+ as extras de Full Defense, Fight Defensively, Resource Point); recusas com override do Mestre.
- **FR-008**: Dodge (Dex + Acrobatics) e Parry (Weaponry ou Brawl, perícia k perícia + Level se proficiente, exige arma que apara) MUST somar metade do total à Static Defense contra o ataque do cartão e mostrar se o ataque ainda acerta.
- **FR-009**: Ações defensivas e de risco MUST durar até o próximo turno do personagem como efeitos temporários: Full Defense (+10 SD, +2 reações), Fight Defensively (−1k0 no ataque, +1 reação só para Dodge/Parry), All Out Attack (+2k0, sem reações), Healing Surge (+5 SD).
- **FR-010**: Modificadores de situação MUST estar no diálogo de ataque: Combat Advantage (+1 free raise), alvo correndo, ganging up 2:1/3:1, atirar em corpo a corpo (+2 raises), terreno difícil/árduo, concealment (+5 SD), Prone do alvo.
- **FR-011**: Surpresa: o Mestre marca surpreendidos no início; eles pulam a rodada 1 e dão Combat Advantage.
- **FR-012**: Multiple Attacks MUST exigir duas armas equipadas ou o feat (Swift Attack 2, Lightning Attack 3, Double Tap 2 tiros), aplicar −3k0 por arma com duas armas (menos 1k0 com Ambidextrous, 2k0 com Two Weapon Fighting) e gastar 1 reação por ataque além do primeiro.

**Condições, fadiga, morte, cura**

- **FR-013**: As condições do livro MUST existir como status effects (token e ficha) com os efeitos numéricos automatizados (rolagens, Static Defense, ações permitidas) e os demais como texto.
- **FR-014**: Fadiga: qualquer nível −1k0 em todos os testes; acima da Constitution → Unconscious e a fadiga volta à Constitution.
- **FR-015**: Efeitos de fim de turno MUST ser pedidos no Combat Tracker: On Fire (−1 HP, +1 fadiga), Blood Loss (1d10, 1 = Dead), Pinned (novo teste), Stunned/Dazed com duração em rodadas.
- **FR-016**: Morte (Dead) MUST vir de crítico, falha em "Con TN 20 ou morre", Blood Loss ou sufocamento; queimar um Hero Point (−1 no máximo, permanente) MUST evitar uma morte.
- **FR-017**: O Mestre MUST ter "descanso" (dia/semana, com ou sem repouso completo e atenção médica) que cura conforme o estado do ferimento.

**Social, medo, insanidade**

- **FR-018**: Ataque social contra Mental Defense; o alvo derrotado escolhe gastar 1 Resolve ou ceder; teto de 4 por cena, depois Jaded; Refute e Poker Face como reações/ações sociais; recuperação diária de Resolve.
- **FR-019**: Teste de medo (Fear 1–5) com a Shock Table em combate e o efeito fora de combate; "sair do choque" no início do turno.
- **FR-020**: Insanity na ficha; a cada 10 o Trauma Test com a tabela de Mental Traumas; a cada 20 derangement novo ou agravado (registro na ficha); 100 avisa saída de jogo.

**Geral**

- **FR-021**: Tabelas (críticos, Shock Table, Mental Traumas) MUST ser conteúdo em texto versionado com redação própria (constituição V); todo texto de interface em en e pt-BR.

### Key Entities *(include if feature involves data)*

- **Resultado de dano**: alvo, localização, dano, Pen, tipo, AP/Aura, efetivo, HP perdido, Critical Damage novo.
- **Efeito crítico**: tipo × localização × linha (1–5), texto, automações (condições, fadiga, teste pedido, morte).
- **Condição**: status effect com efeitos numéricos e duração.
- **Ação de combate**: nome, tipo, subtipos, efeito, modificador, rolagem.
- **Estado do turno**: ações e reações gastas na rodada, efeitos até o próximo turno.
- **Estado mental**: Resolve drenado na cena, Jaded, Insanity, derangements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários da US1, HP perdido e Critical Damage batem com a conta do livro.
- **SC-002**: As 100 entradas de crítico, a Shock Table e Mental Traumas conferem com o inventário (conferência automática).
- **SC-003**: Aplicar o dano de um ataque leva no máximo 1 clique depois do cartão de dano.
- **SC-004**: Em 100% dos cenários da US2, ações e reações gastas seguem o limite do turno.
- **SC-005**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Fora de escopo**: minions/squads (ator próprio), veículos e naves, magia (Focus Power, Phenomena) além da Aura contra dano de magia, grapple completo (fica como ação com teste oposto e texto), quedas como automação (texto).
- **HP**: 2 × (Con + Wil) (decisão da 001).
- **Dodge/Parry**: metade do total somada à Static Defense (texto das ações), não teste oposto.
- **Tabela-resumo vs texto**: vale o texto (Aid Another +1k1, Aim completo +2k1, Full Defense +2 reações e +10 SD, Fight Defensively +1 reação).
- **Linha do crítico**: pelo total acumulado (um total por personagem), tabela do tipo e da localização do golpe novo.
- **Medicae**: sem fórmula numérica de cura na 7.7a; "atenção médica" = o Mestre marca no descanso.
- **Cobertura**: marcada pelo Mestre no token (AP e localizações; padrão corpo e pernas).

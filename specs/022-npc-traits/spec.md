# Feature Specification: Traits, ataques especiais, esquadrões, feats e formas de NPC (DtD 7.7a)

**Feature Branch**: `022-npc-traits`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Automatizar o que a 012 deixou como texto nos NPCs: traits (Phasing, Flyer, Quadruped,
Crawler, Auto-Stabilized, Amphibious, Dark Sight, Resource Stat), ataques especiais, ações do Minion Squad no turno,
feats de NPC e forma alternativa, com integração ao mapa (elevação, paredes, visão)."

**Referência de regras**: DtD 7.7a — traits de antagonistas pp. 520–522; blocos dos antagonistas cap. XX
(pp. 523–544); Minion Squads pp. 543–544; concealment p. 433; queda (018); Full Auto Burst e Brace (008/017).
Constituição v1.2.1. Inventário: issues N1–N21.

**Depende de**: 004 (recursos de exaltação), 005 (feats por nome), 007 (armas e qualidades), 008 (turno, condições,
reações), 009 (magia), 012 (NPCs e esquadrões), 017 (templates no mapa, Brace), 018 (queda), 021 (design system).

## Decisões do usuário (2026-10-04)

- Escopo: traits, ataques especiais, ações do Minion Squad, feats de NPC e formas alternativas; integração ao mapa.
- Valores impressos: os multiplicadores dos traits só valem em NPCs sem valor impresso (montados pelo Mestre).
- Ataques especiais: abilities estruturadas; as de ataque do compêndio são convertidas.
- Token: visão e ação de movimento derivadas do ator, sem gravar no token.
- Minion Squad: conjunto próprio de ações com a economia da 008.
- Feats de NPC: só os de efeito em jogo passam a valer; os que mudam valores impressos não geram efeito.
- Formas: estruturadas (Zoanoid Warform e composição do Elemental).
- Phasing: livro + magia afeta normalmente (premissa).
- Voo e escuridão: queda ao cair voando, escuridão +5 SD (Dark Sight ignora), distância com elevação.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traits de movimento e sentidos no mapa (Priority: P1)

Um NPC com **Flyer** tem "voar" como ação de movimento padrão do token e a elevação editável; o deslocamento de voo é
o valor do trait (ou o dobro do deslocamento, sem valor). **Quadruped** dobra e **Crawler** divide o deslocamento a
pé (só em NPCs sem valor impresso) e o Crawler ignora terreno difícil no custo de movimento. **Amphibious** nada no
dobro do deslocamento e respira debaixo d'água (018). **Dark Sight** dá visão no escuro ao token e ignora a
penalidade de escuridão. Tudo vale para tokens já na cena, sem migração.

**Why this priority**: são os traits mais comuns (Dark Sight 9, Crawler 4, Flyer 3) e os que o Mestre vê no mapa.

**Independent Test**: colocar o Dragon (Flyer 22, Dark Sight) numa cena: o token voa por padrão, a elevação muda, a
visão é de visão no escuro; um ataque contra ele com "escuridão" dá +5 SD, e o ataque dele no escuro não sofre.

**Acceptance Scenarios**:

1. **Given** um NPC com Flyer, **When** o token é colocado, **Then** a ação de movimento padrão é voar e o deslocamento de voo é o do trait.
2. **Given** um NPC montado pelo Mestre (sem Speed fixado) com Quadruped ou Crawler, **When** a ficha calcula o deslocamento, **Then** ele é dobrado ou dividido; em NPCs do compêndio o valor impresso não muda.
3. **Given** um Crawler, **When** move por terreno difícil, **Then** o custo não aumenta.
4. **Given** um NPC com Dark Sight, **When** o token é colocado, **Then** ele usa visão no escuro sem limite de alcance.
5. **Given** um ataque com a opção escuridão, **When** o alvo não tem Dark Sight, **Then** o alvo recebe +5 SD; quando o atacante tem Dark Sight, a opção não pesa contra ele.
6. **Given** um token voando, **When** fica Stunned, Unconscious ou Prone, **Then** o sistema oferece o cartão de queda (018) com a altura da elevação e o token volta ao chão.
7. **Given** ataques à distância ou corpo a corpo entre tokens em elevações diferentes, **When** o alcance é medido, **Then** a distância considera a elevação (aviso de fora de alcance).

---

### User Story 2 - Phasing e Auto-Stabilized (Priority: P2)

**Phasing**: o NPC liga ou desliga a condição **Incorpóreo** com meia ação; incorpóreo, o token atravessa paredes
(ação de movimento própria, só para ele), ganha +2 raises em Stealth para se esconder dentro de objetos e só sofre
dano de armas mágicas ou com Power Field; magias o afetam normalmente (premissa). **Auto-Stabilized**: o NPC está
sempre apoiado com armas pesadas e o Full Auto Burst custa meia ação.

**Why this priority**: poucos NPCs (Ghost, Air Elemental, Obliterator), mas sem automação o Phasing não funciona no
mapa.

**Independent Test**: Ghost incorpóreo atravessa uma parede arrastando o token; um ataque com espada comum não causa
dano, uma arma com Power Field causa; o Obliterator faz Full Auto Burst como meia ação com a arma apoiada.

**Acceptance Scenarios**:

1. **Given** um NPC com Phasing, **When** usa a ação de ficar incorpóreo, **Then** gasta meia ação e recebe a condição.
2. **Given** um token incorpóreo, **When** é movido (arrastar, teclado ou script), **Then** paredes não bloqueiam; sem a condição, bloqueiam.
3. **Given** um alvo incorpóreo, **When** sofre dano de arma sem magia nem Power Field, **Then** o dano é zero, com aviso no cartão; o Mestre pode aplicar mesmo assim.
4. **Given** um NPC Auto-Stabilized, **When** ataca com arma pesada, **Then** conta como apoiado; o Full Auto Burst e o Suppressing Fire custam meia ação.

---

### User Story 3 - Ataques especiais de NPC (Priority: P2)

As abilities de ataque passam a ser **estruturadas**: custo de ação, área (cone, explosão, linha) e tamanho, alvo,
teste de resistência (característica ou perícia + TN), dano (parada e tipo), condição e duração, usos por cena. Na
ficha, cada uma tem botão: coloca o template no mapa (017), rola o que houver, posta o cartão com os alvos e botões de
resistência e de aplicar. As do compêndio que são ataques (Mind Blast, Dragon Breath, Frightful Presence, Gauss Weapon,
calor do Fire Elemental, Possession) são convertidas; as demais continuam texto. Frightful Presence dispara na Charge
e no All Out Attack; o calor do Fire Elemental age no começo do turno em quem estiver corpo a corpo.

**Why this priority**: é o que faz um antagonista ser perigoso na mesa.

**Independent Test**: Dragon usa Dragon Breath: template de cone no mapa, cartão com os alvos, cada alvo resiste e o
dano é aplicado; usos por cena descontados.

**Acceptance Scenarios**:

1. **Given** uma ability de ataque com área, **When** usada, **Then** o template é colocado e os tokens dentro viram alvos no cartão.
2. **Given** um teste de resistência, **When** o alvo rola pelo cartão, **Then** sucesso e falha seguem a ability (dano, metade, condição).
3. **Given** usos por cena, **When** esgotados, **Then** o uso é recusado (o Mestre libera).
4. **Given** Frightful Presence, **When** o NPC faz Charge ou All Out Attack, **Then** o cartão de medo é oferecido aos inimigos ao alcance.
5. **Given** o calor do Fire Elemental, **When** começa o turno do Elemental, **Then** quem estiver adjacente recebe o efeito.

---

### User Story 4 - Ações do Minion Squad no turno (Priority: P2)

O esquadrão age com a economia de ações da 008: **mover** (meia ação = TR, completa = 2×TR), **correr**, **um ataque**
corpo a corpo ou à distância por turno (meia ação; alcance 10×TR), sem reações. Os heróis podem usar Dodge ou Parry
contra o ataque do esquadrão. A iniciativa continua 1d10 + TR.

**Why this priority**: completa os esquadrões da 012, que hoje atacam fora do turno.

**Independent Test**: no combate, a vez da Space Pirate Crew mostra as ações; um ataque gasta meia ação, um segundo
ataque é recusado; o herói alvo esquiva pelo cartão.

**Acceptance Scenarios**:

1. **Given** a vez de um esquadrão, **When** ele ataca, **Then** gasta meia ação e não pode atacar de novo no turno.
2. **Given** o ataque de um esquadrão, **When** o alvo é um herói, **Then** o cartão oferece Dodge/Parry.
3. **Given** movimento, **When** o esquadrão move, **Then** meia ação permite TR e ação completa 2×TR.

---

### User Story 5 - Feats, formas e Resource Stat (Priority: P3)

Os feats de NPC com efeito em jogo (Swift Attack, Fearless, Catfall, Weapon Focus, Power Attack e os demais checados
por nome) passam a valer; os que só mudam valores impressos não geram efeito. As **formas alternativas** ficam
estruturadas: cada forma tem características, tamanho, SD/HP/Speed, armadura, traits e armas próprios; um botão troca
de forma pelo custo do livro (Zoanoid: 1 Rage, ação completa; duração editável pelo Mestre). O Elemental escolhe a
composição (Earth, Air, Fire, Water). O **Resource Stat** ganha botões de gastar e recuperar com registro no chat. A
aba Antagonista passa a editar traits, abilities, feats e formas.

**Why this priority**: completa os NPCs do compêndio e permite ao Mestre montar os seus.

**Independent Test**: Zoanoid Heavy troca para Warform gastando 1 Rage: características, armadura e Claw/Bite mudam;
volta à forma normal. Elemental escolhe Air e ganha Phasing.

**Acceptance Scenarios**:

1. **Given** um NPC com Swift Attack, **When** faz ataques múltiplos, **Then** a regra do feat vale como para personagens.
2. **Given** um Zoanoid, **When** troca para Warform, **Then** gasta 1 Rage e uma ação completa, e os valores da forma passam a valer até voltar.
3. **Given** um Elemental, **When** escolhe a composição, **Then** só os efeitos dela valem (Air: Phasing; Water: Regeneration 1; Earth: +6 armadura; Fire: calor).
4. **Given** o Resource Stat, **When** o Mestre gasta ou recupera, **Then** o valor muda e o chat registra.
5. **Given** a aba Antagonista em modo Edição, **When** o Mestre adiciona um trait, uma ability, um feat ou uma forma, **Then** eles passam a valer.

---

### Edge Cases

- NPC com mais de um trait de movimento (Flyer e Crawler, Quadruped e Amphibious): cada ação de movimento usa o próprio deslocamento.
- Trait removido: o token volta a andar e perde a visão no escuro na próxima atualização.
- Token incorpóreo que perde a condição dentro de uma parede: aviso ao Mestre (sem empurrar o token).
- NPC sem cena ativa: as abilities sem área funcionam com o alvo marcado.
- Esquadrão sem minions: não age.
- Valores impressos sobrescritos pelo Mestre: os multiplicadores continuam desligados.
- Forma ativa com armas próprias: ao voltar, as armas da forma saem da lista de ataque.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Flyer MUST tornar "voar" a ação de movimento padrão do token e definir o deslocamento de voo (valor do trait, ou o dobro do deslocamento).
- **FR-002**: Quadruped (×2) e Crawler (÷2) MUST alterar o deslocamento a pé só quando o Speed não estiver fixado; Crawler MUST ignorar o custo extra de terreno difícil.
- **FR-003**: Amphibious MUST dar deslocamento de nado em dobro e manter a imunidade a sufocamento debaixo d'água (018).
- **FR-004**: Dark Sight MUST dar visão no escuro ao token e anular a penalidade de escuridão do atacante.
- **FR-005**: Visão e ação de movimento do token MUST derivar dos traits do ator, sem gravar no token e sem migração.
- **FR-006**: A opção escuridão no ataque MUST dar +5 SD ao alvo (p. 433), exceto contra atacante com Dark Sight.
- **FR-007**: Um token voando que fica Stunned, Unconscious ou Prone MUST receber a oferta de queda (018) pela elevação e voltar ao chão.
- **FR-008**: O alcance entre tokens MUST considerar a elevação, com aviso de fora de alcance.
- **FR-009**: Phasing MUST permitir ligar ou desligar Incorpóreo com meia ação; incorpóreo, o token MUST atravessar paredes por qualquer meio de movimento, ganhar +2 raises em Stealth para se esconder em objetos e só sofrer dano de armas mágicas ou com Power Field (magias normais); o Mestre pode aplicar mesmo assim.
- **FR-010**: Auto-Stabilized MUST contar como apoiado e cobrar meia ação no Full Auto Burst e no Suppressing Fire.
- **FR-011**: Abilities de ataque MUST ter dados estruturados (ação, área, alvo, resistência, dano, condição, duração, usos) e ser usadas pela ficha com template, cartão, resistência e aplicação.
- **FR-012**: As abilities de ataque do compêndio MUST ser convertidas; as demais continuam texto.
- **FR-013**: Frightful Presence MUST disparar na Charge e no All Out Attack; o calor do Fire Elemental MUST agir no começo do turno em quem estiver adjacente.
- **FR-014**: Minion Squads MUST agir com a economia da 008: mover (TR / 2×TR), correr, um ataque por turno (meia ação), sem reações; o alvo herói MUST poder usar Dodge/Parry.
- **FR-015**: Feats de NPC com efeito em jogo MUST valer pelas checagens por nome; os que alteram valores impressos MUST não gerar efeito.
- **FR-016**: Formas alternativas MUST ser estruturadas e trocáveis pelo custo e ação do livro; os dois Zoanoids MUST ganhar os dados que faltam e o Elemental MUST escolher a composição.
- **FR-017**: Resource Stat MUST ter gastar e recuperar com registro no chat; `resource` é a fonte da verdade.
- **FR-018**: A aba Antagonista MUST editar traits, abilities, feats e formas.
- **FR-019**: Recusas MUST poder ser liberadas pelo Mestre (constituição IV).
- **FR-020**: Textos novos MUST existir em inglês e pt-BR; texto próprio nos packs.

### Key Entities

- **Trait de NPC**: chave + valor (012), agora com efeitos no ator, no token e nas regras.
- **Ability de ataque**: ação, área, alvo, resistência, dano, condição, duração, usos.
- **Forma**: nome, características, tamanho, derivados, armadura, traits, armas, custo, ação, duração.
- **Incorpóreo**: condição nova.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Os 8 traits listados têm efeito automatizado (regras e, onde couber, mapa) nos 47 NPCs do compêndio sem mudar nenhum valor impresso.
- **SC-002**: As 6 abilities de ataque do compêndio são usáveis pela ficha do começo ao fim (template, cartão, resistência, aplicação).
- **SC-003**: Um esquadrão faz um turno completo dentro do controle de ações da 008.
- **SC-004**: Os 2 Zoanoids trocam de forma e voltam com todos os valores do livro.
- **SC-005**: Tokens já colocados recebem visão e movimento dos traits sem nenhuma migração.

## Assumptions

- Magias afetam incorpóreos normalmente (o livro não diz).
- A duração do Warform (Con + Feral Heart) usa um valor editável pelo Mestre, porque NPCs não têm Feral Heart.
- O alcance dos minions continua 10×TR (o livro dá 5× e 10×; decisão da 012).
- Teamed minions e companheiros animais ficam fora.
- Penalidades de dados por terreno difícil ficam fora (só o custo de movimento do Crawler).

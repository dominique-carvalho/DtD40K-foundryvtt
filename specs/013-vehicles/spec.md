# Feature Specification: Veículos (DtD 7.7a)

**Feature Branch**: `013-vehicles`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Veículos da DtD 7.7a (cap. XV): ator de veículo completo em combate — stats do livro (Size, Speed, Acceleration, Maneuver, Drive Rating, HP, Resilience, armadura) e SD pela fórmula, Momentum 0–10, tripulação ligada a personagens/NPCs, ações de veículo (Move, Punch It, Skirmish/Barrage com as armas montadas pelo ataque da 007, Evasive Maneuvers, Ramming, Jury Rig, Embark), Control Test (TN 5 × Momentum) com a tabela Out of Control, dano pelo Aplicar da 008 e crítico de veículo a cada 5 ferimentos na cena; montador com orçamento (componentes como itens num compêndio, stats e slots calculados, orçamento conferido; veículos de exemplo prontos); perseguições/corridas, stunt driving e ciclo de reparo."

**Referência de regras**: DtD **7.7a** — cap. XV "Vehicles", pp. 358–385 (stats pp. 358–359; combate e ações
pp. 359–361; terreno, voo, perseguição, stunts pp. 362; pilotagem sem treino, dano, crítico, reparo p. 363; construção
pp. 364–380; exemplos pp. 380–385). Constituição v1.2.1.

**Depende de**: 001 (rolagem), 007 (armas, ataque e dano, Wealth), 008 (Aplicar dano, reações, turno), 011 (Holdings,
Followers, Backing, Wealth como Backgrounds), 012 (NPCs como tripulação).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar componentes e veículos prontos (Priority: P1)

O Mestre abre o compêndio **Vehicle Components** e encontra os componentes do capítulo em pastas (Drivetrains, Frames,
Armor, Control Systems, Accommodations, Accessories, Modifications, Weapons), cada um com custo em VP, slots, efeito em
redação própria e os números que o veículo usa (Drive Rating, perícia de controle, Momentum mínimo de voo; HP e
Resilience do frame; AP; dano, Pen, alcance, RoF e qualidades das armas). O compêndio **Vehicles** traz os 16 veículos
de exemplo prontos.

**Why this priority**: base do montador e dos veículos em jogo.

**Independent Test**: abrir Wheeled Drive (Drive Rating 5, 5 VP, Drive), Standard Frame (10 HP, Res 10, 15 VP), AC/2
(4k2+10 I, Pen 5, 500 m, S/2, Proven 3, 2 slots, 10 VP) e o Basic Ground Vehicle (Size 8, Speed 4, Acc 1, Man 0, Wheeled,
Standard Frame, Armor 3, 50 VP).

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o Mestre abre "Vehicle Components", **Then** há 9 drivetrains, 9 frames, 21 armaduras, 14 controles, 4 acomodações, 30 acessórios, 7 modificações e as armas, em pastas.
2. **Given** "Vehicles", **When** aberto, **Then** há 16 veículos com os stats e armas do livro.
3. **Given** pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Montar um veículo (Priority: P2)

O Mestre (ou um jogador com permissão) cria um veículo, escolhe o **orçamento** (VP pela raridade — 50 Uncommon, 100
Rare, 150 Very Rare, 200 Mythic Rare — ou por Holdings 1–5: 250 a 450), compra os stats base pelas tabelas (Maneuver,
Acceleration, Speed, Size) e arrasta componentes para a ficha. O veículo calcula HP e Resilience do frame, AP da
armadura, Drive Rating e perícia de controle da tração ativa, slots (1 por Size) usados e livres, o custo total em VP e
avisa quando passa do orçamento ou dos slots. Componentes repetíveis contam por quantidade.

**Why this priority**: é como veículos novos entram no jogo; depende do compêndio (P1).

**Independent Test**: montar um carro: orçamento 50, Size 8 (8), Speed 4 (11), Acc 1 (5), Wheeled (5), Standard Frame
(15), Armor 3 (6) = 50 VP; 4 Cargo Space + 4 Passenger Space = 8/8 slots; um componente a mais avisa slots cheios.

**Acceptance Scenarios**:

1. **Given** um veículo novo com orçamento 50, **When** compra os stats e os componentes do carro, **Then** o custo é 50/50 VP e 8/8 slots.
2. **Given** o veículo acima do orçamento ou dos slots, **When** a ficha é aberta, **Then** mostra o excesso em aviso (o Mestre decide).
3. **Given** duas trações, **When** o piloto troca a ativa, **Then** gasta meia ação e o Drive Rating e a perícia mudam.
4. **Given** um veículo do compêndio, **When** aberto, **Then** mostra os valores do livro; se o custo recalculado passa do orçamento impresso, o aviso aparece e os valores do livro continuam.

---

### User Story 3 - Veículo em combate (Priority: P3)

A ficha do veículo mostra a SD (10 − 2 × Size, mais 2 × Speed e 2 × Maneuver com Momentum acima de 0), o Momentum, o
alcance de movimento (Speed × Drive Rating × Momentum) e a tripulação (piloto, artilheiros, engenheiro, passageiros,
arrastados da barra de atores). O piloto usa as ações do veículo pelo turno da 008: **Move** (±1 Momentum, arco de 180°),
**Punch It** (Boost: +1 + Acceleration; Drift: ±1, 360°), **Skirmish** (uma arma montada) e **Barrage** (duas armas),
com a Ballistics/Weaponry/Brawl de quem atira e sem feats nem bônus diversos, dano da arma com o bônus fixo e sem
Força; **Evasive Maneuvers** (reação com Momentum ≥ 1: metade do teste de controle soma à SD contra o ataque);
**Ramming Speed** (XkY+Z em ambos: X = metade do Size, até 10; Y = Momentum; Z = Speed); **Jury Rig** (Tech-Use ou Crafts
TN 20: encerra uma condição ou dá 1 HP temporário +1 por raise, uma vez entre reparos); **Embark/Disembark** (meia
ação). O **Control Test** (perícia de controle + Maneuver, TN 5 × Momentum) falhando rola a tabela Out of Control
(Turn Over: perde HP igual ao Momentum, fica de cabeça para baixo, Momentum 0). O veículo recebe dano pelo Aplicar da
008 (AP e Resilience do veículo; sem Critical Damage; 0 HP = destruído) e, a cada **5 ferimentos na cena**, rola a
tabela de crítico de veículo (motor morto, sistema desligado, parada total, travamento, piloto ferido 1k1, explosão em
1 rodada sem Jury Rig). Sem mexer (nem Move nem Punch It no turno), o Momentum cai a 0.

**Why this priority**: é o uso do veículo em jogo; depende do montador (P2) e da 008.

**Independent Test**: Scorpion Tank com piloto (Drive 3) e artilheiro (Ballistics 3): Move para Momentum 1; Skirmish com
a arma montada; um herói acerta o tanque e o Aplicar desconta a armadura; 5 ferimentos na cena rolam o crítico; Ramming
contra um alvo; Control Test falhado com Turn Over.

**Acceptance Scenarios**:

1. **Given** um carro Size 8, Speed 4, Man 0, **When** Momentum 0, **Then** SD −6; com Momentum 1, SD 2.
2. **Given** Momentum 2 e Move, **When** o piloto sobe 1, **Then** Momentum 3 e alcance Speed × DR × 3 no chat; sem Move nem Punch It no turno, o Momentum cai a 0 no fim do turno.
3. **Given** Punch It Boost com Acceleration 2, **When** usado, **Then** Momentum +3 (até 10), ação completa.
4. **Given** Skirmish com o artilheiro Ballistics 3, **When** atira, **Then** a parada é a do artilheiro sem feats nem bônus do personagem, e o dano soma o bônus fixo da arma sem Força.
5. **Given** um ataque contra o veículo com Momentum ≥ 1, **When** o piloto reage com Evasive Maneuvers, **Then** metade do teste de controle soma à SD contra esse ataque.
6. **Given** Ramming com Size 14, Momentum 3, Speed 4, **When** colide, **Then** 7k3+4 no alvo e no veículo; se o veículo sofre mais ferimentos, fica Out of Control; senão, Control Test.
7. **Given** Control Test falhado, **When** a tabela dá 10, **Then** perde HP igual ao Momentum, fica virado e com Momentum 0.
8. **Given** o quinto ferimento na cena, **When** aplicado, **Then** rola o crítico de veículo e aplica o efeito simples (Momentum 0, só meia ação, sem ações, 1k1 no piloto, explosão pendente).
9. **Given** 0 HP, **When** o dano é aplicado, **Then** o veículo é destruído.
10. **Given** Jury Rig com 2 raises, **When** passa, **Then** +3 HP temporários (uma vez entre reparos).

---

### User Story 4 - Perseguições, stunts e reparo (Priority: P4)

**Perseguição/corrida**: o Mestre abre uma perseguição com os participantes (veículos pelo piloto ou personagens) e o
número de rodadas (4 por padrão); a cada rodada cada um rola a perícia escolhida; quem tira mais avança uma perna;
lidar bem com o obstáculo da rodada dá +2 raises; repetir a mesma perícia dá −2 checks; no fim, quem estiver à frente
vence. **Stunt driving**: com stunt de 2 dados ou mais no Move/Punch It, o piloto escolhe Vault the Curb, Slip By, Pick Up
ou Barrel Roll (reação extra até o próximo turno) no lugar do bônus. **Reparo**: um ciclo leva Size dias; o Chief
Engineer testa Crafts contra Size + HP perdido (sucesso corta pela metade, e de novo por raise); no fim, o veículo
recupera 1k1 por ponto de Wealth, Followers ou Backing dedicado mais os pontos de Crafts do engenheiro; o reparo
completo limpa os HP temporários do Jury Rig e os sistemas desligados.

**Why this priority**: completa o capítulo; depende do combate (P3).

**Independent Test**: corrida de 4 rodadas entre dois pilotos com um obstáculo bem resolvido; Punch It com stunt 2 e
Barrel Roll; reparo de um veículo Size 8 com 6 HP perdidos e engenheiro Crafts 3 com 2 raises e Wealth 2.

**Acceptance Scenarios**:

1. **Given** uma perseguição de 4 rodadas, **When** cada rodada é rolada, **Then** o maior total avança uma perna e o placar aparece no chat; no fim, o vencedor.
2. **Given** um participante que lidou bem com o obstáculo, **When** rola, **Then** +2 raises; repetindo a perícia da rodada anterior, −2 checks.
3. **Given** Punch It com stunt 2, **When** escolhe Barrel Roll, **Then** o veículo ganha uma reação extra até o próximo turno.
4. **Given** reparo de Size 8, 6 HP perdidos, Crafts 3 com 2 raises (TN 14), **When** feito, **Then** 8 dias ÷ 2 ÷ 2 ÷ 2 = 1 dia e recupera 1k1 × (2 + 3).

---

### Edge Cases

- **Veículos do livro fora do orçamento** (9 dos 16 não fecham o VP ou os slots): valores do livro, com aviso.
- **Tabelas embaralhadas no PDF**: as linhas conferidas com a extração em tabela (Out of Control 1–4/5–7/8–9/10).
- **Frames Lightweight Normal/Good** com custo negativo: devolvem VP, como no livro.
- **Cockpit** vem com o frame (sem custo nem slot).
- **Munições especiais e modos de arma** (LBX, HV, Ultra, Maximal, Inferno, Swarm…): componentes da arma, com efeito em texto.
- **Veículo em voo fora de controle**: cai 10/20/50/100 m por rodada; ao bater, Ramming a 10 × Momentum; recuperar com teste TN 25 (texto na ficha e no cartão).
- **Pilotagem sem treino**: perícia básica exige ação completa para o Move; avançada é impossível.
- **Tripulação ausente**: o Mestre rola pela ficha do veículo com as perícias que escolher.
- **Usuário sem permissão**: vê o veículo só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndios**

- **FR-001**: Tipo de item **Componente de veículo** com categoria, custo em VP, slots, repetível, efeito (redação própria) e os números usados pelo veículo (Drive Rating, perícia de controle, Momentum mínimo, voo; HP e Resilience; AP).
- **FR-002**: Armas de veículo como armas da 007 com bônus fixo de dano, escala (Vhcl/Hybrid), slots e custo.
- **FR-003**: Compêndios "Vehicle Components" (em pastas por categoria) e "Vehicles" (16 veículos de exemplo); texto próprio em inglês (constituição V).

**Montador**

- **FR-004**: Tipo de ator **Veículo** com Size, Speed, Acceleration, Maneuver, Momentum, orçamento, componentes e armas embutidos, tração ativa, tripulação e estado (virado, destruído, HP temporários, ferimentos na cena).
- **FR-005**: O veículo MUST calcular HP e Resilience (frame), AP (armadura), Drive Rating e perícia de controle (tração ativa), slots (Size), custo em VP (stats pelas tabelas + componentes × quantidade) e avisar orçamento/slots excedidos.

**Combate**

- **FR-006**: SD = 10 − 2 × Size (+ 2 × Speed + 2 × Maneuver com Momentum > 0); alcance = Speed × Drive Rating × Momentum.
- **FR-007**: Ações do veículo pelo turno da 008: Move, Punch It (Boost/Drift), Skirmish, Barrage, Evasive Maneuvers, Ramming Speed, Jury Rig, Embark/Disembark, trocar de tração; sem Move/Punch It no turno, Momentum 0.
- **FR-008**: Ataques com armas montadas MUST usar a perícia de quem atira sem feats nem bônus diversos, e o dano da arma com o bônus fixo, sem Força.
- **FR-009**: Control Test MUST usar a perícia de controle + Maneuver contra TN 5 × Momentum e, falhando, rolar e aplicar a tabela Out of Control.
- **FR-010**: Dano no veículo MUST usar o Aplicar da 008 com AP e Resilience do veículo, sem Critical Damage; 0 HP = destruído; a cada 5 ferimentos na cena, rolar e aplicar o crítico de veículo.

**Perseguição, stunts, reparo**

- **FR-011**: Perseguição/corrida com rodadas, pernas, bônus de obstáculo (+2 raises), penalidade por perícia repetida (−2 checks) e vencedor.
- **FR-012**: Stunt driving (stunt ≥ 2 no Move/Punch It) com as quatro opções; Barrel Roll dá uma reação extra.
- **FR-013**: Ciclo de reparo com dias, teste do Chief Engineer e HP recuperados; reparo completo limpa HP temporários e sistemas desligados.

**Geral**

- **FR-014**: Textos de interface en e pt-BR; só o dono (e o Mestre) altera e age.

### Tabela de referência

| Categoria | Itens |
|---|---|
| Drivetrains (9) | Wheeled (DR 5, 5), Hover (5, 10), Naval (3, 5), Battleship (1, 5), Walker (4, 10), Tracked (3, 15), VTOL (6, 30, voo, Momentum mín. 1), Aerospace (10, 30, 3), Scramjet (20, 30, 5) |
| Frames (9) | Standard 10/10 (15), 20/11 (60), 30/12 (180); Reinforced 15/11 (40), 25/12 (125), 35/13 (250); Lightweight 5/2 (−75), 10/4 (−25), 20/6 (20) |
| Armor (21) | Armor 0–20 |
| Veículos (16) | Basic Ground Vehicle, Megatruck, Mudskipper, Super Bike, Type-32 RAV, Helicopter, Scorpion Tank, Jumbojet, Super Scramjet, Air Superiority Jet, AV-4 Aerodyne, Ballistic Submarine, Variable Man Machine, Battlemecha, Gunbarge, Bio-Titan |

Orçamento: 50 Uncommon, 100 Rare, 150 Very Rare, 200 Mythic Rare; 250–450 por Holdings 1–5. Out of Control (d10): 1–4
Straight Edge, 5–7 Swerve, 8–9 Wild Stallion, 10 Turn Over. Crítico de veículo (d10): 1 pintura, 2–3 motor (só meia
ação), 4–5 sistema desligado, 6–7 parada total, 8 travamento, 9 piloto 1k1, 10 explosão.

### Key Entities *(include if feature involves data)*

- **Componente**: categoria, custo, slots, números e efeito.
- **Veículo**: stats base, Momentum, orçamento, componentes, armas, tração ativa, tripulação, estado.
- **Tripulante**: papel (piloto, artilheiro com armas, engenheiro, passageiro) e ator.
- **Perseguição**: participantes, perícia, pernas, rodadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes e dos 16 veículos batem com o inventário (custos, slots, stats).
- **SC-002**: Em 100% dos cenários da US3, SD, alcance, Control Test, dano e crítico seguem as pp. 359–363.
- **SC-003**: Uma ação de veículo (mover ou atirar) leva no máximo 2 interações.
- **SC-004**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Maneuver nos testes**: soma ao total do teste de Drive/Pilot (o livro diz "adds").
- **Metades** (Evasive, Ramming) arredondam para baixo.
- **Veículos do livro**: valores impressos (perícia de controle inferida da tração; tripulação não impressa).
- **Flawed**: −10 VP por falha (os exemplos só fecham assim).
- **Stunt driving**: as opções substituem o bônus do stunt; Vault the Curb, Slip By e Pick Up como texto no cartão.
- **Ações do veículo** consomem as ações do piloto na 008.

# Feature Specification: Naves (DtD 7.7a)

**Feature Branch**: `014-ships`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Naves da DtD 7.7a (cap. XVI): combate completo por departamentos (Crew como reserva de dados renovada a cada rodada; ações de Command, Manoeuver, Tactical, Engineering e Arcana rolando com o oficial do departamento — dados rolados da Crew, mantidos pela perícia do oficial; escudos com capacidade/regeneração e disruption; armas e torpedos com o Aplicar; Spelljammer Crit Chart; ramming por classe de casco; boarding; destruição e reparo) no turno da 008; montador com Build Points por Holdings, cascos prontos ou customizado, oficiais, consoles por tipo de slot, escudos, armas e torpedos, com avisos de BP, slots e limites; 6 naves de NPC; extras: viagem pelo Warp, caças e Fighter Bay, bombardeio planetário e hangar de referência com veículos da 013. Sem Crew Quality (o livro não tem regra)."

**Referência de regras**: DtD **7.7a** — cap. XVI "Ships", pp. 386–415 (construção e BP p. 386; cascos pp. 387–391;
casco customizado pp. 392–393; tripulação e oficiais pp. 394–395; consoles pp. 395–396; escudos, armas e torpedos
pp. 397–398; bombardeio p. 410; combate pp. 403–409; reparo e porto p. 410; Warp pp. 411–413; naves de NPC
pp. 414–415). Constituição v1.2.1.

**Depende de**: 001 (rolagem), 007 (Aplicar dano não se aplica: naves têm dano próprio), 008 (turno, iniciativa,
reações), 011 (Holdings, Wealth, Followers como Backgrounds), 012 (NPCs como oficiais), 013 (veículos no hangar).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar componentes e naves prontas (Priority: P1)

O Mestre abre o compêndio **Ship Components** e encontra, em pastas, os 14 cascos padrão e os 4 cascos base
customizáveis, os 12 oficiais, os 34 consoles (Arcana, Command, Engineering, Tactical, Universal), os 5 tipos de escudo
em 4 marks, os 5 padrões de arma e os 7 tipos (modificadores), o Torpedo Tube e os 7 torpedos — cada um com custo em BP,
números usados pela nave e efeito em redação própria. O compêndio **Ships** traz as 6 naves de NPC prontas.

**Why this priority**: base do montador e das naves em jogo.

**Independent Test**: abrir o Steamboat-Class (Escort, 10 BP, Crew 12, Hull 40, Man +0, Acc +0, Speed 6, Sensors +0,
2 consoles universais, 1 arma à frente e 1 atrás), o Lance (7k3, Dis 4, Acc +5, Crit 2, alcance 10, 10 BP, Flexible), o
Photon (7k6, Dis 4, Acc +5, Crit 4, alcance 20, 10 BP) e o Military Cruiser.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o Mestre abre "Ship Components", **Then** há 14 cascos, 4 bases customizáveis, 12 oficiais, 34 consoles, 5 escudos (Mk I–IV), 5 padrões e 7 tipos de arma, o Torpedo Tube e 7 torpedos, em pastas.
2. **Given** "Ships", **When** aberto, **Then** há 6 naves de NPC com casco, oficiais, consoles, escudos e armas.
3. **Given** pt-BR, **When** uma ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Montar uma nave (Priority: P2)

O Mestre (ou um jogador com permissão) cria uma nave e escolhe o orçamento em BP pelo Holdings (1: 50, 2: 85, 3: 130,
4: 185, 5: 250). Escolhe um casco padrão (stats fixos) ou um casco customizado (base por classe mais Customization
Points na tabela do livro: armas à frente e atrás, Crew, Hull, Maneuverability, Acceleration, Speed, Sensors, slots
de console), contrata oficiais (5 primários: Helmsman, Tactical Officer, Chief Engineer, Commanding Officer, Chief
Arcana Officer; secundários e especialistas), liga cada oficial a um personagem ou NPC, e arrasta consoles (só no tipo
de slot certo, universais em qualquer um), escudo, armas (padrão + tipo, à frente ou atrás) e torpedos. A nave calcula
Static Defense (10 + Maneuverability + Acceleration), iniciativa (Sensors + Acceleration + 1d10), BP gasto, slots de
console e de arma usados e livres, e avisa quando passa do orçamento, dos slots ou dos limites da customização.

**Why this priority**: é como as naves entram no jogo; depende do compêndio (P1).

**Independent Test**: Holdings 1 (50 BP): Steamboat (10) + Standard Shield Mk I (5) + Lance Las à frente (10) +
Array Las atrás (10) + 5 oficiais primários (25) = 60 → aviso de 10 BP acima; trocar o Array por nada = 50/50.

**Acceptance Scenarios**:

1. **Given** uma nave com orçamento, **When** casco, escudo, armas e oficiais são somados, **Then** o BP gasto aparece contra o orçamento e o excesso gera aviso (o Mestre decide).
2. **Given** um console Tactical num casco sem slot Tactical livre, **When** arrastado, **Then** ocupa um slot universal se houver; senão, aviso de slots.
3. **Given** um casco customizado Destroyer, **When** compra +5 Hull duas vezes e uma arma à frente, **Then** gasta 1 + 1 + 4 CP de 11 e o casco fica com Hull 65 e 3 armas à frente; comprar além do Upgrade Limit ou do Total Limit gera aviso.
4. **Given** uma nave de NPC do compêndio, **When** aberta, **Then** mostra os valores do livro; diferenças entre o custo impresso e o recalculado aparecem como aviso.
5. **Given** um oficial ligado a um personagem, **When** a nave rola uma ação do departamento, **Then** usa os pontos da perícia desse personagem; sem personagem ligado, o oficial de NPC mantém 4 dados.

---

### User Story 3 - Nave em combate (Priority: P3)

Em combate as naves agem em ordem de iniciativa. No turno da nave: exatamente uma ação de **Manoeuver** (Move, Adjust
Speed, Adjust Heading; Evasive Manoeuvers como reação; Ramming Speed! como ação livre) e no máximo uma ação por
departamento (**Command**: Brace for Impact, Picard Speech, Micromanage, Hail; **Tactical**: Fire Everything, Snipe,
Boarding Party, Deploy Fightercraft, Target Subsystem; **Engineering**: Overcharge Weapons/Shields/Engines, Emergency
Repair; **Arcana**: Active Augury, Spell Jamming, Silent Running, Triage, Restart Shields). Cada ação (menos Command)
compromete de 1 a 10 de **Crew** da reserva da rodada: rola esse número de d10 e mantém os pontos do oficial na
perícia pedida (mínimo 1), somando o stat da nave quando a ação manda (Maneuverability, Acceleration, Sensors). A
reserva volta cheia a cada rodada. Ataques: cada Lance rola sozinho, Arrays no mesmo alvo podem dividir a rolagem;
acerto contra a Static Defense do alvo; dano primeiro no **escudo** (capacidade; zerado, colapsa e o excesso se perde;
Disruption acumula e anula Regeneration), depois no **Hull**, com uma rolagem na **Spelljammer Crit Chart** por acerto
(+ Crit da arma). Hull 0 = a nave explode com todos a bordo. O escudo regenera no início de cada turno da nave.

**Why this priority**: é o uso da nave em jogo; depende do montador (P2) e do turno da 008.

**Independent Test**: duas naves (Thresher e Sultana) com oficiais: Move; Fire Everything com Lance Las (8 Crew,
Tactical Officer Ballistics 3 → 8k3 + Acc 5 contra SD 25); dano 7k3 no escudo Mk I (75) e Disruption 4; escudo zerado
em outro acerto, excesso perdido; acerto sem escudo tira Hull e rola crítico; Emergency Repair dá Hull temporário;
Ramming Speed! de um Destroyer causa 3k3 nos dois.

**Acceptance Scenarios**:

1. **Given** uma Sultana (Man +5, Acc +10), **When** a ficha abre, **Then** SD 25 e iniciativa Sensors + Acc + 1d10.
2. **Given** a vez da nave, **When** o jogador tenta duas ações de Manoeuver ou duas do mesmo departamento, **Then** a segunda é recusada (override do Mestre).
3. **Given** Crew 16 e 8 comprometidos no Fire Everything, **When** outra ação pede 10, **Then** só restam 8; na rodada seguinte a reserva volta a 16.
4. **Given** um acerto de Lance (7k3, Dis 4) num escudo Standard Mk I (75), **When** aplicado, **Then** o escudo perde o dano e ganha 4 de Disruption; na regeneração seguinte recupera 10 − 4 = 6.
5. **Given** um acerto com escudo já em 0, **When** aplicado, **Then** o Hull perde o dano e rola a Crit Chart com o Crit da arma; os efeitos da tabela ficam na nave até o reparo.
6. **Given** Hull 0, **When** o dano é aplicado, **Then** a nave é destruída.
7. **Given** Evasive Manoeuvers com Crew ainda livre, **When** a nave é atacada, **Then** metade do teste (Pilot + Maneuverability) soma à SD contra esse ataque.
8. **Given** Boarding Party a 1 VU, **When** cada rodada começa, **Then** os dois lados comprometem até 10 Crew num teste oposto e o perdedor perde metade do que comprometeu + 1 por check (até 10), até um lado vencer.
9. **Given** o fim do combate ou uma cena nova, **When** acontece, **Then** Crew temporária (Triage) e bônus da rodada somem; perdas de Crew por crítico continuam até o reparo.

---

### User Story 4 - Warp, caças, bombardeio, hangar e reparo (Priority: P4)

**Warp**: com Spelljamming helm, Geller Field e Navigator (1 ponto em Divination), o Mestre conduz a viagem em 3
passos: abrir o portal (Arcana TN 20, automático perto de um Portal Relay), traçar o curso (Arcana + Wisdom + Sensors TN
25; falha −10 no passo 3, sucesso +5 por raise), conduzir (Pilot contra o TN da tabela de distância; tempo em dobro
sem Relay; sucesso rola 1 encontro e cada 2 raises cortam o tempo pela metade; falha rola com +2, e 2+ checks tiram a
nave do curso); os encontros e os encontros perigosos são rolados e mostrados. **Caças**: com Fighter Bay, Deploy
Fightercraft transforma 1–10 Crew num esquadrão (SD 25, Hull 1 cada, Speed 10, alcance 5) que ataca com dados = caças e
mantidos = Ballistics do Tactical Officer; a Crew volta ao docking. **Bombardeio**: teste TN 30 contra um alvo em solo;
erro espalha 1k1 km + 1k0 por "call" do teste falho (tratado como check); área destruída e onda de choque de 3 km com 10k5+30 X (torpedos alteram). **Hangar**:
veículos da 013 arrastados para a nave ficam listados como embarcados, com link para a ficha. **Reparo**: reparo de
campo (Crafts TN 25 por estoque de suprimentos: 1k1 de Hull + 1k1 por raise e conserta componentes e críticos) e
serviços de porto.

**Why this priority**: completa o capítulo; depende do combate (P3).

**Independent Test**: viagem "Moderate" (TN 20) com um Relay, curso com 1 raise (+5), condução com 2 raises: tempo
1d10 dias ÷ 2 e 1 encontro rolado; deploy de 6 caças e um ataque 6k3; bombardeio falho com 2 checks espalhando
1k1 + 2k0 km; um Scorpion Tank no hangar; reparo de campo com 1 raise recuperando 2k2 de Hull e limpando os críticos.

**Acceptance Scenarios**:

1. **Given** uma nave sem Navigator, **When** tenta a viagem pelo Warp, **Then** o sistema avisa que falta um requisito (o Mestre pode seguir).
2. **Given** o passo 3 com sucesso e 2 raises, **When** rolado, **Then** o tempo é cortado pela metade e 1 encontro é rolado na tabela.
3. **Given** Deploy Fightercraft com 6 Crew, **When** usado, **Then** surge um esquadrão de 6 caças e a reserva perde 6 até o docking.
4. **Given** um bombardeio falho, **When** rolado, **Then** o cartão mostra a direção e a distância do desvio e o dano da onda de choque.
5. **Given** um veículo arrastado para a nave, **When** a ficha é aberta, **Then** aparece no hangar com link; removê-lo não apaga o veículo.
6. **Given** reparo de campo com sucesso, **When** feito, **Then** recupera Hull e limpa componentes desligados e efeitos de crítico.

---

### Edge Cases

- **Limites da customização contra os cascos base** (o Battleship base já passa de 4 Forward, 26 Crew, 110 Hull): aviso, não bloqueio.
- **Limite "4 não universais"** abaixo das bases Cruiser (5) e Battleship (6): aviso.
- **Custo impresso das naves de NPC** = soma das partes + 25 BP (os 5 oficiais primários, dedução): mostrado com aviso se a soma diferir.
- **Crew Quality**: sem regra no livro; fora do montador e registrado em pendências.
- **Resilient Mk III com a mesma capacidade do Mk II** (provável erro): valores do livro, nota no item.
- **Alcance "Half"/"Double" e dano dos caças (metade do esquadrão)**: arredondar para baixo, mínimo 1.
- **Multiphasic**: cada camada tem capacidade e regeneração próprias; a Disruption vale para a camada atingida.
- **Recarregar torpedos em combate**: impossível sem console específico; o tubo guarda até 5.
- **Tripulação com crítico em slot vazio** (console desligado sem console): o efeito é ignorado com nota.
- **Oficial sem personagem ligado**: NPC com 4 dados mantidos.
- **Boarding usa "Melee"**: tratado como Weaponry.
- **Usuário sem permissão**: vê a nave só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndios**

- **FR-001**: Tipo de item **Componente de nave** com categoria (casco, base customizável, oficial, console, escudo, arma, tipo de arma, torpedo, tubo), custo em BP, números usados pela nave e efeito em redação própria.
- **FR-002**: Compêndios "Ship Components" (pastas por categoria e tipo de console) e "Ships" (6 naves de NPC); texto próprio em inglês (constituição V).

**Montador**

- **FR-003**: Tipo de ator **Nave** com orçamento por Holdings, casco (padrão ou customizado com Customization Points), oficiais ligados a personagens/NPCs, consoles, escudo, armas à frente/atrás, torpedos, hangar e estado (Crew da rodada, Hull, Hull temporário, escudo, Disruption, críticos, componentes desligados).
- **FR-004**: A nave MUST calcular Static Defense, iniciativa, BP gasto contra o orçamento, slots de console por tipo (universal aceita qualquer console) e de arma, e avisar orçamento, slots e limites da customização excedidos, sem bloquear.

**Combate**

- **FR-005**: Turno da nave pelo turno da 008: uma ação de Manoeuver obrigatória e no máximo uma ação por departamento; reações (Evasive Manoeuvers) e ação livre (Ramming Speed!).
- **FR-006**: Ações de nave MUST rolar Crew comprometida (1–10) e manter os pontos do oficial do departamento na perícia pedida (mínimo 1; NPC 4), com o stat da nave quando indicado; Command rola a perícia do Captain sem Crew.
- **FR-007**: A reserva de Crew MUST voltar ao máximo a cada rodada; perdas por crítico reduzem o máximo até o reparo; Crew temporária (Triage) é gasta primeiro e some no fim da cena.
- **FR-008**: Ataques MUST seguir a sequência do livro (alvos em alcance e arco, rolagens por Lance ou grupo de Arrays, Acc, SD do alvo), dano no escudo antes do Hull, Disruption, colapso, crítico por acerto no Hull com o Crit da arma, destruição em 0.
- **FR-009**: Escudo MUST regenerar no início do turno da nave menos a Disruption acumulada; colapsado não regenera até Restart Shields.
- **FR-010**: Efeitos da Crit Chart MUST ficar na nave (Crew perdida, sensores −20, console desligado, sem Command, sem Overcharge, sem armas, à deriva, +2 nos críticos) até o reparo.
- **FR-011**: Ramming (2k2/3k3/4k4/5k5 por classe) em ambos, Boarding Party por rodadas e ações de Engineering/Arcana/Command com seus efeitos simples automatizados.

**Extras**

- **FR-012**: Viagem pelo Warp em 3 passos com requisitos, tabela de tempo/TN, modificadores entre passos, encontros e encontros perigosos rolados.
- **FR-013**: Caças: esquadrão criado pela Crew comprometida, ataque e movimento, docking devolvendo a Crew.
- **FR-014**: Bombardeio planetário com TN 30, desvio e dano da onda (com as variações dos torpedos).
- **FR-015**: Hangar com veículos da 013 embarcados (lista e link), sem regra de capacidade.
- **FR-016**: Reparo de campo e serviços de porto; o reparo limpa críticos e componentes desligados.

**Geral**

- **FR-017**: Textos de interface en e pt-BR; só o dono (e o Mestre) altera e age.

### Tabela de referência

| Categoria | Itens |
|---|---|
| BP por Holdings | 1: 50 · 2: 85 · 3: 130 · 4: 185 · 5: 250 |
| Cascos (14) | Escort: Steamboat (10), Sultana (20), Wanderer (20), Endurance (20); Destroyer: Thresher (30), Majestic (30), Monitor (25), Cole (40), Graff Spree (45); Cruiser: Bismark (60), Essex (50), Borealis (50); Battleship: Belle (75), Bounty (75) |
| Bases customizáveis (4) | Escort 25 BP/10 CP, Destroyer 50/11, Cruiser 65/12, Battleship 85/8 |
| Oficiais (12) | Primários: Helmsman, Tactical Officer, Chief Engineer, Commanding Officer, Chief Arcana Officer; secundários: Chief Medical Officer, Chief Communications Officer, Chief of Security; especialistas: Chaplain, Rogue Trader (15), Navigator, Chief Cook (demais 5 BP) |
| Consoles (34) | Arcana 7, Command 6, Engineering 7, Tactical 8, Universal 6 |
| Escudos (5 × 4) | Standard, Covariant, Regenerative, Resilient, Multiphasic; Mk I 5, Mk II 20, Mk III 35, Mk IV 50 BP |
| Armas | Padrões: Heavy Lance, Heavy Array, Lance, Array, Turret; tipos (7): Las, Melta, Plasma, Orgone, Driver, Positron, Antimeson |
| Torpedos (7) + tubo | Micro, Photon, Monopole, Quath, Cruise, High-Act, Rift; Torpedo Tube 5 BP (5 torpedos) |
| Crit Chart | 14 linhas (≤0 a 13+) |
| Naves de NPC (6) | Civilian Escort (50), Military Escort (85), Destroyer (130), Transport Cruiser (130), Military Cruiser (185), Battleship (250) |

### Key Entities

- **Componente de nave**: categoria, custo em BP, stats do casco ou efeito, tipo de slot (consoles), arco e perfil (armas e torpedos).
- **Nave**: orçamento, casco e customização, oficiais, componentes embutidos, hangar, estado de combate.
- **Oficial**: posto, departamento, ator ligado (ou NPC 4 dados).
- **Esquadrão de caças**: número de caças, Crew de origem, perfil.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Os compêndios têm 100% dos cascos, oficiais, consoles, escudos, armas, torpedos e naves de NPC do capítulo, com os números do livro.
- **SC-002**: Montar uma nave do zero até o orçamento leva menos de 10 minutos, e o BP e os slots conferem com a conta à mão em todos os casos de teste.
- **SC-003**: Uma rodada de combate entre duas naves (manobra, um ataque, dano no escudo e no Hull, crítico) é resolvida só pela ficha e pelos cartões, sem conta à mão.
- **SC-004**: Uma viagem pelo Warp completa (3 passos e encontro) é resolvida em menos de 2 minutos de mesa.
- **SC-005**: Nenhum texto dos compêndios repete 6 palavras seguidas do livro.

## Assumptions

- **Crew Quality** fica de fora (sem regra na 7.7a); pendência registrada.
- A reserva de Crew é por rodada; perdas por crítico são permanentes até o reparo.
- O custo das naves de NPC inclui os 5 oficiais primários (+25 BP), dedução do inventário.
- Chaplain e Rogue Trader tratados como especialistas; os nomes de Security seguem "Chief of Security".
- "Melee" do Boarding = Weaponry; o passo 3 do Warp é rolado pelo Helmsman; bombardeio usa Ballistics do Tactical Officer.
- Enhanced Sensors soma +5 aos Sensors; só Hardened Armor pode ser instalado mais de uma vez.
- Ramming Prow soma +2 aos críticos do ramming além do +3 base.
- O "1d10 hit points" do Chief Medical Officer se aplica a personagens (ferimentos), não ao Hull.
- Serviços de porto ficam como texto e cálculo simples de custo; comércio (Freelance Market, Rogue Trader) em texto.
- Veículos a bordo: sem regra no livro; o hangar é só referência, com as opções do livro (shuttle bay, Drop Pods até Size 30, Assault Shuttles, Teleportarium) em texto.
- O combate de naves usa escala própria (VU, Hull, escudo); personagens não sofrem dano de arma de nave pelo Aplicar da 008 (texto).

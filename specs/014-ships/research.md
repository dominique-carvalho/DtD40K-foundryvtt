# Research — 014-ships

Data: 2026-09-28. Fontes: código da `main` com a 013 (veículos: tipo de item próprio, ator com `TypeDataModel`,
montador por drop com avisos, cartões de chat e `CHAT_ACTIONS`; turno, iniciativa e recusa com override do Mestre da
008; Aplicar pessoal da 008 para o bombardeio), Foundry **13.351** e o inventário do cap. XVI da 7.7a (scratchpad
`ch-ships-inventory.json`: 14 cascos, 4 bases e a tabela de customização, 12 oficiais, 34 consoles, 5 × 4 escudos,
5 padrões e 7 tipos de arma, tubo e 7 torpedos, 23 ações, Crit Chart de 14 linhas, tabelas do Warp, 6 naves de NPC,
45 issues; texto próprio com 6-gramas = 0).

## R1. Componentes de nave

- **Decision**: Item `shipComponent` com `category` (`hull | customHull | officer | console | shield | weapon |
  weaponType | torpedoTube | torpedo`), `cost` (BP), `hull { class, crew, hullStrength, maneuverability, acceleration,
  speed, sensors, consoles { arcana, command, engineering, tactical, universal, nonUniversal }, weapons { forward, rear },
  customizationPoints }`, `officer { post, department, rank: primary|secondary|specialty, skill, actorUuid }`,
  `console { type }`, `shield { type, mark, capacity, regen, layers }`, `weapon { pattern, kind: lance|array, dam, dis,
  acc, crit, range, arc, typeKey, mount: forward|rear }`, `torpedo { dam, dis, acc, crit, range, arc }`, `tube
  { mount, capacity }`, `quantity`, `effect`, `automation` (livre), `description`, `source`.
- Os 7 tipos de arma entram no compêndio como referência (`weaponType`); na nave, o tipo é um campo da arma (R3).
- Pack `ship-components` em pastas: Hulls, Custom Hulls, Officers, Arcana/Command/Engineering/Tactical/Universal
  Consoles, Shields, Weapons (padrões e tipos), Torpedoes (tubo e torpedos).
- **Alternatives**: um tipo de item por categoria — rejeitado; a 013 mostrou que um tipo com `category` basta.

## R2. Ator `ship`

- **Decision**: `ShipData` (TypeDataModel): `budget { holdings }` (1–5), `custom { upgrades { forwardWeapon, rearWeapon,
  crew, hullStrength, maneuverability, acceleration, speed, sensors, universalConsole, nonUniversalConsole },
  nonUniversal { arcana, command, engineering, tactical } }`, `hull { value, temp }`, `crew { lost, temp, committed,
  committedRound, deployed }`, `shield { value, disruption, collapsed, layers[] }`, `state { destroyed, crits[],
  disabled[], adrift, silentRunning, jamming, braced, overcharge {…}, surprised }`, `hangar [vehicleUuid]`,
  `printed { cost }`, `description`, `source`.
- Derivados (`prepareDerivedData`, com regras puras): stats do casco (padrão, ou base + customização) + consoles
  (Hardened Armor +10 Hull cada, Large Engine Core +2 Speed/+5 Acc, Thrust Vectoring +5 Man, Enhanced Sensors +5
  Sensors, Rating Quarters +2 Crew), `staticDefense` = 10 + Man + Acc, `initiativeBonus` = Sensors + Acc, `crew.max`
  = Crew do casco + bônus − perdidos, `crew.available` na rodada, `shield.max`/`regen` (+10 com Improved Shields),
  `bp { spent, budget }`, `slots { consoles por tipo, weapons { forward, rear } }`, `warnings` (BP, slots, limites
  da customização, oficiais primários ausentes, Navigator ausente), `officers` por departamento com os dados mantidos.
- **Rationale**: nave não tem características nem perícias; os números vêm do casco e dos componentes.

## R3. Perfil das armas

- **Decision**: `weaponProfile(pattern, type)`: dano soma `XkY` dos dados rolados; Dis, Acc e Crit somam; alcance
  "Half" = ⌊alcance/2⌋ (mín. 1) e "Double" = 2 × alcance; custo soma, mínimo 5 BP; Dis mínimo 0. Ex.: Heavy Lance +
  Plasma = 10k4, Dis 5, Acc −5, Crit 4, alcance 20, 20 BP (igual à Heavy Plasma Lance da nave de NPC).
- Arco: `Fixed` só na direção da montagem (frente ou trás), `Flexible` frente/trás e lados da montagem, `Omni` qualquer.
  O arco é texto na ficha e no cartão; o mapa não é conferido (o Mestre decide).

## R4. Turno e ações da nave

- **Decision**: a nave é o combatente. `DtdCombatant._getInitiativeFormula` para `ship` = `1d10 + @initiativeBonus`;
  `squadron` = `1d10`. O estado do turno da nave fica no Combatant (`flags.dtd40k.shipTurn { round, manoeuver,
  departments[], reactions }`), com a mesma recusa com override do Mestre da 008: uma Manoeuver por turno
  (obrigatória — aviso no fim do turno se faltou), uma ação por departamento, reações (Evasive) pela quantidade de
  reações do Helmsman (1 se NPC).
- **Crew**: cada ação (menos Command) compromete 1–10 da reserva; a reserva é `crew.max + crew.temp − committed −
  deployed` e volta cheia quando a rodada muda (`committedRound`). Crew temporária (Triage) é gasta primeiro e some no
  fim do combate/cena.
- **Rolagem**: `shipPool({ crew, kept, stat })` = `crew k max(1, kept)` + stat da nave (Maneuverability, Acceleration,
  Sensors) como bônus fixo; `kept` = pontos do oficial ligado na perícia da ação, 4 para oficial NPC; sem oficial no
  posto: 1 dado mantido (aviso). Command rola `actor.rollSkill` do Captain (NPC: 4 de perícia e 4 de característica).
- Ações e efeitos automatizados (`SHIP_ACTIONS` em `rules/ship.mjs`): Move/Adjust Speed/Adjust Heading (texto do
  movimento no cartão; Adjust Speed só muda o movimento do turno), Evasive (reação com Crew livre: metade do teste
  soma à SD contra o ataque; compromete a Crew rolada), Ramming Speed!, Brace for Impact (−1 nos críticos da rodada,
  −1 por 2 raises), Picard Speech (+1 dado mantido em todos os departamentos na rodada, 1× por sessão), Micromanage
  (+1k0 num departamento, +1k0 por 2 raises), Hail (texto), Fire Everything, Snipe (+2 na SD por VU além do alcance),
  Boarding Party, Deploy Fightercraft, Target Subsystem (desliga o componente alvo), Overcharge Weapons (+1k1 no próximo
  ataque, +1k0 por 2 raises), Overcharge Shields (regenera já, +1d10 por 2 raises), Overcharge Engines (texto + meia
  Speed extra), Emergency Repair (1d10 Hull temporário, +1d10 por 2 raises, não acumula; ou limpa um efeito contra o TN
  dele), Active Augury (revela 1 detalhe + 1 por 2 raises no cartão), Spell Jamming (estado no alvo até ele superar),
  Silent Running (estado com o total), Triage (1 Crew temporária + 1 por 2 raises), Restart Shields (Cycle ou Reboot).

## R5. Ataques e Aplicar de nave

- **Decision**: diálogo de ataque (Fire Everything / Snipe / Target Subsystem): armas marcadas, Crew por rolagem (até
  10), agrupamento de Arrays no mesmo alvo (menor Acc do grupo), alvo pelo token alvo. Cada rolagem é um cartão
  (`flags.dtd40k.shipAttack`) com o total contra a SD do alvo (+ Evasive); acerto habilita "Rolar dano" (Overcharge,
  Weapon Capacitor, Targeting Computer +5 no ataque). O cartão de dano (`flags.dtd40k.shipDamage { total, dis, crit,
  targetSubsystem }`) tem "Aplicar em nave": escudo primeiro (excesso perdido ao colapsar; Disruption soma se o escudo
  ficou de pé), depois Hull temporário, depois Hull com uma rolagem na Crit Chart (1d10 + Crit da arma + modificadores
  da nave); Hull 0 = destruída. Desfazer do Mestre restaura o estado.
- **Regeneração**: no início do turno da nave, `regen − disruption` (mín. 0); colapsado não regenera; Multiphasic tem
  camadas com capacidade própria — a regeneração vai para a camada de cima, e a Disruption vale para a camada atingida.

## R6. Crit Chart e estado

- **Decision**: `SHIP_CRIT` (14 linhas, ≤0 a 13+) com efeito próprio e mecânica: Crew perdida (máximo reduzido até
  Recruit Crew), console desligado (escolhido pelo atacante no diálogo; aleatório se o Mestre preferir), Radiation Leak
  (−1 Crew no fim de cada rodada), Sensors −20, sem Overcharge, sem Command, sem Adjust Heading/Evasive, Hull extra,
  sem armas, à deriva, +2 nos críticos seguintes, Secondary Explosion (Hull e Crew extras e nova rolagem). Modificadores:
  Brace, Reinforced Bulkheads −3, Hull Breached +2, Ramming Prow +2 no alvo, Tenebro-Maze (rola duas, o Captain escolhe).
- Efeitos ficam em `state.crits` até Emergency Repair (contra o TN do efeito, o próprio dano) ou reparo.

## R7. Caças

- **Decision**: ator `squadron` (`SquadronData`: `count` 1–10, `shipUuid`, SD 25, Hull 1 por caça, Speed 10, alcance 5).
  Deploy Fightercraft (Tactical) cria/atualiza o ator do esquadrão da nave, põe o token ao lado da nave e move a Crew
  para `crew.deployed`. Ataque do esquadrão: `count k (Ballistics do Tactical Officer)` contra a SD; dano `XkX` com X =
  ⌊count/2⌋ (mín. 1), sem Dis e sem Crit. Cada acerto em um esquadrão derruba 1 caça. Docking (botão na nave ou no
  esquadrão) devolve a Crew dos caças restantes; caças derrubados viram Crew perdida.

## R8. Ramming e boarding

- **Ramming Speed!**: teste Pilot + Maneuverability contra a SD do alvo; dano por classe (Escort 2k2, Destroyer 3k3,
  Cruiser 4k4, Battleship 5k5) nos dois, crítico +3; Ramming Prow: +1k1, sem dano próprio, +2 no crítico do alvo
  (total +5). Grappler Arms troca o dano por Grapple (texto).
- **Boarding Party**: alcance 1 VU (3 com Assault Shuttles, 5 com Teleportarium e alvo sem escudo); estado de abordagem
  num cartão (`flags.dtd40k.boarding`); a cada rodada os dois lados comprometem até 10 Crew num teste oposto de
  Weaponry (o "Melee" do livro) — atacante com o oficial enviado, defensor com o Chief of Security (+2 raises no
  sucesso) e Murder Servitors (+5 Crew de defesa); o perdedor perde ⌊comprometido/2⌋ + 1 por check (máx. 10).

## R9. Viagem pelo Warp

- **Decision**: cartão de viagem (`flags.dtd40k.warp`) com os 3 passos em botões: requisitos (helm, Geller Field,
  Navigator com 1+ em Divination) avisados; passo 1 Arcana TN 20 (automático com Portal Relay); passo 2 Navigator
  Arcana + Wisdom + Sensors TN 25 (falha −10, sucesso +5 por raise no passo 3); passo 3 Helmsman Pilot contra o TN da
  distância (tempo em dobro sem Relay; sucesso: 1 encontro e cada 2 raises dividem o tempo; falha: encontro com +2;
  2+ checks: fora do curso). Encontro 1d10 + modificadores (Chaplain −1, Warpsbane Hull −2, Ancient Spelljamming Helm
  +2 e tempo ÷ 2, falha +2); 11+ rola a tabela de encontros perigosos (1d5) com subtabelas.
- **Alternatives**: RollTables no compêndio — rejeitado; as tabelas têm modificadores e subtabelas, ficam em
  `rules/ship.mjs` como na 013.

## R10. Bombardeio

- **Decision**: botão da ficha: Tactical com Crew e Ballistics do Tactical Officer contra TN 30; erro desvia em direção
  aleatória 1k1 km + 1k0 por check; cartão de dano pessoal (Aplicar da 008) 10k5+30 X na onda de 3 km; torpedos
  alteram (Micro 1 km e 8k4; High-Act desvio rolado duas vezes; Rift área dobrada e incursão; Cruise alcança planetas
  internos) — escolha do torpedo no diálogo.

## R11. Hangar, reparo e porto

- **Hangar**: `hangar` lista uuids de veículos da 013 arrastados para a ficha, com link; remover não apaga o veículo;
  as opções do livro (shuttlebay básico, Drop Pods até Size 30, Assault Shuttles, Teleportarium, Partial Wing) aparecem
  em texto.
- **Reparo de campo**: Chief Engineer Crafts TN 25 uma vez por estoque de suprimentos (flag `suppliesUsed` até
  Resupply): 1k1 Hull + 1k1 por raise e limpa críticos e componentes desligados.
- **Porto**: botões do Mestre Full Repair (Hull cheio, limpa tudo), Recruit Crew (zera `crew.lost`), Resupply
  (torpedos cheios, suprimentos); o tempo por Background (Wealth/Backing/Followers) aparece da tabela do livro.

## R12. Naves de NPC e oficiais

- **Decision**: as 6 naves de NPC como Actors `ship` com casco, consoles, escudo, armas (Heavy Plasma Lance derivada) e
  os 5 oficiais primários NPC (4 dados mantidos); `printed.cost` com o custo do livro (partes + 25 BP dos oficiais).
- Oficiais: um item `officer` por posto, com `actorUuid` opcional (drop de personagem/NPC sobre o oficial na ficha).
  Perícia por departamento: Navigation/Helmsman Pilot, Tactical Ballistics, Engineering Tech-Use (Crafts no reparo),
  Arcana Arcana (Medicae no Triage), Command Command.

## R13. Resolução das issues do inventário

| Issue | Decisão |
|---|---|
| 1 Crew Quality | Fora (spec); pendência |
| 2 SD não impressa | Derivada 10 + Man + Acc |
| 3 Holdings 0 ou 6+ | Orçamento 0 com Holdings 0; acima de 5 usa 250 (aviso) |
| 4, 5, 14, 17, 18, 21, 37, 39 | Valores do modo tabela (inventário) |
| 6 Limites totais | Teto do valor final; aviso (spec) |
| 7 "4 não universais" | Aviso quando o total passa de 4 (spec) |
| 8 Distribuição dos não universais | Livre por tipo (campo `custom.nonUniversal`) |
| 9 Perícia de cada oficial | Por departamento (R12) |
| 10 Chaplain/Rogue Trader | Especialistas |
| 11 1d10 do Chief Medical Officer | Personagens (texto) e Crew (+1d10 temporária no fim da viagem) |
| 12 Chief Security Officer / Astropath | "Chief of Security"; Astropath em texto |
| 13 Posto crítico vazio | Aviso; sem Navigator a viagem pelo Warp avisa; sem Chief Engineer o reparo de campo avisa |
| 15 Resilient Mk III | Valores do livro com nota |
| 16 Multiphasic | Camadas próprias (R5) |
| 19 Half/Double | ⌊/2⌋ mín. 1, ×2; custo mín. 5 |
| 20 Heavy Array | Arco Fixed do livro; nota |
| 22, 23 Torpedos | Tubo guarda 5; custo compra 5 ogivas; recarga só em Resupply ou com Arsenal (estoque +10) |
| 24 Enhanced Sensors | Soma +5 |
| 25 Repetição | Só Hardened Armor repete; os demais avisam |
| 26 Navigation | = Manoeuver |
| 27 Crew | Por rodada; perdas até Recruit Crew (spec) |
| 28 Características | Não entram nas ações de nave; Command usa `rollSkill` normal |
| 29 Adjust Speed | Só o movimento do turno |
| 30 Evasive | Compromete a Crew rolada (1–10) |
| 31 Ramming Prow | +2 além do +3 (total +5) |
| 32 Melee | Weaponry |
| 33 Boarding | Dados mantidos do oficial enviado; volta quando a abordagem termina |
| 34 Silent Running / Spell Jamming | Total do teste vira o TN/oposição |
| 35 Caças | R7 |
| 36 Sem crítico no escudo | Como o livro |
| 38 Bombardeio | Ballistics com Crew; "X" = tipo Explosive |
| 40 Reparo de campo | Uma vez por Resupply |
| 41 Passo 3 | Helmsman; modificador do passo 2 aplicado |
| 42 Encontros | 1d10 + modificadores; testes de Con/Composure como teste de característica |
| 43 Custo das naves de NPC | `printed.cost`; aviso se diferente |
| 44 Heavy Plasma Lance | Derivada (R3) |
| 45 Texto do Thresher | Irrelevante para regras |

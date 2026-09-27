# Feature Specification: NPCs e Minions (DtD 7.7a)

**Feature Branch**: `012-npcs-minions`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Antagonistas da DtD 7.7a (cap. XX): tipo de ator NPC com o bloco do livro (características, perícias, Speed, Size/Resilience, SD, HP, armadura, feats, gear, Level), ataques como armas embutidas reusando ataque/dano/Aplicar, condições e turno da 007/008; os 20 traits, automatizados onde é simples (Armor Plating, Aura, Daemonic, Machine, Regeneration no turno, Fear para o Fear Test, Amorphous, Mindless, Caster com escolas, Undead/Stuff of Nightmares, Flyer/Quadruped/Crawler) e os demais como texto; compêndio Antagonists com as 47 fichas e as 4 Minion Squads de exemplo, em texto próprio; ator Minion Squad (Threat Rating, Damage Rating, até 6 minions): ataque (nº de minions)k(TR) contra a SD, dano 5 × (DR + raises) no Aplicar da 008, SD 5 × TR, acerto derruba 1 + raises (Blast derruba o valor de Blast), Speed = TR; minions aliados a um herói dando +TR +1 por minion extra nos testes (máx. Fellowship)."

**Referência de regras**: DtD **7.7a** — cap. XX "Antagonists", pp. 520–544 (traits pp. 520–522; fichas pp. 522–542;
Minions pp. 543–544); Fear pp. 447–448; dano e Aura pp. 431–436. Constituição v1.2.1.

**Depende de**: 001 (rolagem), 007 (armas, ataque e dano), 008 (Aplicar dano, condições, turno, Fear Test, social),
009 (magia, Aura), 010 (Special Attacks não se aplicam a NPCs nesta feature).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar e usar os antagonistas do compêndio (Priority: P1)

O Mestre abre o compêndio **Antagonists** e encontra as 47 fichas do livro em pastas por tipo (pessoas, militares,
criminosos, cultistas, máquinas, daemons, criaturas, lendas, mortos-vivos, xenos) e as 4 Minion Squads de exemplo.
Arrastar uma ficha para a cena ou para o diretório de atores cria um NPC pronto: características, perícias, Speed,
Size/Resilience, Static Defense, HP, armadura, feats, traits, habilidades, gear e Level como no livro, com descrição em
redação própria.

**Why this priority**: sem os antagonistas não há oponentes para o combate, a magia e as escolas marciais.

**Independent Test**: abrir Regular Troops/Rebels (Str 3, Dex 3, Con 3; Weaponry 3, Ballistics 3; Speed 6; Size 4 /
Res 4; SD 17; HP 12; Flak Suit 5 AP; Knife 4k2 R; Lasgun 60m S/3 3k2 E Reliable; Level 2).

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o Mestre abre "Antagonists", **Then** há 47 NPCs e 4 Minion Squads em pastas por tipo.
2. **Given** Regular Troops/Rebels, **When** aberto, **Then** a ficha mostra os valores da Tabela de referência.
3. **Given** uma ficha com traits (ex.: Incarnate Lesser Daemon), **When** aberta, **Then** mostra os traits com valor e a descrição de cada um.
4. **Given** pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - NPC em combate (Priority: P2)

O NPC rola perícias e características como o personagem, ataca com as armas do bloco pelo mesmo fluxo da 007/008
(TN = SD do alvo, localização, cartão de dano com a Pen e as qualidades, Dodge/Parry), recebe dano pelo Aplicar da 008
com a armadura do bloco e a Aura, sofre condições e entra no turno do combate. O dano impresso no bloco já inclui a
Força e é usado como está. Os traits simples funcionam: **Armor Plating** e **Machine** dão armadura em todos os locais
(sem somar duas vezes o que o livro já lista como armadura), **Aura** reduz dano de magia, **Daemonic** soma a
Constitution à armadura, **Regeneration** cura no início do turno, **Amorphous** manda todo acerto para o corpo,
**Mindless** é imune a ataques sociais, **Undead** e **Stuff of Nightmares** ignoram Stunned e Blood Loss, **Fear**
oferece o Fear Test aos heróis, **Caster** dá as escolas de magia (sempre sancionado) para conjurar as magias
arrastadas. Os demais traits (Amphibious, Auto-Stabilized, Dark Sight, Flyer, Phasing, Quadruped, Crawler, Resource
Stat) aparecem como texto, com o valor (Speed de voo, pontos do Resource Stat).

**Why this priority**: é o uso principal dos antagonistas.

**Independent Test**: Regular Troops ataca um herói com o Lasgun (Ballistics 3 + Level) e o dano 3k2 E sai sem somar
Força; o herói acerta o NPC e o Aplicar desconta os 5 AP do Flak Suit; um Incarnate Lesser Daemon recebe dano de magia
reduzido pela Aura; Walkin' Dead não fica Stunned.

**Acceptance Scenarios**:

1. **Given** um NPC, **When** rola Weaponry, **Then** usa (perícia + característica) k característica.
2. **Given** um NPC com Lasgun, **When** ataca um herói, **Then** o cartão da 007 sai com a TN da SD do herói e o dano 3k2 E sem Força.
3. **Given** dano num NPC com Flak Suit 5 AP, **When** aplicado, **Then** desconta 5 da armadura e divide pela Resilience do bloco.
4. **Given** um NPC com Aura 4, **When** recebe dano de magia, **Then** a Aura reduz 4.
5. **Given** Regeneration 1, **When** começa o turno do NPC ferido, **Then** recupera 1 HP e o chat avisa.
6. **Given** um NPC Amorphous, **When** é atingido, **Then** a localização é o corpo.
7. **Given** um NPC Mindless, **When** sofre um ataque social, **Then** o ataque é recusado.
8. **Given** um NPC Undead, **When** recebe Stunned ou Blood Loss, **Then** a condição não é aplicada (o chat avisa).
9. **Given** um NPC com Fear 2, **When** o Mestre usa o botão de medo, **Then** o chat oferece o Fear Test (Fear 2) aos heróis.
10. **Given** um NPC Caster com Evocation 3, **When** arrasta Magic Missile, **Then** aprende e conjura como na 009, sancionado.

---

### User Story 3 - Minion Squads (Priority: P3)

O Mestre cria uma **Minion Squad** (ou usa uma do compêndio) com Threat Rating (1–5), número de minions (até 6) e
Damage Rating corpo a corpo e à distância (com tipo e nome da arma). A ficha mostra SD = 5 × TR e Speed = TR. O ataque
rola (minions atacando)k(TR) contra a SD do alvo; ao acertar, o cartão de dano dá 5 × (DR + raises), sem rolagem, com
o Aplicar da 008. Quando um herói acerta a squad, o Aplicar derruba 1 minion mais 1 por raise (arma com Blast derruba o
valor de Blast). Minions podem ser **aliados de um herói**: o herói soma o TR do minion mais forte +1 por minion além do
primeiro nos testes de perícia, até a Fellowship dele em minions.

**Why this priority**: completa o capítulo; depende do combate da US2.

**Independent Test**: Space Pirate Crew (TR 3, 5 minions) ataca um herói com SD 20: 5k3, total 26 = 1 raise → dano 20
(5 × (3 + 1)); o herói acerta a squad (SD 15) com 2 raises → 3 minions removidos; uma granada com Blast 4 remove 4.

**Acceptance Scenarios**:

1. **Given** Space Pirate Crew (TR 3, 5 minions), **When** a ficha é aberta, **Then** SD 15 e Speed 3.
2. **Given** a squad ataca com 5 minions, **When** rola, **Then** 5k3 contra a SD do alvo; com 2 minions, 2k2.
3. **Given** um acerto com 1 raise e DR 3, **When** o dano sai, **Then** 20 de dano do tipo da squad, aplicável pela 008.
4. **Given** um herói acerta a squad com 2 raises, **When** aplica o dano, **Then** 3 minions saem; com Blast 4, 4 saem; a squad com 0 minions é derrotada.
5. **Given** 3 minions aliados de TR 2 e 3 a um herói com Fellowship 4, **When** o herói faz um teste de perícia, **Then** soma 3 + 2 = 5.
6. **Given** um herói com Fellowship 2 e 3 minions aliados, **When** calcula o bônus, **Then** conta só 2 minions.

---

### Edge Cases

- **Armadura em dobro no livro** (Subdermal Plating / Armor Plating, Machine Toughness / Machine, Armor Plating e Machine 10): conta uma vez só.
- **Valores alternativos** (Zoanoid "5[7]"): a forma alternativa aparece como nota; o Mestre ajusta ao mudar de forma.
- **Características "-"** (Mindless): valor 0 e testes sociais falham.
- **Ghost sem ataques**: NPC sem armas; só as habilidades em texto.
- **Erros do livro** (Sabbat Thug SD 17, Common Lore 22, alcances em pés, separadores faltando): o valor impresso, corrigido só onde é erro evidente, com nota.
- **Alcance à distância dos minions**: o livro dá 5× e 10× TR; usamos 10× TR.
- **NPC sem classes**: o Level do bloco vale como está.
- **Usuário sem permissão**: vê o NPC e a squad só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**NPC**

- **FR-001**: Tipo de ator **NPC** com as características, perícias, Speed, Size, Resilience, Static Defense, Mental Defense e HP do bloco (valores do livro, não recalculados), armadura por local, feats (texto), traits (com valor), habilidades (texto próprio), gear, descrição, categoria e Level.
- **FR-002**: Os ataques do bloco MUST ser armas embutidas usadas pelo fluxo de ataque e dano da 007/008; o dano impresso já inclui a Força; o NPC conta como proficiente nas armas do bloco.
- **FR-003**: O NPC MUST receber dano pelo Aplicar da 008, sofrer condições, entrar no turno e rolar perícias e características como o personagem.
- **FR-004**: Traits simples MUST ser automatizados: Armor Plating e Machine (armadura em todos os locais), Aura, Daemonic (armadura = Con), Regeneration (início do turno), Amorphous (acertos no corpo), Mindless (imune a social), Undead e Stuff of Nightmares (sem Stunned e Blood Loss), Fear (botão que oferece o Fear Test), Caster (escolas e sancionado); os demais como texto com o valor.

**Compêndio**

- **FR-005**: Compêndio "Antagonists" com as 47 fichas e as 4 Minion Squads da Tabela de referência, em pastas por categoria; texto próprio em inglês (constituição V).

**Minion Squad**

- **FR-006**: Tipo de ator **Minion Squad** com Threat Rating (1–5), minions (0–6), Damage Rating corpo a corpo e à distância (valor 1–5, tipo, arma); SD = 5 × TR; Speed = TR; alcance 10 × TR.
- **FR-007**: Ataque da squad MUST rolar (minions atacando, até os que há)k(TR, nunca mais que os rolados) contra a SD do alvo; o dano MUST ser 5 × (DR + raises), sem rolagem, num cartão de dano da 008.
- **FR-008**: Dano aplicado a uma squad MUST remover 1 minion + 1 por raise do ataque, ou o valor de Blast da arma; 0 minions = derrotada.
- **FR-009**: Minions aliados a um herói MUST somar aos testes de perícia do herói o maior TR +1 por minion além do primeiro, contando no máximo Fellowship minions.

**Geral**

- **FR-010**: Textos de interface en e pt-BR; só o dono (e o Mestre) altera e rola.

### Tabela de referência

| Categoria | Fichas |
|---|---|
| People | General Noncombatant |
| Military | Green Troops/Common Outlaws, Regular Troops/Rebels, Elite Soldiers/Raiders, Mortal Hero |
| Criminals | Sabbat Thug, Sabbat Prince, Zoanoid Thug, Zoanoid Heavy |
| Cultists | Cultist, Arch-Heretic, Heretek, Dark Mechanius |
| Machines | Monodrone Modron, Duodrone Modron, Combat Servitor, Industrial Servitor |
| Daemons | Incarnate Lesser Daemon, Incarnate Greater Daemon |
| Creatures | Beast of Burden, Ferocious Creature, Flying Creature, Slithering Creature, Walking Creature |
| Legends | Dragon, Mind Flayer, Aboleth, Elemental |
| Undead | Lich, The Walkin' Dead, Ghost |
| Xenos | Fire Warrior, Ratling, Slayer, Living Ancestor, Talon of Tiamat, Dragonfire Adept, Tinkerer, Ork Freeboota, Ork Nob, Aspect Warrior, Eldarin Farseer, Space Marine, Grey Knight, Chaos Marine, Obliterator, Dark Eldarin Raider |

Minion Squads: Kobold Stabbers (TR 1, 1R), Ninja Slayers (TR 4, 2R e à distância 2R), Fluffy Bunnies (TR 1, 5R), Space
Pirate Crew (TR 3, 3R e à distância 3I). Traits (20): Amphibious, Amorphous, Armor Plating (X), Aura (X), Auto-Stabilized,
Caster, Crawler, Daemonic, Dark Sight, Fear (X), Flyer (X), Machine (X), Mindless, Phasing, Quadruped, Regeneration (X),
Resource Stat, Stuff of Nightmares, Undead, Unnatural Toughness.

### Key Entities *(include if feature involves data)*

- **NPC**: bloco do livro; armas embutidas; traits e habilidades.
- **Trait**: chave, valor, descrição, automação.
- **Minion Squad**: TR, minions, Damage Rating corpo a corpo/à distância, herói aliado.
- **Resultado do ataque da squad**: rolagem, raises, dano.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 47 fichas batem com o inventário (características, SD, HP, Resilience, Speed, Level, ataques).
- **SC-002**: Em 100% dos cenários da US3, parada, dano e baixas seguem as regras das pp. 543–544.
- **SC-003**: Colocar um NPC do compêndio em combate e atacar leva no máximo 3 interações.
- **SC-004**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Valores do bloco**: SD, HP, Resilience e Speed do livro valem como estão (já incluem Sound Constitution, Daemonic, Unnatural Toughness e armadura); traits que mudam esses números não os recalculam.
- **Proficiência**: o NPC é proficiente nas armas do bloco (o bloco lista as proficiências que ele tem).
- **Feats do NPC**: texto; não são itens nem aplicam efeitos.
- **Bônus dos minions aliados**: soma ao total do teste (o livro diz "adds ... to every skill roll").
- **Minions no turno**: a squad age no combate sem o controle de ações da 008.
- **Special Attacks e Trick Shots**: fora desta feature para NPCs.

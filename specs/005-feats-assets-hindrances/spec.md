# Feature Specification: Feats, Assets e Hindrances (DtD 7.7a)

**Feature Branch**: `005-feats-assets-hindrances`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Compêndio de Feats, Assets e Hindrances da DtD 7.7a (cap. 7, pp. 174–210): 181 feats de classe, 49 feats raciais, 22 Assets gerais e 22 Hindrances, estendendo o tipo de Item `feat` da 004, num compêndio "Feats" com pastas por categoria (e por raça para os raciais); fonte JSON em src/packs, redação própria em inglês. Regras: feats só uma vez (exceto repetíveis/grupos com subcategoria diferente); feats raciais só da própria raça; assets só na criação, sem limite de número; no máximo 2 hindrances. Aplicar no ator: arrastar para a ficha adiciona à aba Traits, pedindo a subcategoria quando é feat de grupo; avisos com override do Mestre; automação de efeitos numéricos simples como modificadores desligáveis; feats concedidos por raça, exaltação e assets (Aasimar, Gnome, Atlantean, Promethean, You Will Not Falter, Tuning, Ventrue, Academy, Kenjutsu, K'sten'mannav, Lightning Bug), removidos junto com a origem. Fora de escopo: classes, compra de XP, combate e magia."

**Referência de regras**: DtD **7.7a**, cap. 7 "Feats, Assets & Hindrances": grupos de feat p. 174; listas-resumo pp. 175–178; regras de feats raciais, Assets e Hindrances pp. 178–179; descrições de feats pp. 180–198; feats raciais pp. 199–205; Assets pp. 205–207; Hindrances pp. 208–210. Custos em XP: tabela da criação de personagem (cap. 2, pp. 15–16) — feat 100 XP, asset 100 XP, hindrance +100 XP. "A maioria dos feats só pode ser escolhida uma vez": cap. 6, p. 106. Constituição v1.2.1.

**Depende de**: `001-system-foundation` (personagem, derivados, especialidades), `002-race-compendium` (raças e poderes raciais), `004-exaltation-compendium` (tipo `feat`, Exalted Assets, exaltações e poderes, aba Traits).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar feats, assets e hindrances no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Feats** e encontra todo o conteúdo do cap. 7 organizado em pastas: **Feats** (181), **Racial Feats** (49, com uma subpasta por raça), **Assets** (22) e **Hindrances** (22). Cada entrada mostra nome, categoria, página, resumo mecânico em inglês de redação própria, custo ou ganho de XP, se é um feat de grupo (com as subcategorias do livro), se pode ser repetido, a raça exigida (feats raciais) e os feats de que depende, quando houver.

**Why this priority**: é a base de consulta da criação de personagem e das classes (que listam feats); utilizável sozinha.

**Independent Test**: abrir o compêndio Feats, conferir a contagem por pasta (181/49/22/22 e 3 feats por raça, 4 para o Kobold) e abrir Peer, Battle Rage, Halfling Agility, Sturdy e Loco comparando com a Tabela de referência.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Feats", **Then** há 274 entradas nas pastas Feats (181), Racial Feats (49, em 16 subpastas de raça) e Assets (22) e Hindrances (22).
2. **Given** o feat "Peer", **When** aberto, **Then** mostra que é um feat de grupo com as subcategorias do livro (Academics, Sigil's Factions, Churches, Specific Races, Government, The Military, Middle Classes, Nobility, the Insane, Underworld, Workers, etc.), que pode ser repetido com subcategoria diferente, custo 100 XP e p. 192.
3. **Given** o feat "Battle Rage", **When** aberto, **Then** mostra a dependência de "Frenzy".
4. **Given** o feat racial "Halfling Agility", **When** aberto, **Then** mostra raça Halfling, p. 202 e o efeito automatizado "+4 Static Defense".
5. **Given** o hindrance "Loco", **When** aberto, **Then** mostra "+100 XP" (concedido, não custo) e o limite de 2 hindrances por personagem.
6. **Given** o idioma em pt-BR, **When** qualquer ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Adicionar feats, assets e hindrances ao personagem (Priority: P2)

O jogador arrasta um feat, feat racial, asset ou hindrance para a ficha. Para feats de grupo, o sistema pede a subcategoria (lista do livro ou texto livre, como "Peer (Clan Jade Falcon)" com aprovação do Mestre). O item aparece na aba Traits, em seções separadas (Feats, Assets, Hindrances), com o nome completo incluindo a subcategoria. O sistema confere as regras do livro e avisa quando algo não bate; o Mestre pode incluir mesmo assim.

**Why this priority**: tira do jogador o controle manual de feats e das regras de repetição, raça e limite; depende do compêndio (P1).

**Independent Test**: num Halfling, adicionar Peer (Nobility), Peer (Underworld), Halfling Agility, Sturdy e dois hindrances; conferir que o terceiro hindrance, um segundo Peer (Nobility), um feat racial de Ork e Battle Rage sem Frenzy geram avisos.

**Acceptance Scenarios**:

1. **Given** um personagem, **When** o jogador arrasta "Peer" e escolhe "Nobility", **Then** a ficha mostra "Peer (Nobility)" na seção Feats; **When** arrasta "Peer" de novo e escolhe "Underworld", **Then** passa a ter os dois.
2. **Given** um personagem com "Peer (Nobility)", **When** tenta adicionar "Peer (Nobility)" de novo, **Then** o sistema recusa com aviso de duplicata.
3. **Given** um personagem com "Sound Constitution", **When** tenta adicioná-lo de novo, **Then** recusa: o feat não é repetível.
4. **Given** um Halfling, **When** o jogador arrasta o feat racial "I'm Da Boss!" (Ork), **Then** recusa com aviso de raça incompatível.
5. **Given** um personagem sem "Frenzy", **When** o jogador arrasta "Battle Rage", **Then** o sistema avisa da dependência ausente e pergunta se quer incluir mesmo assim (o livro não impõe pré-requisitos formais).
6. **Given** um personagem com 2 hindrances, **When** o jogador arrasta um terceiro, **Then** recusa com aviso de limite (p. 179).
7. **Given** qualquer recusa desta história, **When** o usuário é o Mestre, **Then** ele pode confirmar a inclusão mesmo assim.
8. **Given** um asset ou hindrance, **When** adicionado, **Then** a ficha mostra o aviso informativo de que assets e hindrances se escolhem na criação de personagem (sem bloqueio).
9. **Given** um feat na ficha, **When** o dono remove o feat, **Then** o feat e seus modificadores saem.

---

### User Story 3 - Efeitos automáticos de feats, assets e hindrances (Priority: P3)

Feats, feats raciais e assets com um efeito numérico simples e sempre ativo já valem na ficha, como modificadores que o Mestre pode desligar um a um. Os que pedem uma escolha (a característica mais baixa, a perícia da especialidade) perguntam ao serem adicionados. Os demais ficam como texto de referência.

**Why this priority**: evita contas manuais nos derivados; depende de adicionar ao personagem (P2).

**Independent Test**: num personagem com Con 3, Wil 3, Cmp 2, Dex 2, Wis 2, Size 4, adicionar Sound Constitution, Discipline, Sturdy, Sand, Nine Lives e conferir HP, Resolve, Resilience, Fatigue e Hero Points; num Halfling, Halfling Agility; num Squat, No One Tougher.

**Acceptance Scenarios**:

1. **Given** Con 3 e Wil 3 (HP máx. 12), **When** "Sound Constitution" é adicionado, **Then** HP máx. = 13.
2. **Given** Resolve máx. 5, **When** "Discipline" é adicionado, **Then** Resolve máx. = 6; **Given** um Tau com Resolve máx. 5 e Mental Defense 15, **When** "Farsighted" é adicionado, **Then** Resolve máx. 8 e Mental Defense 20.
3. **Given** Resilience 4, **When** o asset "Sturdy" é adicionado, **Then** Resilience = 5.
4. **Given** Fatigue máx. 3, **When** o asset "Sand" é adicionado, **Then** Fatigue máx. = 5; **Given** Hero Points 2/2, **When** "Nine Lives" é adicionado, **Then** Hero Points máximo 3 e atual 3.
5. **Given** um Halfling com Static Defense 24, **When** "Halfling Agility" é adicionado, **Then** Static Defense = 28.
6. **Given** um Squat com Dex 2 e Con 4, **When** "No One Tougher" é adicionado, **Then** a Static Defense usa Constitution no lugar de Dexterity (10 + 3×4 + 3×Wis − 2×Size).
7. **Given** um personagem com Paranoia, **When** a ficha é exibida, **Then** a iniciativa de combate mostra +2.
8. **Given** um Aasimar com características Str 1, Dex 2, …, **When** "Made of Mettle" é adicionado, **Then** o sistema pede qual das características empatadas na menor recebe +1 (sem empate, aplica direto).
9. **Given** um personagem, **When** "Veteran o' the Wheel" é adicionado, **Then** o jogador escolhe uma característica e uma perícia, e cada uma ganha +1.
10. **Given** um personagem, **When** "Skill Focus" é adicionado, **Then** o jogador escolhe a perícia e escreve a especialidade, que aparece nessa perícia com a indicação do feat; **When** o feat é removido, **Then** a especialidade sai.
11. **Given** qualquer modificador de feat, **When** o Mestre o desmarca, **Then** o efeito deixa de valer; derivados continuam sujeitos ao bônus/override manual do Mestre.

---

### User Story 4 - Feats concedidos por raça, exaltação e assets (Priority: P4)

Quando o personagem recebe uma raça, exaltação ou asset que, segundo o livro, dá feats, esses feats entram automaticamente na ficha marcados com a origem; quando a origem sai, os feats concedidos saem junto. Concessões com escolha (Academy: duas Weapon Proficiency à escolha; Tuning: subcategorias "Any") pedem a escolha.

**Why this priority**: completa a criação de personagem sem esquecer feats gratuitos; depende de adicionar feats (P2) e das features 002/004.

**Independent Test**: aplicar Aasimar e conferir Jaded e Fearless; trocar para Gnome e conferir que eles saem e entram as 12 proficiências; aplicar Atlantean e conferir Speak Language (Syrneth); adicionar Academy e escolher duas Weapon Proficiency.

**Acceptance Scenarios**:

1. **Given** um personagem sem raça, **When** o jogador aplica Aasimar, **Then** "Jaded" e "Fearless" aparecem na seção Feats marcados "concedido por Aasimar"; **When** a raça é trocada para Elf, **Then** os dois saem.
2. **Given** um Gnome, **When** a raça é aplicada, **Then** entram as 7 Weapon Proficiency (Basic, Melee 1, Melee 2, Melee 3, Ranged 1, Ranged 2, Throwing) e as 5 Armor Proficiency (Light, Medium, Heavy, Extreme, Power).
3. **Given** um personagem, **When** recebe a exaltação Atlantean, **Then** entra "Speak Language (Syrneth)"; **When** recebe Promethean, **Then** entram as 5 Armor Proficiency (Integrated Armor, ponto 1).
4. **Given** um Paragon Aasimar, **When** "You Will Not Falter" é concedido (Perfection), **Then** entram Armor of Contempt, Armor Proficiency (Power) e Armor Specialization (Power).
5. **Given** um Paragon Gnome, **When** "Tuning" é concedido, **Then** o jogador escolhe a arma de Weapon Focus e Weapon Specialization e o tipo de Armor Specialization.
6. **Given** um Vampire, **When** o asset "Ventrue" é adicionado, **Then** entra "Peer (Ventrue)".
7. **Given** um personagem, **When** o asset "Academy" é adicionado, **Then** o jogador escolhe duas Weapon Proficiency distintas e elas entram; **When** Academy é removido, **Then** elas saem.
8. **Given** um Kenku, Kobold ou Thri-Kreen, **When** adiciona Kenjutsu, K'sten'mannav ou Lightning Bug, **Then** entram Extracurricular Study, Armor of Contempt ou Luminen Blast, respectivamente.
9. **Given** um feat concedido que o personagem já tinha comprado, **When** a concessão acontece, **Then** o feat não é duplicado e o comprado continua na ficha se a origem sair.
10. **Given** um feat concedido, **When** o jogador tenta removê-lo diretamente, **Then** a ficha informa que ele vem da origem e só o Mestre pode removê-lo à parte.

---

### Edge Cases

- **Item arrastado para ator que não é Personagem**: recusado com aviso.
- **Feat de grupo sem subcategoria**: a escolha é obrigatória; cancelar não adiciona nada. Texto livre aceito (p. 174: listas "representativas"), além das opções do livro.
- **Grupo com subcategoria fixa pela origem** (ex.: concessão "Peer (Ventrue)"): entra sem pedir escolha.
- **Troca de raça**: feats raciais da raça anterior continuam na ficha, marcados como "raça incompatível" (o Mestre decide removê-los); feats concedidos pela raça anterior saem.
- **Remoção de exaltação/asset que concedeu feats**: os feats concedidos saem junto (com a confirmação já existente da 004).
- **Modificador que levaria característica/perícia acima de 6**: limitado a 6 com o aviso de valor limitado da 002.
- **Hindrance "Loco"** (Insanity 20) e outros efeitos de sistemas inexistentes (Insanity, idiomas, armadura, escolas, backgrounds): só texto.
- **Nine Lives**: o Hero Point extra vale no máximo; a restrição "só pode ser queimado" é indicada em texto.
- **Sturdy** e **Veteran o' the Wheel**: o livro exige hindrances extras sem XP (Sturdy: dois; Veteran: um mais severo, definido pelo Mestre); a ficha avisa, sem forçar.
- **Feat concedido e comprado ao mesmo tempo**: nunca duplica (US4-9).
- **Usuário sem permissão de dono**: vê tudo só como leitura.
- **Feat editado no compêndio**: cópias na ficha não mudam.

## Requirements *(mandatory)*

### Functional Requirements

**Dados**

- **FR-001**: O tipo de item "Feat" (da 004) MUST aceitar as categorias Feat, Racial Feat, Asset, Hindrance e Exalted Asset.
- **FR-002**: Toda entrada MUST ter: nome, categoria, página, resumo mecânico, custo em XP (feat e asset: 100) ou XP concedido (hindrance: +100), se é repetível, se é feat de grupo (com as subcategorias do livro), raça exigida (feats raciais), feats de que depende (lista de nomes, pode ser vazia), tipo de automação e feats que concede (com subcategoria fixa ou "à escolha").
- **FR-003**: Um feat de grupo na ficha MUST guardar a subcategoria escolhida e exibir o nome como "Nome (Subcategoria)".

**Fichas e compêndio**

- **FR-004**: A ficha de feat da 004 MUST exibir e, para quem pode editar, editar os campos novos; compêndio bloqueado é somente leitura.
- **FR-005**: O sistema MUST distribuir o compêndio "Feats" com as 274 entradas do cap. 7 conforme a Tabela de referência, em pastas Feats, Racial Feats (subpasta por raça), Assets e Hindrances; o compêndio "Exalted Assets" da 004 continua separado.
- **FR-006**: Fonte versionada em texto e gerada por ferramenta; descrições com redação própria em inglês, sem sequência de 6+ palavras igual ao livro (constituição V).

**Adição ao personagem**

- **FR-007**: Arrastar um feat, feat racial, asset ou hindrance para a ficha de um Personagem MUST adicioná-lo à aba Traits, na seção da categoria; feats de grupo MUST pedir a subcategoria antes (cancelar não altera nada).
- **FR-008**: O sistema MUST recusar com aviso: (a) feat não repetível já presente; (b) feat de grupo com a mesma subcategoria já presente; (c) feat racial de outra raça (ou sem raça); (d) terceiro hindrance (p. 179). MUST avisar e pedir confirmação quando falta um feat do qual o novo depende. Em toda recusa, o Mestre pode confirmar a inclusão mesmo assim.
- **FR-009**: Adicionar asset ou hindrance MUST mostrar o aviso informativo "escolhido na criação de personagem" (sem bloqueio, como na 004).
- **FR-010**: O dono MUST poder remover feats, assets e hindrances comprados; a remoção leva junto os modificadores e os feats concedidos por eles.

**Automação** (comportamento do livro como padrão, cada modificador desligável pelo Mestre — constituição IV)

- **FR-011**: Automatizados nesta feature:
  - Sound Constitution: HP máx. +1.
  - Discipline: Resolve máx. +1.
  - Paranoia: iniciativa de combate +2.
  - Farsighted (Tau): Resolve máx. +3 e Mental Defense +5.
  - Halfling Agility (Halfling): Static Defense +4.
  - No One Tougher (Squat): Static Defense usa Constitution no lugar de Dexterity.
  - Made of Mettle (Aasimar): +1 na menor característica (escolha em caso de empate).
  - Beneficial Mutation (Tiefling): +2 na menor característica e −1 numa outra à escolha.
  - Matron (Dryad): Strength +1, Dexterity −1, Fellowship −1, Size +2.
  - Sturdy: Resilience +1.
  - Sand: Fatigue máx. +2.
  - Nine Lives: Hero Points máx. +1 (ao adicionar, o atual também sobe 1).
  - Veteran o' the Wheel: +1 numa característica e +1 numa perícia à escolha.
  - Skill Focus e Noisy Cricket (Acrobatics: Jumping): uma especialidade na perícia, marcada com o feat e removida com ele.
- **FR-012**: Os demais efeitos (combate, magia, armadura, idiomas, backgrounds, Insanity, testes específicos) MUST aparecer como texto de referência.

**Feats concedidos**

- **FR-013**: O sistema MUST conceder automaticamente, marcados com a origem, os feats da Tabela de concessões: ao aplicar a raça (Aasimar, Gnome), a exaltação (Atlantean; Promethean a partir de Generation 1), e ao adicionar os assets e feats raciais listados (You Will Not Falter, Tuning, Ventrue, Academy, Kenjutsu, K'sten'mannav, Lightning Bug). Concessões "à escolha" MUST pedir a escolha.
- **FR-014**: Remover, trocar ou desfazer a origem MUST remover os feats concedidos por ela, exceto os que o personagem também comprou.
- **FR-015**: Feats concedidos MUST não duplicar feats já presentes e só podem ser removidos à parte pelo Mestre.

**Geral**

- **FR-016**: Todo texto de interface novo MUST existir em pt-BR e inglês.
- **FR-017**: Qualquer dono do personagem pode adicionar e remover; observadores só leem.

### Tabela de referência (DtD 7.7a, cap. 7)

| Categoria | Pág. | Qtd. | Observação |
|---|---|---|---|
| Feats | 180–198 | 181 | nomes iguais às listas-resumo pp. 175–178; 22 feats de grupo/repetíveis (ex.: Armor Proficiency [Light/Medium/Heavy/Extreme/Power], Weapon Proficiency [Basic/Melee 1/Melee 2/Melee 3/Ranged 1/Ranged 2/Throwing], Peer, Good Reputation, Hatred, Heightened Senses, Speak Language, Skill Focus, Spell Focus, Wizard Tradition, Elemental Shot I–III, Upgraded) |
| Racial Feats | 199–205 | 49 | 3 por raça, Kobold 4 (lista abaixo) |
| Assets | 205–207 | 22 | Academy, Ambidextrous, Androgynous, Appearance, Brave, Dangerous Beauty, Driven, Education, Eagle Eyes, Fast, Gifted, Left Handed, Level Headed, Linguist, Magic Resistance, Nerves o' Steel, Nine Lives, Sand, Spirit Mentor, Sturdy, Tough as Nails, Veteran o' the Wheel |
| Hindrances | 208–210 | 22 | Ailin', All Thumbs, Bad Luck, Big Britches, Clueless, Deathwish, Enemy, Geezer, Grim Servant o' Death, High-Falutin', Illiterate, Impulsive, Intolerance, Kid, Law o' the Stars, Loco, Night Terrors, Slowpoke, Ugly as Sin, Vengeful, Wanted, Wimpy |

**Feats raciais**: Aasimar — Celestial Wrath, Made of Mettle, Terminator Honors · Dark Eldarin — Dark Cruelty, Recluse, Warp Fire · Dragonborn — Dragonborn Frenzy, Dragon Sight, Elder Wyrm's Fire · Dryad — Matron, Photosynthetic, Treestrider · Eldarin — Ancestral Recall, Extra Warp, Guess Destination · Elf — Elven Precision, Light Step, Precise Technique · Gnome — Eureka!, Explorer, Tinker · Halfling — Escape Artist, Halfling Agility, Second Chance · Human — Able Learner, Human Perseverance, Mixed Heritage · Kenku — Ace Pilot, Kenjutsu, Teacher · Kobold — K'sten'mannav, K'vend'l, Legal Miner, Trapmaster · Ork — I'm Da Boss!, Mobbing Up, WAAAAAGH CRY! · Squat — No One Tougher, Squat Armor Proficiency, Squat Stability · Tau — Farsighted, Move And Shoot, Silent Arcana · Thri-Kreen — Lightning Bug, Mandibles, Noisy Cricket · Tiefling — Beneficial Mutation, Mutation, Outsider.

**Dependências entre feats** (o livro não lista pré-requisitos formais; derivadas do texto): Battle Rage → Frenzy; Beastmaster e Improved Animal Companion → Animal Companion; Diamond Body → Wholeness of Body; Improved Wild Shape e Nekomimi Mode → Wild Shape; Luminen Blast e Luminen Charge → Mechanicus Implants; Elven Precision e Precise Technique → poder racial Elven Accuracy (Elf); Extra Warp e Guess Destination → poder racial Warp Step (Eldarin); Improved Weapon Focus → Weapon Focus; Improved Weapon Specialization → Weapon Specialization; Greater Spell Focus → Spell Focus.

**Tabela de concessões**

| Origem | Tipo | Concede |
|---|---|---|
| Aasimar (And They Shall Know No Fear, p. 31) | raça | Jaded, Fearless |
| Gnome (Improvise, p. 43) | raça | Weapon Proficiency (7 opções), Armor Proficiency (5 opções) |
| Atlantean (Past Lives, p. 67) | exaltação | Speak Language (Syrneth) |
| Promethean (Integrated Armor, p. 88, Generation 1) | exaltação | Armor Proficiency (Light, Medium, Heavy, Extreme, Power) |
| You Will Not Falter (p. 218) | Exalted Asset | Armor of Contempt, Armor Proficiency (Power), Armor Specialization (Power) |
| Tuning (p. 218) | Exalted Asset | Weapon Specialization (à escolha), Weapon Focus (à escolha), Armor Specialization (à escolha) |
| Ventrue (p. 221) | Exalted Asset | Peer (Ventrue) |
| Academy (p. 206) | asset | 2 × Weapon Proficiency (à escolha, distintas) |
| Kenjutsu (Kenku, p. 203) | feat racial | Extracurricular Study |
| K'sten'mannav (Kobold, p. 203) | feat racial | Armor of Contempt |
| Lightning Bug (Thri-Kreen, p. 204) | feat racial | Luminen Blast |

Nomes normalizados para os títulos das descrições (quando a lista-resumo diverge): "Aasimar" (não "Asimar"), "High-Falutin'", "WAAAAAGH CRY!".

### Key Entities *(include if feature involves data)*

- **Feat** (item, categorias Feat, Racial Feat, Asset, Hindrance, Exalted Asset): dados do livro, grupo e subcategorias, repetição, dependências, automação e concessões; existe no compêndio e como cópia no personagem.
- **Escolha do feat no personagem**: subcategoria (feats de grupo) e escolhas de automação (característica, perícia, especialidade).
- **Concessão**: vínculo entre um feat na ficha e a origem que o concedeu (raça, exaltação, asset, feat racial); remover a origem remove o feat concedido.
- **Modificador de feat**: cada efeito automatizado, desligável pelo Mestre, removido com o feat.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 274 entradas do compêndio têm categoria, página, grupo/repetição, raça e XP iguais à Tabela de referência (conferência automática campo a campo).
- **SC-002**: Um jogador adiciona um feat de grupo em até 3 interações (arrastar, escolher, confirmar) e em menos de 20 segundos.
- **SC-003**: Os exemplos numéricos da US3 produzem 100% dos valores esperados.
- **SC-004**: Em 100% das trocas de raça e exaltação testadas com as 11 origens da Tabela de concessões, os feats concedidos entram e saem sem sobrar nem duplicar.
- **SC-005**: 0 trechos de descrição copiados do livro (verificação de sequências de 6+ palavras e revisão por amostragem).
- **SC-006**: 0 textos de interface desta feature sem tradução.

## Assumptions

- **Fora de escopo**: classes, listas de feats por classe e completion bonuses; compra e controle de XP; automação de combate, magia, armadura, idiomas, backgrounds e Insanity (esses feats ficam como texto); rolagens condicionais (ex.: Dark Cruelty +1k1, Light Step +2k0, I'm Da Boss!) — o diálogo de rolagem da 001 continua aceitando modificadores manuais.
- Os feats do livro não têm pré-requisitos formais; as dependências da tabela são tratadas como aviso, não como bloqueio.
- "Repetível" vale para feats de grupo (com subcategoria diferente) e para os 22 marcados no inventário; os demais só uma vez (cap. 6, p. 106).
- Assets gerais não têm limite de número (p. 179); o limite de um Exalted Asset (exceto Paragon) da 004 não muda.
- Subcategorias "à escolha" aceitam texto livre além da lista do livro (p. 174, com aprovação do Mestre).
- A menor característica (Made of Mettle, Beneficial Mutation) é avaliada no momento em que o feat é adicionado, pelos valores finais.
- Promethean: a concessão das Armor Proficiency acompanha o poder Integrated Armor (ponto 1 do Generation), que todo Promethean tem.
- Imagens: ícones genéricos do Foundry.

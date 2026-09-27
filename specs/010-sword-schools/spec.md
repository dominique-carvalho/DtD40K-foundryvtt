# Feature Specification: Sword Schools e Gun Kata (DtD 7.7a)

**Feature Branch**: `010-sword-schools`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Sword Schools (cap. IX) e Gun Kata (cap. X) da DtD 7.7a: compêndio com as 9 Sword Schools e os 6 Gun Kata e as vantagens/restrições universais; escolas como pontos no personagem (teto = Level) compradas com XP pelas listas da classe (sistema da 006); Martial Adept Level e Gunslinger Level; montador de Special Attacks e Trick Shots (ação, vantagens, restrições dentro do orçamento de Style Points, 50 XP por ponto de vantagem); usar o ataque no combate da 008 com modificadores de ataque/dano/Pen, restrições de uso, teste de perícia da restrição e condições/propriedades simples no alvo, o resto como texto no cartão; Masteries numéricas simples como Active Effects desligáveis pelo Mestre, as demais como texto."

**Referência de regras**: DtD **7.7a** — cap. IX "Sword Schools", pp. 260–271 (Martial Adept Level e Special Attacks
p. 260; montagem p. 261; níveis de maestria e universais p. 262; escolas pp. 263–271); cap. X "Gun Kata", pp. 272–279
(Gunslinger Level e Trick Shots p. 272; montagem e universais p. 273; estilos pp. 274–279); custos de XP p. 16 e
p. 515; ações de combate pp. 423–430; qualidades de arma pp. 319–321. Constituição v1.2.1.

**Depende de**: 006 (classes com listas de Sword Schools e Gun Kata, XP e histórico), 007 (armas com grupo, tipo e
qualidades; ataque e dano), 008 (ações e turno, Aplicar dano, condições, reações).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar as escolas no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Martial Schools** e encontra as 9 Sword Schools e os 6 Gun Kata em duas
pastas. Cada escola mostra perícia-chave, grupo de arma (Sword Schools), resumo e as entradas por nível de maestria
(Apprentice a Grandmaster): ação liberada, restrições (arma, falha da escola, perícia), vantagens com custo em Style
Points (marcando as que podem ser compradas mais de uma vez) e Mastery/passivas. As vantagens e restrições universais
também podem ser consultadas.

**Why this priority**: base da compra de escolas e do montador de ataques.

**Independent Test**: abrir o compêndio e conferir Desert Wind (Athletics, Syrneth; Multiple Attacks; Empty Hand −2;
Blistering Flourish 1; Burning Blade 2; Zephyr Dance; Leaping Flame 1; Holocaust Cloak 4) e Clay Pigeon.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Martial Schools", **Then** há 15 escolas (9 Sword Schools, 6 Gun Kata) em 2 pastas, cada uma com 9 entradas cobrindo os 5 níveis.
2. **Given** Desert Wind, **When** aberta, **Then** mostra as entradas da Tabela de referência com custo, nível e efeito.
3. **Given** a lista universal, **When** consultada, **Then** mostra 5 vantagens e 7 restrições com custo e marcação de repetível.
4. **Given** pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Escolas no personagem (Priority: P2)

O personagem tem as 15 escolas como pontos (0 a Level). No modo Evolução da 006, cada escola mostra o custo do próximo
ponto (nova 200; melhorar 100 × valor atual) e só pode ser comprada se estiver na lista de Sword Schools ou Gun Kata
da classe atual (Free Study: das classes concluídas; fora das listas o Mestre pode incluir). A ficha mostra o
**Martial Adept Level** (maior Sword School) e o **Gunslinger Level** (maior Gun Kata) e, por escola, o que cada nível
já liberou. Ao chegar no nível 4 (ou no nível da passiva, nos Gun Kata), as passivas numéricas simples viram efeitos
ativos que o Mestre pode desligar; as demais aparecem como texto.

**Why this priority**: sem escola não há orçamento nem vantagens para os ataques (P3).

**Independent Test**: personagem Level 2 numa classe com Iron Heart compra Iron Heart 1 (200 XP) e 2 (100 XP); Martial
Adept Level 2; Iron Heart 3 recusado pelo Level; Devoted Spirit 4 com o GM dá +4 HP (Ox Body) desligável.

**Acceptance Scenarios**:

1. **Given** Level 2, classe atual com Iron Heart, **When** compra Iron Heart 0 → 1 → 2, **Then** custa 200 e 100 XP, fica no histórico e o Martial Adept Level é 2.
2. **Given** Iron Heart 2 e Level 2, **When** tenta 2 → 3, **Then** recusa (teto = Level).
3. **Given** uma escola fora da lista, **When** tenta comprar, **Then** recusa com override do Mestre.
4. **Given** Clay Pigeon 3 e Point Blank 2, **When** a ficha é aberta, **Then** Gunslinger Level 3 e Martial Adept Level 0.
5. **Given** Devoted Spirit 4, **When** a ficha é calculada, **Then** +4 HP de Ox Body como efeito que o Mestre desliga; Zephyr Dance (imune a fogo) aparece como texto.
6. **Given** desfazer a compra, **When** confirmado, **Then** o valor e o XP voltam e as passivas do nível perdido saem.

---

### User Story 3 - Montar Special Attacks e Trick Shots (Priority: P3)

Na aba **Martial** o jogador cria um **Special Attack** (corpo a corpo, Sword Schools) ou um **Trick Shot** (Gun
Kata): escolhe a ação-base (Standard Attack sempre; as ações liberadas no nível 1 das escolas que tem), as vantagens
(universais e as das escolas nos níveis que já tem; repetíveis com quantidade) e as restrições (universais, restrição
de arma, falha da escola e de perícia das escolas que tem). O montador mostra o orçamento: vantagens até o nível
(Martial Adept para Special Attack, Gunslinger para Trick Shot); acima dele, cada ponto a mais exige um ponto de
restrição, até 2 × o nível. Ao salvar, com nome, o custo é 50 XP por ponto de vantagem (restrições não descontam) e
vai para o histórico; editar um ataque existente cobra 50 XP por ponto de vantagem acrescentado. Vantagens de Gun Kata
só entram em Trick Shots; vantagens de Sword Schools só em Special Attacks; as universais em ambos.

**Why this priority**: é o conteúdo central dos capítulos; depende das escolas (P2).

**Independent Test**: com Setting Sun 2 e Iron Heart 3 (Martial Adept 3), montar o exemplo do livro: Standard Attack,
Hammer of the Emperor (2), Knockout Blow (2), First Damage Improvement ×2 (2) = 6 pontos, com Opening the Path (−2) e
Difficult Strike (−1) = 3 de restrição; custo 300 XP.

**Acceptance Scenarios**:

1. **Given** Martial Adept 3, **When** monta o exemplo do livro, **Then** o orçamento fecha (6 ≤ 2 × 3; 3 acima do nível cobertos por 3 de restrição) e o custo é 300 XP.
2. **Given** vantagens acima do nível sem restrições suficientes, **When** tenta salvar, **Then** recusa mostrando quanto falta.
3. **Given** vantagens acima de 2 × o nível, **When** tenta salvar, **Then** recusa.
4. **Given** uma vantagem de escola de nível que o personagem não tem, **When** monta, **Then** ela não está disponível.
5. **Given** um Trick Shot, **When** monta, **Then** só vantagens universais e de Gun Kata, e a base usa o Gunslinger Level.
6. **Given** um ataque salvo com 4 pontos, **When** o jogador acrescenta 1 ponto, **Then** paga 50 XP; desfazer no histórico devolve e restaura o ataque anterior.
7. **Given** a restrição "sem efeito" (ex.: Non-Penetrating numa arma sem Pen), **When** o ataque é usado, **Then** o sistema avisa que a restrição não teve efeito.

---

### User Story 4 - Usar o ataque em combate (Priority: P4)

Na aba Martial (ou Combate), o jogador usa um Special Attack ou Trick Shot com uma arma que ele atende. O sistema:
confere as restrições de uso (grupo ou tipo de arma, sem arma, Difficult Strike na rodada anterior, Last Resort uma
vez por cena, alvo desprevenido/indefeso, engajado, metade do HP perdida) com override do Mestre; gasta a ação-base
pelo turno da 008; rola o ataque com os modificadores de ataque (dados rolados/mantidos, conforme a ação-base: Called
Shot, All Out Attack, Charge, Fight Defensively, Full Auto Burst, Multiple Attacks com as vantagens no primeiro
ataque); faz o **teste de perícia** da restrição de perícia contra a Static Defense do alvo (falha = o ataque falha);
e, no cartão, o dano sai com os modificadores de dano e Pen e as **propriedades** somadas (Incendiary, Tearing,
Shocking, Snare, Flexible, Toxic, Razor Sharp, Accurate, Blast, Storm, Power Field). Ao acertar, os efeitos simples
são aplicados (Dazed por raise, Prone, Blood Loss, fadiga; no atacante: −10 Static Defense, +5 de armadura, fadiga,
Prone ao errar). As ações que preparam (Aim, Feint, Ready, Aid Another) gastam a ação e deixam o ataque pronto para o
ataque seguinte. O resto das vantagens aparece como texto no cartão.

**Why this priority**: é o uso do montador em jogo; depende de P3 e da 008.

**Independent Test**: Blistering Flourish + First Damage Improvement com uma arma Syrneth; ataque com 2 raises: o alvo
fica Dazed por 2 rodadas e o dano tem +1k0; usar de novo um ataque com Difficult Strike na rodada seguinte é recusado.

**Acceptance Scenarios**:

1. **Given** um Special Attack com Weapon (Syrneth), **When** usado com uma espada comum, **Then** recusa (override do Mestre).
2. **Given** First Accuracy ×2 e Penetration Mastery ×1, **When** ataca, **Then** +2k0 no ataque e +2 Pen no dano.
3. **Given** Blistering Flourish, **When** acerta com 2 raises, **Then** o alvo fica Dazed 2 rodadas.
4. **Given** Skill (Athletics), **When** o teste de Athletics falha contra a Static Defense do alvo, **Then** o ataque falha e o cartão diz por quê.
5. **Given** Difficult Strike usado nesta rodada, **When** tenta de novo na rodada seguinte, **Then** recusa; Last Resort usado na cena, recusa até o Mestre reiniciar a cena.
6. **Given** a ação-base Called Shot, **When** usado, **Then** escolhe a localização, −2k0 e ação completa pela 008.
7. **Given** Burning Blade, **When** o dano sai, **Then** o cartão tem Incendiary.
8. **Given** Opening the Path, **When** ataca, **Then** o atacante fica com −10 Static Defense até o próximo turno.
9. **Given** um Trick Shot com Blast, **When** usado, **Then** o cartão avisa que as vantagens valem só para o alvo mais próximo.
10. **Given** Aim como base, **When** usado, **Then** gasta a ação e o próximo ataque do personagem recebe as vantagens.

---

### Edge Cases

- **Nomes universais**: o livro chama "First … Improvement" e "Second … Mastery" e no exemplo usa "Second Accuracy Improvement"; usamos os nomes da tabela.
- **Custos variáveis**: Revitalizing Strike 1 ou 3 (1 ou 2 HP); Exit Wound Kata custa X (perda de X HP); repetíveis (`*`) por quantidade.
- **Setting Sun "Brawl"**: o grupo impresso é Brawl e o texto diz desarmado; vale o grupo Unarmed da 007.
- **Gun Kata sem grupo de arma**: as limitações de arma são as falhas (pistolas, pesadas, primitivas).
- **Estrutura irregular dos Gun Kata** (nível 4 com duas passivas, ou restrição + vantagem): seguimos o livro como impresso.
- **Vantagens de escola repetidas em outro ataque**: permitido; o mesmo ataque não tem a mesma vantagem não repetível duas vezes.
- **Perdendo nível de escola** (desfazer): ataques que usam vantagens acima do novo nível ficam marcados como inválidos até serem editados.
- **Martial Adept Level 0**: não monta Special Attack (orçamento 0); idem Gunslinger.
- **Usuário sem permissão**: vê escolas e ataques só como leitura.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndio**

- **FR-001**: Tipo de item **Escola marcial** com tipo (Sword School ou Gun Kata), perícia-chave, grupo de arma, resumo e entradas (nível 1–5, tipo: ação, restrição de arma, falha, perícia, vantagem, mastery/passiva; nome, custo em Style Points, repetível, custo variável, efeito em redação própria e automação).
- **FR-002**: Compêndio "Martial Schools" com as 15 escolas da Tabela de referência em 2 pastas; texto próprio em inglês (constituição V).
- **FR-003**: As 5 vantagens e 7 restrições universais, compartilhadas pelos dois capítulos, consultáveis e usadas pelo montador.

**Escolas no personagem**

- **FR-004**: O personagem MUST ter as 15 escolas (0 a Level) e os derivados Martial Adept Level e Gunslinger Level (maior valor de cada tipo).
- **FR-005**: Compra no modo Evolução: 0 → 1 200 XP; depois 100 × valor atual; só se a escola estiver na lista de Sword Schools ou Gun Kata da classe atual (Free Study: classes concluídas); recusas com override do Mestre; histórico e desfazer da 006.
- **FR-006**: Passivas (Mastery do nível 4 e passivas dos Gun Kata) numéricas e sempre ativas MUST virar Active Effects desligáveis pelo Mestre ao atingir o nível; as condicionais ou narrativas ficam como texto.

**Montador**

- **FR-007**: O jogador MUST criar, editar e apagar Special Attacks e Trick Shots com nome, ação-base, vantagens (com quantidade) e restrições disponíveis pelos níveis das escolas.
- **FR-008**: O orçamento MUST seguir o livro: vantagens ≤ nível; acima, restrições ≥ excesso; vantagens ≤ 2 × nível; o nível é o Martial Adept Level (Special Attack) ou o Gunslinger Level (Trick Shot).
- **FR-009**: Custo 50 XP por ponto de vantagem (restrições não descontam); edição cobra os pontos acrescentados; histórico e desfazer da 006.

**Uso em combate**

- **FR-010**: Usar o ataque MUST conferir as restrições de uso (arma, cooldown, uma vez por cena, estado do alvo e do atacante) com override do Mestre, e gastar a ação-base pelo turno da 008.
- **FR-011**: O ataque MUST somar os modificadores de ataque, dano e Pen, aplicar a ação-base como na 008 e fazer o teste de perícia da restrição (falha = ataque falha).
- **FR-012**: O dano MUST somar as propriedades das vantagens às da arma; ao acertar, os efeitos simples (condições com rodadas, fadiga, efeitos no atacante) MUST ser aplicados; os demais aparecem como texto no cartão.
- **FR-013**: Ações de preparo (Aim, Feint, Ready, Aid Another) MUST deixar o ataque pronto para o ataque seguinte do personagem até o fim do próximo turno.

**Geral**

- **FR-014**: Textos de interface en e pt-BR; só o dono (e o Mestre) compra, monta e usa.

### Tabela de referência

| Escola | Tipo | Perícia | Arma / limite | Ação (nível 1) | Mastery / passivas |
|---|---|---|---|---|---|
| Desert Wind | Sword | Athletics | Syrneth | Multiple Attacks | Zephyr Dance |
| Devoted Spirit | Sword | Medicae | Flail | Aid Another | Ox Body (+4 HP) |
| Diamond Mind | Sword | Scrutiny | Fencing | Feint | Open Form Motion |
| Iron Heart | Sword | Perception | Ordinary | Aim | Mithril Blade |
| Setting Sun | Sword | Deceive | Brawl (Unarmed) | Fight Defensively | Wind Step |
| Shadow Hand | Sword | Stealth | Parrying | Ready | Sheathed Blade |
| Stone Dragon | Sword | Intimidate | Two Handed | Called Shot | Strength of Granite |
| Tiger Claw | Sword | Acrobatics | Chain | All Out Attack | Brutal Reserve |
| White Raven | Sword | Command | Cavalry | Charge | Marked Target |
| Clay Pigeon | Gun Kata | Performer | pistolas (falha 2) | Called Shot | Rescue Shot |
| Crisis Zone | Gun Kata | Tech Use | pesadas (falha 2) | Suppressing Fire | Bulging Biceps |
| Elemental Gearbolt | Gun Kata | Arcana | primitivas (falha 2) | Multiple Attacks | Warp Weapons |
| Point Blank | Gun Kata | Athletics | engajado (falha 2) | Full Auto Burst | Yippee Ki Yay, Barrel Roll, Full Frontal |
| Silent Scope | Gun Kata | Perception | alvo desprevenido (falha 2) | Aim | There Is No Wind, Leading the Target, One Bullet |
| Tin Star | Gun Kata | Scrutiny | metade do HP (falha 2) | Ready | Hair Trigger (+2 iniciativa), Reloading Kata, Dueling Technique |

Universais: First Damage Improvement 1* (+1k0 dano), Second Damage Mastery 3* (+0k1 dano), First Accuracy Improvement
1* (+1k0 ataque), Second Accuracy Mastery 2* (+0k1 ataque), Penetration Mastery 1* (+2 Pen); Difficult Strike −1,
Last Resort −2, Restrained Force −1*, Unbroken Skin −2*, Inaccurate −1*, Overextended −2*, Non-Penetrating −1.

### Key Entities *(include if feature involves data)*

- **Escola marcial**: dados do livro e entradas por nível com automação.
- **Escola no personagem**: valor 0–Level por escola.
- **Special Attack / Trick Shot**: nome, tipo, ação-base, vantagens (com quantidade), restrições, pontos, custo pago; estado de uso (última rodada, usado na cena, pronto).
- **Resultado do ataque especial**: teste de perícia, ataque, dano com propriedades, efeitos aplicados, texto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 15 escolas e das 135 entradas batem com o inventário (nível, tipo, custo, repetível).
- **SC-002**: Em 100% dos cenários da US3, o orçamento e o custo seguem a regra do livro (exemplos das pp. 261 e 273 fecham).
- **SC-003**: Usar um ataque salvo leva no máximo 2 interações além da escolha da arma.
- **SC-004**: 0 textos de interface sem tradução; 0 textos copiados do livro.

## Assumptions

- **Custo das escolas**: 200 para a primeira, 100 × valor atual depois, teto = Level (p. 16), igual para Sword Schools e Gun Kata.
- **Compra de ataques na criação**: o livro não proíbe; permitido com o XP disponível.
- **Trick Shots**: o livro não restringe a armas à distância; o montador permite qualquer arma que atenda as restrições, mas a ação-base e as vantagens de Gun Kata pensam em tiro.
- **"Até o próximo turno" / "uma rodada"**: pela duração da 008 (efeitos até o próximo turno do atacante ou rodadas no alvo).
- **Last Resort**: "uma vez por cena" é reiniciado pelo Mestre (ação de nova cena da ficha) ou pelo fim do combate.
- **Vantagens complexas** (teleporte, trilha de fogo, ataques extras, reações de aliados, drenar recursos, usar a arma do oponente): texto no cartão.
- **Passivas automatizadas**: Ox Body (+4 HP) e Hair Trigger (+2 iniciativa); Wind Step (raise livre na iniciativa) se a iniciativa da 008 aceitar o modificador; as demais como texto.

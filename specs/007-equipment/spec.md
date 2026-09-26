# Feature Specification: Equipamento, aquisição e artefatos (DtD 7.7a)

**Feature Branch**: `007-equipment`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Equipamento da DtD 7.7a, capítulo inteiro: compêndio de armas, armaduras, gear, cibernéticos, drogas e artefatos (materiais mágicos, Wonders e Hearthstones). Na ficha: inventário com itens equipados; armadura vestida dá AP e aplica Max Dex, com a penalidade de proficiência na Static Defense; arma equipada rola ataque (perícia + Level se proficiente) e dano XkY no chat, com as qualidades simples; sem aplicar dano no alvo (fica para a feature de combate). Aquisição completa: teste de Wealth contra o TN da raridade, qualidade, retry, Wealth Strain e Liquid Wealth; controle do equipamento inicial da criação."

**Referência de regras**: DtD **7.7a** — cap. XIII "Equipment", pp. 314–345 (disponibilidade e aquisição
pp. 314–317; armas pp. 318–331, qualidades pp. 319–321; armaduras pp. 332–333; gear pp. 334–335; cibernéticos
pp. 336–340; drogas e vício pp. 341–345); cap. XIV "Artifacts", pp. 346–356; ataque e dano no cap. XVII,
pp. 431–435; equipamento inicial p. 16; feats de proficiência pp. 180 e 197. Constituição v1.2.1.

**Depende de**: 001 (personagem, rolagem Roll & Keep e diálogo), 002 (raça, Size), 004 (Aura), 005 (feats
Weapon/Armor Proficiency, Weapon Focus/Specialization, modificadores), 006 (Level derivado).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar o equipamento no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Equipment** e encontra os 170 itens do livro em pastas: armas (por
grupo), armaduras, gear, cibernéticos, drogas e artefatos (materiais, Wonders, Hearthstones). Cada arma mostra
tipo, grupo, proficiência, dano e tipo de dano, Pen, ROF, alcance, clip, reload, raridade e qualidades; cada
armadura mostra tipo, AP, Max Dex e raridade (traje e peça avulsa); gear, cibernéticos e drogas mostram
raridade e efeito; drogas mostram a Addictivity. As 36 qualidades de arma têm descrição consultável.

**Why this priority**: é a base do inventário, da rolagem e da aquisição; utilizável sozinha para consulta.

**Independent Test**: abrir o compêndio e conferir as pastas e os itens Autopistol, Club, Brass Knuckles,
Carapace e Medkit contra a Tabela de referência.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Equipment", **Then** há 73 armas (28 armas de fogo, 17 outras à distância e granadas, 28 corpo a corpo), 10 armaduras, 18 gears, 16 cibernéticos, 16 drogas e 37 artefatos (5 materiais, 16 Wonders, 16 Hearthstones).
2. **Given** a arma "Autopistol", **When** aberta, **Then** mostra Pistol, grupo Ordinary, proficiência Basic ou Ranged 1, 2k2 I, Pen 0, ROF S/6, 30 m, clip 12, reload Full, raridade Common.
3. **Given** a armadura "Carapace", **When** aberta, **Then** mostra Heavy, AP 7, Max Dex 4, traje Uncommon e peça avulsa Common.
4. **Given** uma arma com qualidades, **When** o usuário passa o mouse numa qualidade, **Then** vê a descrição resumida dela.
5. **Given** o idioma em pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Inventário, armadura vestida e armas equipadas (Priority: P2)

O jogador arrasta itens para a ficha; eles aparecem numa aba **Equipamento**, agrupados por tipo, com
quantidade, qualidade (Poor, Common, Good, Best) e a marca de equipado/vestido. A armadura vestida dá AP por
localização (Head, Body com Gizzards, Arms, Legs): o maior AP cobrindo cada localização vale, sem somar. Se o
personagem não tem Armor Proficiency do tipo, a Static Defense perde o AP da armadura; com o feat, Light e
Medium não perdem nada e Heavy, Extreme e Power perdem metade. O Max Dex limita a Destreza usada na Speed e na
esquiva. Power Armor dá +1 Strength e +1 Resilience e mais −2 de Static Defense. Cibernéticos instalados e
drogas em efeito aplicam os modificadores simples do livro.

**Why this priority**: o que o personagem veste e carrega muda os valores da ficha e alimenta a rolagem (P3).

**Independent Test**: personagem com Dex 3 e sem Armor Proficiency veste Carapace e conferir AP 7 em todas as
localizações, Static Defense −7 e Speed com Dex no máximo 4; comprar Armor Proficiency (Heavy) e conferir a
penalidade cair para −3; vestir Mesh por cima e ver o AP continuar 7.

**Acceptance Scenarios**:

1. **Given** um personagem, **When** arrasta Autopistol, Carapace e Medkit para a ficha, **Then** os três aparecem na aba Equipamento, cada um no seu grupo, com qualidade Common e quantidade 1.
2. **Given** Carapace vestida sem Armor Proficiency (Heavy), **When** a ficha é exibida, **Then** AP 7 em todas as localizações e Static Defense 7 abaixo da normal.
3. **Given** o mesmo personagem com Armor Proficiency (Heavy), **When** a ficha é exibida, **Then** a penalidade de Static Defense é 3 (metade de 7, arredondando para baixo).
4. **Given** Flak (Medium) vestida com Armor Proficiency (Medium), **When** a ficha é exibida, **Then** sem penalidade de Static Defense.
5. **Given** Dex 5 e Carapace (Max Dex 4), **When** a ficha é exibida, **Then** a Speed usa Dex 4 e a Static Defense continua usando Dex 5.
6. **Given** Power Armor vestida com Armor Proficiency (Power), **When** a ficha é exibida, **Then** AP 12, Strength +1, Resilience +1 e penalidade de Static Defense 6 + 2.
7. **Given** um capacete de Carapace (peça avulsa, Head) e Mesh (traje), **When** vestidos juntos, **Then** Head tem AP 7 e as outras localizações AP 4.
8. **Given** um Bionic Heart instalado, **When** a ficha é exibida, **Then** Gizzards tem +2 AP somados ao da armadura.
9. **Given** um item de qualidade Best, **When** equipado, **Then** os efeitos de qualidade do livro valem (armadura: +1 AP e Max Dex +1; arma corpo a corpo: +1k0 de dano e Proven (2)).

---

### User Story 3 - Rolar ataque e dano com a arma (Priority: P3)

Na aba Equipamento (e no modo Jogo), cada arma equipada mostra a parada de ataque e a de dano e rola com um
clique. O ataque usa a perícia da arma (Weaponry corpo a corpo, Ballistics à distância, Brawl desarmado e
armas com Brawling), rola e mantém dados iguais à perícia, sem característica, e soma +Level dados rolados
quando o personagem tem a Weapon Proficiency de um dos grupos aceitos pela arma. O diálogo de rolagem da 001
abre com o TN, os modificadores e as opções de alcance, mira e modo de tiro. O dano rola o XkY da arma, soma
Strength em dados rolados para corpo a corpo e arremesso e aplica as qualidades simples. O cartão no chat mostra
acerto, raises, localização (d10), dano total, tipo de dano e Pen, e avisa quando a arma emperra.

**Why this priority**: é o uso principal das armas; depende do inventário (P2).

**Independent Test**: personagem Level 2 com Ballistics 3 e Weapon Proficiency (Ranged 1) rola Autopistol e
conferir a parada 5k3; sem o feat, 3k3; rolar o dano e conferir 2k2 sem Strength; com Sword (corpo a corpo)
e Strength 3, conferir o dano com +3 dados rolados.

**Acceptance Scenarios**:

1. **Given** Level 2, Ballistics 3 e Weapon Proficiency (Ranged 1), **When** rola ataque com Autopistol, **Then** a parada é 5k3 (3k3 + 2k0).
2. **Given** o mesmo personagem sem o feat, **When** rola, **Then** a parada é 3k3.
3. **Given** Weapon Proficiency (Basic), **When** rola com Lasgun (Basic ou Ranged 2), **Then** conta como proficiente.
4. **Given** Strength 3, **When** rola o dano de uma arma corpo a corpo 1k2, **Then** rola 4k2; uma arma de fogo 2k2 rola 2k2.
5. **Given** Brass Knuckles (Brawling), **When** rola ataque, **Then** usa Brawl; o dano é 0k2 + Strength, sem somar o soco 0k1.
6. **Given** um personagem sem arma de punho, **When** usa o ataque desarmado padrão, **Then** usa Brawl e dano 0k1 + Strength.
7. **Given** uma arma Heavy sem Brace marcado, **When** rola, **Then** −3k1 e sem full auto; Basic usada com uma mão (sem Compact): −2k0.
8. **Given** alcance escolhido "point blank" ou "curto", **When** rola, **Then** +2k1 ou +1k0; mira meia ação +1k0, ação completa +2k1 (Accurate soma +1k0; Inaccurate não recebe bônus de mira).
9. **Given** full auto com ROF 6, **When** rola com 3 raises, **Then** o cartão indica 4 acertos e +1k0 de dano por acerto extra (Storm: +2k0).
10. **Given** Level 1, **When** o ataque mantém dois 1s, **Then** o cartão avisa que a arma emperrou (Unreliable conta também os 2; Reliable nunca emperra).
11. **Given** qualidades Defensive, Balanced, Unbalanced, Proven (n), Volatile, Tearing, Twin Linked, **When** rola, **Then** os efeitos numéricos se aplicam (ataque −2k0 com Defensive; Proven rerrola dados abaixo de n; Volatile explode em 9 e 10) e as demais aparecem como texto no cartão.
12. **Given** Weapon Focus ou Weapon Specialization escolhidos para o tipo da arma, **When** rola, **Then** +2k0 no ataque ou no dano.
13. **Given** uma arma Poor corpo a corpo, **When** rola o dano, **Then** −1k0; Good +1k0; ranged Poor ganha Unreliable e Good ganha Reliable.

---

### User Story 4 - Aquisição e equipamento inicial (Priority: P4)

O personagem tem **Wealth** (0 a 5) e **Liquid Wealth** (pontos avulsos dados pelo Mestre). No item (no
compêndio ou na ficha), o botão **Adquirir** abre um teste de Wealth: rola dados iguais ao Wealth contra o TN
da raridade (tabela de 12 degraus) ajustado pela qualidade (Poor −5, Good +5, Best +10), pela peça avulsa (um
degrau abaixo) e por tentativas anteriores (+5 cada). Depois da rolagem, o jogador pode gastar Liquid Wealth
(+1 por ponto). Se passar, o item vai para o inventário. Se o TN passar de Wealth × 5, o sistema rola o Wealth
Strain (1d10 + 1 a cada 5 acima, −1 nível por raise) e aplica a penalidade temporária ao Wealth até o fim da
próxima sessão; o Mestre encerra a penalidade. Na criação, o sistema controla o equipamento inicial: 1 Rare,
1 Uncommon, 2 Common e 2 Very Common, sem teste.

**Why this priority**: a mesa usa aquisição entre sessões; depende do compêndio e do inventário.

**Independent Test**: personagem com Wealth 3 adquire um Lasgun (Common, TN 10) e conferir a rolagem 3k3;
adquirir um Bolter (Very Rare, TN 25) e conferir o Wealth Strain (25 > 15: 1d10 + 2); gastar 2 Liquid
Wealth depois de uma falha por 1.

**Acceptance Scenarios**:

1. **Given** Wealth 3, **When** adquire um item Common, **Then** rola 3k3 contra TN 10; passando, o item entra no inventário.
2. **Given** a mesma busca falhada, **When** tenta de novo, **Then** o TN passa a 15.
3. **Given** um item Uncommon de qualidade Best, **When** adquire, **Then** TN 25.
4. **Given** Wealth 3 e um item de TN 25, **When** passa no teste com 1 raise, **Then** rola Wealth Strain 1d10 + 2 − 1 e aplica a penalidade da faixa (7–9: −1; 10: −3; 11+: −5).
5. **Given** Wealth efetivo reduzido por Strain, **When** o Mestre encerra a penalidade, **Then** o Wealth volta ao valor normal.
6. **Given** 2 pontos de Liquid Wealth e uma falha por 1, **When** o jogador gasta 1 ponto, **Then** o teste passa e sobra 1 ponto.
7. **Given** Wealth 0, **When** tenta adquirir, **Then** o sistema recusa (só itens Worthless); o Mestre pode dar o item mesmo assim.
8. **Given** a criação de personagem, **When** o jogador escolhe o equipamento inicial, **Then** a ficha mostra as vagas (1 Rare, 1 Uncommon, 2 Common, 2 Very Common) e recusa itens além delas; a qualidade conta pela raridade ajustada.

---

### User Story 5 - Drogas, cibernéticos e artefatos (Priority: P5)

O jogador usa uma dose de droga pela ficha: a quantidade diminui, os efeitos simples passam a valer pela
duração, e o sistema pede o teste de Willpower contra a Addictivity. A falha sobe o nível de vício (Minor,
Moderate, Major), cujas penalidades aparecem na ficha. Cibernéticos instalados aplicam os modificadores do livro
(Machinator Array, Cortex Implants, membros biônicos com +2 AP na localização); mechadendrites respeitam o
limite de Constitution. Armas, armaduras e biônicos podem ser feitos de um **material mágico** (Orichalcum,
Mithril, Darksteel, Wraithbone, Necrodermis): contam como Best, ganham o rating de artefato pela raridade e os
bônus numéricos do material; cada artefato tem um encaixe de **Hearthstone**, que só funciona encaixada.

**Why this priority**: conteúdo do capítulo com automação menor; depende do inventário e da rolagem.

**Independent Test**: usar Slaught e conferir Dex +1 na ficha e o pedido do teste de Willpower TN 15; falhar
e ver o vício Minor (−1k0); transformar uma Sword em Orichalcum e conferir +2k0 no ataque e no dano e rating
Artifact 2; encaixar a Stone of Healing e ver +1k1 em Medicae.

**Acceptance Scenarios**:

1. **Given** 10 doses de Slaught, **When** usa uma, **Then** sobram 9, Dex +1 enquanto durar e o sistema pede Willpower TN 15.
2. **Given** a falha no teste de vício, **When** a ficha é exibida, **Then** vício Minor com −1k0 em todas as rolagens; nova falha sobe para Moderate (dados não explodem).
3. **Given** um Machinator Array instalado, **When** a ficha é exibida, **Then** Strength +1, Dex −1 e Resilience +1.
4. **Given** Constitution 2, **When** instala a terceira mechadendrite, **Then** aviso do limite (o Mestre pode permitir).
5. **Given** uma Sword de Orichalcum, **When** rola, **Then** +2k0 no ataque e no dano e a ficha mostra Artifact 2.
6. **Given** um artefato com a Stone of Healing encaixada, **When** rola Medicae, **Then** +1k1; fora do encaixe, sem efeito.
7. **Given** um artefato com hearthstone, **When** tenta encaixar uma segunda, **Then** recusa (um encaixe).

---

### Edge Cases

- **Duas armaduras cobrindo a mesma localização**: vale o maior AP; a penalidade de Static Defense e o Max Dex usam a armadura de maior AP vestida (o livro não trata duas armaduras; uma de cada tipo por localização).
- **Penalidade de proficiência com AP ímpar** (Heavy/Extreme/Power): metade arredondada para baixo; o −2 extra da Power Armor não é dividido.
- **Squat** (feat racial da 005): com Armor Proficiency, sem penalidade; sem o feat, metade.
- **Arma sem perícia treinada**: ataque rola 0k0 → o sistema segue a regra de perícia sem treino da 001 (Weaponry e Ballistics são básicas).
- **Launchers com dano "varia com a munição"**: o dano vem da munição escolhida no item; sem munição, o botão de dano fica desabilitado com aviso.
- **Granadas (alcance S×3)**: alcance calculado como Strength × 3 metros.
- **Flame**: sem teste de ataque; o cartão pede o teste de Dex do alvo com TN 5 × Ballistics (Poor −5, Good/Best +5).
- **Wealth efetivo negativo por Strain**: tratado como 0.
- **Item Mythic Rare ou acima feito de material mágico**: o livro só define rating até Artifact 5; fica Artifact 5 com aviso.
- **Qualidades sem arma no livro** (Beam, Combiweapon, Homing, Incendiary, Orgone Array, Razor Sharp, Storm, Twin Linked): disponíveis para itens criados pelo Mestre.
- **Remover um item equipado**: efeitos e AP saem junto.
- **Usuário sem permissão de dono**: vê o inventário só como leitura; não rola nem adquire.

## Requirements *(mandatory)*

### Functional Requirements

**Dados e compêndio**

- **FR-001**: O sistema MUST oferecer os tipos de item **Arma**, **Armadura** e **Equipamento** (gear, cibernético, droga, material mágico, Wonder, Hearthstone), com nome, raridade, página, descrição resumida, quantidade, qualidade e estado (equipado/vestido/instalado).
- **FR-002**: A arma MUST ter tipo (Melee, Thrown, Pistol, Basic, Heavy), grupo, proficiências aceitas (Basic, Melee 1–3, Ranged 1–2, Throwing), dano XkY, tipo de dano (E, X, R, I), Pen, ROF (tiro único e full auto), alcance, clip, reload e qualidades com valor (ex.: Blast (3), Proven (2)).
- **FR-003**: A armadura MUST ter tipo (Light, Medium, Heavy, Extreme, Power), AP, Max Dex, raridade do traje, se é traje ou peça avulsa (e qual localização) e se só funciona como traje (Power).
- **FR-004**: O sistema MUST distribuir o compêndio "Equipment" com os 170 itens da Tabela de referência, em pastas por tipo e grupo; fonte versionada em texto; descrições com redação própria em inglês (constituição V).
- **FR-005**: As 36 qualidades de arma MUST ter nome, descrição resumida e, quando simples, a automação (FR-015).
- **FR-006**: Cada tipo de item MUST ter ficha própria para ver e editar seus campos; compêndio bloqueado é somente leitura.

**Inventário e armadura**

- **FR-007**: A ficha MUST ter uma aba Equipamento com os itens agrupados por tipo, quantidade, qualidade e a marca de equipado; arrastar item para a ficha adiciona ao inventário (item repetido de mesma qualidade soma a quantidade).
- **FR-008**: A ficha MUST mostrar o AP por localização (Head, Body, Gizzards, Arms, Legs) a partir das armaduras vestidas: o maior AP por localização, sem somar; bônus que o livro diz que somam (Bionic Heart, Hearthstone Bracers) somam.
- **FR-009**: Armadura vestida sem a Armor Proficiency do tipo MUST reduzir a Static Defense pelo AP; com o feat, Light/Medium sem penalidade e Heavy/Extreme/Power pela metade; Power Armor −2 a mais. A penalidade MUST aparecer na ficha com a origem.
- **FR-010**: O Max Dex da armadura vestida MUST limitar a Destreza usada na Speed e nos testes de esquiva, sem afetar a Static Defense.
- **FR-011**: Power Armor vestida MUST dar +1 Strength e +1 Resilience; peças de Power Armor avulsas não dão AP nem bônus.
- **FR-012**: Qualidade da armadura: Poor Max Dex −1; Good +1 AP (contra o primeiro ataque da rodada, como texto); Best +1 AP e Max Dex +1.
- **FR-013**: Efeitos simples de equipamento MUST valer como modificadores desligáveis pelo Mestre enquanto o item estiver equipado/instalado/em efeito (Power Armor, Machinator Array, Cortex Implants, membros biônicos +2 AP, Bionic Heart, drogas com bônus de característica, Medkit como free raise em Medicae, hearthstones de bônus simples); os demais como texto.

**Ataque e dano**

- **FR-014**: Arma equipada MUST mostrar e rolar o ataque: perícia da arma k perícia, sem característica; +Level k0 se o personagem tem Weapon Proficiency de um dos grupos aceitos; pelo diálogo de rolagem da 001, com TN e modificadores.
- **FR-015**: O diálogo MUST oferecer, conforme a arma: alcance (point blank +2k1, curto +1k0, longo e extremo como raises exigidos), mira (meia +1k0, completa +2k1), modo de tiro (único, full auto +2k1), Brace (Heavy), uma mão (Basic −2k0 sem Compact) e aplicar as qualidades numéricas: Accurate, Inaccurate, Defensive (−2k0 no ataque; −2k0 em todos os ataques se não proficiente), Twin Linked, Storm, Scatter (texto), Brawling (usa Brawl).
- **FR-016**: O dano MUST rolar o XkY da arma, + Strength k0 para Melee e Thrown (exceto explosivos), + qualidade (Poor −1k0, Good +1k0 corpo a corpo), + Weapon Specialization; Proven (n) rerrola dados abaixo de n; Volatile explode em 9 e 10; full auto soma +1k0 (Storm +2k0) por acerto extra.
- **FR-017**: O cartão do chat MUST mostrar acerto/erro, raises, localização (d10 conforme a tabela), dano total, tipo e Pen, e as qualidades em texto; e avisar emperramento quando os 1s mantidos passam do Level (Unreliable conta 2s; Reliable nunca).
- **FR-018**: O personagem MUST ter um ataque desarmado padrão (Brawl, 0k1 + Strength); armas com Brawling o substituem.
- **FR-019**: Aplicar o dano no alvo, localização contra AP do alvo e críticos ficam fora desta feature; o cartão MUST trazer os dados para a feature de combate.

**Aquisição**

- **FR-020**: O personagem MUST ter Wealth (0–5, editável) e Liquid Wealth (pontos, editáveis pelo Mestre).
- **FR-021**: O teste de aquisição MUST rolar Wealth k Wealth contra o TN: raridade (Worthless 0 · Ubiquitous 2 · Very Common 5 · Common 10 · Uncommon 15 · Rare 20 · Very Rare 25 · Mythic Rare 30 · Near Unique 35 · Fabulous Max 40 · Irrationally Expensive 45 · Glittergold 50), −1 degrau para peça avulsa, qualidade (Poor −5, Good +5, Best +10) e +5 por tentativa anterior do mesmo item; mostrar também o tempo de busca da tabela.
- **FR-022**: Depois da rolagem, o jogador MUST poder gastar Liquid Wealth (+1 por ponto, consumido).
- **FR-023**: Passando, o item MUST entrar no inventário com a qualidade escolhida; se o TN passa de Wealth × 5, o sistema MUST rolar Wealth Strain (1d10 + 1 por 5 acima − 1 por raise) e aplicar a penalidade (7–9: −1; 10: −3; 11+: −5) ao Wealth até o Mestre encerrá-la.
- **FR-024**: Na criação, o sistema MUST controlar o equipamento inicial (1 Rare, 1 Uncommon, 2 Common, 2 Very Common, pela raridade ajustada pela qualidade), sem teste; o Mestre pode liberar vagas.

**Drogas, cibernéticos, artefatos**

- **FR-025**: Drogas MUST ter doses, Addictivity (None 0, Low 10, Moderate 15, High 20, Extreme 25) e efeito; usar uma dose MUST consumir 1, ativar os efeitos simples e pedir o teste de Willpower contra a Addictivity.
- **FR-026**: O personagem MUST ter nível de vício por droga (nenhum, Minor, Moderate, Major) com as penalidades acumuladas (Minor −1k0 em todas as rolagens; Moderate dados não explodem; Major −2k2 no total), editável pelo Mestre.
- **FR-027**: Cibernéticos MUST poder ser marcados como instalados; mechadendrites instaladas acima da Constitution MUST gerar aviso (override do Mestre).
- **FR-028**: Arma, armadura e biônico MUST poder ter material mágico; com material, contam como Best, mostram o rating de artefato (raridade base: VCom 1, Com 2, UnCom 3, Rare 4, VRare 5; munição especial e armadura primitiva um degrau abaixo) e aplicam os bônus numéricos do material; os demais como texto.
- **FR-029**: Cada artefato (item com material e Wonders com encaixe) MUST ter um encaixe de Hearthstone; a hearthstone encaixada aplica seus efeitos simples; fora do encaixe, nenhum.

**Geral**

- **FR-030**: Todo texto de interface MUST ter tradução en e pt-BR; só o dono (e o Mestre) rola, equipa, adquire e usa doses.

### Tabela de referência (contagens do inventário do livro)

| Categoria | Itens |
|---|---|
| Armas de fogo | 28 — Ordinary 8, Las 5, Plasma 2, Melta 2, Bolter 3, Syrneth 2, Exotic 4, Flamer 2 |
| Outras à distância | 17 — Primitive 6, Launchers 2, Grenades and Missiles 9 |
| Corpo a corpo | 28 — Ordinary 4, Parrying 3, Cavalry 3, Flail 3, Fencing 3, Two Handed 3, Syrneth 3, Chain 2, Shields 1, Unarmed 3 |
| Armaduras | 10 — Mesh, Flak, Carapace, Storm Carapace, Light Power, Power Armor, Leather, Chain, Banded, Plate |
| Gear | 18 |
| Cibernéticos | 16 (inclui 5 mechadendrites) |
| Drogas | 16 |
| Artefatos | 37 — 5 materiais, 16 Wonders, 16 Hearthstones |
| Qualidades de arma | 36 (dado de configuração, não item) |

### Key Entities *(include if feature involves data)*

- **Arma**: perfil de ataque e dano, grupo e proficiências aceitas, qualidades; no personagem, qualidade, equipada, material e hearthstone.
- **Armadura**: tipo, AP, Max Dex, traje ou peça (localização); no personagem, vestida, qualidade, material.
- **Equipamento**: gear, cibernético (instalado), droga (doses, Addictivity, em efeito), material mágico, Wonder, Hearthstone (encaixada em).
- **Qualidade de arma**: nome, valor opcional, descrição, automação.
- **Wealth do personagem**: Wealth, Liquid Wealth, Strain ativo, tentativas por item, vagas de equipamento inicial.
- **Vício**: droga e nível.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 170 itens têm os campos da Tabela de referência iguais ao inventário do livro (conferência automática).
- **SC-002**: Em 100% dos cenários da US2, AP, penalidade de Static Defense e Speed batem com o cálculo esperado.
- **SC-003**: Em 100% dos cenários da US3, a parada de ataque e a de dano batem com as regras (perícia k perícia + Level, Strength, qualidades).
- **SC-004**: Um jogador rola o ataque de uma arma equipada em no máximo 2 interações (clique, confirmar o diálogo).
- **SC-005**: Em 100% dos cenários da US4, TN, Liquid Wealth e Wealth Strain dão o resultado esperado.
- **SC-006**: 0 textos de interface sem tradução; 0 descrições copiadas do livro.

## Assumptions

- **Fora de escopo**: aplicar dano no alvo, localização contra o AP do alvo, críticos, ações de combate além das opções do diálogo (feature de combate); criação de armas do Mestre (pp. 516–519); veículos e naves; backgrounds completos (só o Wealth entra, como campo do personagem); munição especial como item separado (o livro trata munição como abstrata; munição especial de artefato fica como texto).
- **Teste de Wealth**: "rolar dados iguais ao Wealth" é lido como Wealth k Wealth, sem característica.
- **Raridades desalinhadas no texto extraído** (armas de fogo, gear, cibernéticos, drogas): conferir contra o PDF na implementação; onde o livro dá exemplos (autogun Uncommon, laspistol Common, multikey Rare), eles valem.
- **Mira de ação completa**: +2k1 (texto da ação); a tabela-resumo diz +2k0.
- **Exotic**: grupo Ranged 1 pela tabela, apesar do texto sugerir proficiência própria.
- **Sem proficiência de arma**: sem penalidade geral (só não soma o Level), exceto Defensive e Flame.
- **Armadura**: o livro não traz AP por localização, penalidade de perícia, peso nem preço; peça avulsa tem o mesmo AP e Max Dex do traje; "Light Power" segue a regra da Power Armor (só traje).
- **Duração das drogas**: guardada como texto; o jogador encerra o efeito na ficha.
- **Nomes**: usar os das tabelas, com os das descrições como alternativos (Web Pistol / Hand Webber, Electro-Flail, Chainaxe, Frenzon).
- **Emperramento**: conferido nos dados mantidos do teste de ataque, como diz o texto.
- **Equipamento inicial**: aplicado enquanto o personagem está marcado "em criação" (o Mestre desliga); sem modo formal de criação.

# Feature Specification: Classes e compra de XP (DtD 7.7a)

**Feature Branch**: `006-classes-xp`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "Classes da DtD 7.7a (cap. 6): compêndio com as 103 classes; classe atual e concluídas no personagem, com pré-requisitos, Level derivado das classes, progresso dos feats obrigatórios e bônus de conclusão (simples automatizados, feats concedidos pelo sistema da 005, demais como texto); Magic/Sword Schools guardadas como dado. Controle de XP: saldo, compra de avanços (característica, perícia, feat, Power Stat) com os custos do livro, restrita às listas da classe, com Free Study a custo dobrado."

**Referência de regras**: DtD **7.7a** — cap. 6 "Classes", pp. 104–172 (lista de classes iniciais p. 105; Free Study
e procedimento de avanço p. 106; trilhas pp. 107–110; classes pp. 111–172, com a legenda "feats opcionais
marcados com *, escolhas marcadas com OR" em cada página); tabela de custos de XP no cap. 2, pp. 15–16
(repetida no cap. 14); regras de Assets e Hindrances p. 179. Constituição v1.2.1.

**Depende de**: 001 (personagem, características, perícias, especialidades, modos da ficha), 002 (raça),
004 (exaltação, Power Stat), 005 (feats, assets, hindrances, concessões de feats, modificadores).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar as classes no compêndio (Priority: P1)

O Mestre ou um jogador abre o compêndio **Classes** e encontra as 103 classes do livro, em pastas por trilha
(18 trilhas de 5 classes, do Level 1 ao 5) mais uma pasta de classes avulsas (as 5 classes iniciais e as 8
classes de tripulação de nave). Cada classe mostra Level, trilha, pré-requisitos, características e perícias
da lista, os feats (obrigatórios, opcionais e escolhas "A ou B"), as Magic e Sword Schools oferecidas e o
bônus de conclusão.

**Why this priority**: é a base da criação e da progressão de personagem; utilizável sozinha para consulta.

**Independent Test**: abrir o compêndio e conferir as pastas (18 trilhas × 5 + avulsas 13 = 103) e as classes
Initiate, Swordsman e Fighter comparando com a Tabela de referência.

**Acceptance Scenarios**:

1. **Given** um mundo DtD, **When** o usuário abre o compêndio "Classes", **Then** há 103 classes: 23 de Level 1, 21 de Level 2, 22 de Level 3, 19 de Level 4 e 18 de Level 5, em 19 pastas.
2. **Given** a classe "Swordsman", **When** aberta, **Then** mostra Level 1, trilha Fighter, p. 135, pré-requisitos Weaponry 2 e Athletics 1, características Strength, Dexterity e Constitution, 8 perícias, feats obrigatórios Quick Draw, Hardy, Fast Reflexes e Power Attack, opcionais Armor Proficiency (à escolha) e Weapon Proficiency (à escolha), Sword Schools Iron Heart, Diamond Mind, White Raven e Stone Dragon, e o bônus "+1 em todos os testes de ataque corpo a corpo".
3. **Given** uma classe com escolha "A ou B", **When** aberta, **Then** a escolha aparece agrupada e indica se é obrigatória ou opcional.
4. **Given** o idioma em pt-BR, **When** a ficha é aberta, **Then** rótulos em português e conteúdo em inglês.

---

### User Story 2 - Classes no personagem (Priority: P2)

O jogador arrasta uma classe para a ficha. O sistema confere se ela pode ser iniciada (Level da classe no
máximo o Level do personagem + 1; pré-requisitos de perícias e feats; a classe atual precisa estar concluída).
A classe vira a **classe atual**. A aba de classes mostra o progresso: quais feats da lista o personagem já
tem, quais obrigatórios faltam e quais escolhas "A ou B" estão pendentes. Quando todos os obrigatórios
estão comprados, a classe é **concluída**: o bônus de conclusão passa a valer e o personagem entra em Free
Study até iniciar a próxima classe. O **Level** do personagem passa a ser o da classe de maior Level.

**Why this priority**: a classe define onde se pode gastar XP (US3) e o Level que alimenta derivados,
exaltação e escolas; depende do compêndio (P1).

**Independent Test**: num personagem novo com Weaponry 2 e Athletics 1, arrastar Swordsman; comprar os 4
feats obrigatórios e conferir a conclusão, o bônus e o Level 1; tentar arrastar Fighter (Level 4) e ver a
recusa por Level; arrastar Myrmidon (Level 2) com os pré-requisitos e ver o Level passar a 2.

**Acceptance Scenarios**:

1. **Given** um personagem sem classe com Weaponry 2 e Athletics 1, **When** arrasta Swordsman, **Then** Swordsman vira a classe atual e o Level do personagem é 1.
2. **Given** um personagem com Weaponry 1, **When** arrasta Swordsman, **Then** o sistema recusa listando o pré-requisito que falta (Weaponry 2); o Mestre pode iniciar a classe mesmo assim.
3. **Given** um personagem de Level 1, **When** arrasta uma classe de Level 3, **Then** recusa (máximo Level + 1).
4. **Given** Swordsman atual com 2 dos 4 feats obrigatórios, **When** a aba de classes é exibida, **Then** mostra "2 / 4 obrigatórios", os que faltam e os opcionais da lista.
5. **Given** Swordsman atual incompleta, **When** o jogador arrasta outra classe, **Then** recusa ("conclua a classe atual antes": todos os feats obrigatórios — p. 106).
6. **Given** o último feat obrigatório comprado, **When** a classe fica completa, **Then** ela é marcada como concluída, o bônus de conclusão é aplicado (pedindo a escolha quando houver) e a ficha indica Free Study.
7. **Given** Swordsman concluída e Myrmidon (Level 2) iniciada, **When** a ficha é exibida, **Then** o Level é 2, Swordsman aparece em "classes concluídas" e o bônus dela continua valendo.
8. **Given** uma classe com escolha "A ou B" obrigatória, **When** o personagem tem A, **Then** a escolha conta como cumprida e B deixa de ser oferecido por essa classe.
9. **Given** um personagem sem nenhuma classe, **When** a ficha é exibida, **Then** o Level continua editável à mão (comportamento atual); com classe, passa a ser calculado.
10. **Given** uma classe concluída, **When** o Mestre a remove ou marca como não concluída, **Then** o bônus e os feats concedidos por ela saem.

---

### User Story 3 - Saldo e compra de XP (Priority: P3)

A ficha mostra o XP do personagem: total recebido (600 iniciais + prêmios do Mestre + 100 por hindrance),
gasto e disponível, e um histórico das compras. Num **modo de avanço**, cada característica, perícia e o
Power Stat mostram o custo do próximo ponto; comprar debita o XP e registra no histórico. Feats e assets
arrastados cobram 100 XP. O que se pode comprar segue a classe atual; em Free Study, as listas das classes
concluídas; fora das listas, características e perícias custam o dobro.

**Why this priority**: fecha o ciclo de progressão do livro; depende da classe no personagem (P2).

**Independent Test**: com 600 XP e Swordsman atual, comprar +1 Strength (200), Weaponry 2→3 (50), Stealth 0→1
fora da lista (recusado na classe; permitido em Free Study por 200), um feat da lista (100) e o Power Stat
(300); conferir saldo e histórico; desfazer a última compra.

**Acceptance Scenarios**:

1. **Given** um personagem novo, **When** a ficha é exibida, **Then** XP total 600, gasto 0, disponível 600; **When** recebe um hindrance, **Then** total 700.
2. **Given** Swordsman atual e 600 XP, **When** o jogador compra +1 Strength no modo de avanço, **Then** Strength sobe 1, gasto 200 e o histórico registra "Strength 2 → 3, 200 XP".
3. **Given** Swordsman atual, **When** compra Weaponry 2 → 3, **Then** custa 50; **When** compra uma perícia nova (0 → 1) da lista, **Then** custa 100.
4. **Given** Swordsman atual (Stealth fora da lista), **When** tenta comprar Stealth, **Then** recusa ("fora da lista da classe"); **Given** Free Study, **When** compra Stealth 0 → 1, **Then** custa 200 (o dobro — p. 106).
5. **Given** Swordsman atual, **When** arrasta Power Attack (da lista), **Then** o sistema cobra 100 XP; **When** arrasta um feat fora das listas, **Then** recusa (o Mestre pode incluir, sem cobrar); **When** arrasta um feat racial da própria raça, **Then** cobra 100 (feats raciais valem como da lista — p. 179).
6. **Given** uma exaltação, **When** compra +1 no Power Stat, **Then** custa 300 e respeita o teto (Level).
7. **Given** XP disponível menor que o custo, **When** tenta comprar, **Then** recusa com aviso de saldo.
8. **Given** um histórico com compras, **When** o dono desfaz a última, **Then** o valor volta, o XP é devolvido e a entrada sai do histórico.
9. **Given** o Mestre, **When** concede XP (ex.: +150 com o motivo "Sessão 3"), **Then** o total sobe e o prêmio aparece no histórico.
10. **Given** o modo de edição livre (atual), **When** o jogador ou Mestre clica nos pontos, **Then** nada é cobrado (a distribuição inicial por prioridade e ajustes do Mestre continuam livres).

---

### Edge Cases

- **Classe arrastada para ator que não é Personagem**: recusada.
- **Mesma classe duas vezes**: recusada (uma classe só é feita uma vez).
- **Feat da lista já possuído** (ex.: concedido por raça): conta para a conclusão e não é cobrado de novo (p. 106).
- **Feat de grupo na lista com subcategoria fixa** (ex.: Peer (Religious Organization)): a compra pela lista já vem com a subcategoria; "(Any)" pede a escolha.
- **Escolha "A ou B" marcada com `*`**: tratada como opcional (as duas alternativas).
- **Pré-requisitos de escola** (ex.: "any Magic at rank 3"): não podem ser conferidos ainda; aparecem como aviso para o Mestre confirmar.
- **Bônus de conclusão idênticos na mesma trilha** (ex.: Cleric +1 HP em cada classe): acumulam, um por classe concluída.
- **Druid track** (mesmos feats concedidos em todas as classes): concedidos uma vez, com cada classe como origem (sistema da 005).
- **Level do personagem abaixo do de uma classe já feita** (edição manual do Mestre): o calculado prevalece enquanto houver classes.
- **Compra que levaria característica ou perícia acima de 6**: recusada.
- **Desfazer compra de feat**: remove o feat (e o que ele concedeu) e devolve os 100 XP.
- **Hindrance removido depois de gasto o XP**: o disponível pode ficar negativo; a ficha avisa, sem desfazer compras sozinha.
- **Usuário sem permissão de dono**: vê classes e XP só como leitura; conceder XP é só do Mestre.

## Requirements *(mandatory)*

### Functional Requirements

**Classe (dados e compêndio)**

- **FR-001**: O sistema MUST oferecer um tipo de item "Classe" com: nome, Level (1–5), trilha, página, pré-requisitos (perícias com valor mínimo, feats, escolas, texto livre), características da lista (ou "qualquer uma"), perícias da lista, feats da lista (nome, subcategoria, obrigatório/opcional, grupo "A ou B"), Magic Schools, Sword Schools, bônus de conclusão (texto, tipo de automação e dados) e descrição resumida.
- **FR-002**: O sistema MUST distribuir o compêndio "Classes" com as 103 classes do cap. 6 conforme a Tabela de referência, em pastas por trilha e uma de classes avulsas; fonte versionada em texto e descrições com redação própria em inglês (constituição V).
- **FR-003**: A classe MUST ter ficha própria para ver e editar os campos do FR-001; compêndio bloqueado é somente leitura.

**Classe no personagem**

- **FR-004**: Arrastar uma classe para um Personagem MUST conferir: Level da classe ≤ Level do personagem + 1; pré-requisitos de perícia (valor final) e de feat (pelo nome, sem diferenciar maiúsculas); classe atual concluída; classe ainda não feita. Falha → recusa com a lista do que falta; o Mestre pode iniciar mesmo assim. Pré-requisitos de escola e texto livre MUST aparecer como aviso a confirmar.
- **FR-005**: O personagem MUST ter no máximo uma classe atual; as anteriores ficam como concluídas.
- **FR-006**: O Level do personagem MUST ser o maior Level entre suas classes; sem classes, o Level continua editável.
- **FR-007**: A ficha MUST mostrar, para a classe atual, os feats da lista com o estado (tem / falta), o progresso dos obrigatórios (n / total, contando cada grupo "A ou B" obrigatório como um) e as características, perícias e escolas da lista.
- **FR-008**: Quando todos os obrigatórios da classe atual estão cumpridos, a classe MUST ser marcada como concluída e o personagem entra em Free Study até iniciar outra classe.
- **FR-009**: Bônus de conclusão automatizados (valem enquanto a classe estiver concluída, desligáveis pelo Mestre):
  - HP máximo +2 (Mercenary, Ratcatcher) e +1 (trilhas Cleric e Heavy);
  - iniciativa +1 (trilha Assassin); Resolve +1 (trilha Courtier); Static Defense +1 (trilha Thief);
  - uma especialidade à escolha em qualquer perícia (Initiate, Scholar) ou numa perícia Social (Captain, Commodore);
  - +1 numa perícia à escolha cujo valor seja menor que o Level (trilha Bard);
  - feats concedidos: Improved Animal Companion e Beastmaster (trilha Druid); Upgraded (Rare) em Mech-Wright e Enginseer, (Very Rare) em Tech-Priest, (Mythic Rare) em Technomancer, (Artifact) em Magos.
- **FR-010**: Os demais bônus (ataque e dano corpo a corpo/à distância, Focus Power, armadura condicional, usos de Elemental Shot, Backing, bônus de nave) MUST aparecer como texto.
- **FR-011**: Remover uma classe ou desfazer a conclusão MUST tirar seu bônus e os feats concedidos por ela.

**XP**

- **FR-012**: O personagem MUST ter XP total = XP inicial (600, editável pelo Mestre) + prêmios concedidos pelo Mestre + XP dos hindrances (100 cada); gasto = soma das compras do histórico; disponível = total − gasto.
- **FR-013**: A ficha MUST ter um modo de avanço em que características, perícias e Power Stat mostram o custo do próximo ponto e um botão de compra. Custos (pp. 15–16): característica +1: 200; perícia nova (0 → 1): 100; melhorar perícia: 50; feat: 100; asset: 100; Power Stat +1: 300.
- **FR-014**: Compras MUST seguir as listas: na classe atual, só características e perícias dela; em Free Study, as das classes concluídas; características e perícias fora das listas custam o dobro em Free Study e são recusadas durante uma classe (o Mestre pode autorizar). Feats: os da lista da classe atual, os opcionais das classes concluídas (em Free Study) e os feats raciais da própria raça; os demais são recusados (o Mestre pode incluir sem cobrança). Power Stat: sempre, até o teto.
- **FR-015**: Toda compra MUST registrar no histórico: tipo, alvo, de → para, custo, data e quem comprou. Compras com saldo insuficiente MUST ser recusadas.
- **FR-016**: O dono MUST poder desfazer a última compra (restaura o valor e devolve o XP); o Mestre MUST poder conceder XP com motivo (entra no histórico) e desfazer qualquer entrada.
- **FR-017**: O modo de edição livre MUST continuar sem cobrança (distribuição inicial e ajustes do Mestre).
- **FR-018**: Adicionar um feat ou asset fora do modo de avanço (arrastar) MUST cobrar 100 XP quando a compra é permitida pela FR-014; feats concedidos (raça, exaltação, asset, classe) nunca são cobrados.

**Geral**

- **FR-019**: Todo texto de interface novo MUST existir em pt-BR e inglês.
- **FR-020**: Qualquer dono pode iniciar classes, comprar e desfazer; observadores só leem; conceder XP é do Mestre.

### Tabela de referência (DtD 7.7a, cap. 6)

| Grupo | Classes (Level 1 → 5) |
|---|---|
| Assassin | Sell-Steel, Nighthawk, Assassin, Freeblade, Nihilator |
| Arcane Knight | Spellsword, Swordmage, Runeblade, Arcane Knight, Sorcerer-Swordsman |
| Barbarian | Feral, Savage, Rager, Barbarian, Berserker |
| Bard | Minstrel, Bard, Skald, Swashbuckler, Master Bard |
| Cleric | Priest, Preacher, Cleric, Zealot, Bishop |
| Courtier | Negotiator, Courtier, Diplomat, Legate, Emissary |
| Druid | Ovate, Oak-Knower, Druid, Archdruid, Patriarch |
| Fighter | Swordsman, Myrmidon, Fight Guy, Fighter, Master Fight Guy |
| Guardsman | Conscript, Guardsman, Sergeant, Grenadier, Stormtrooper |
| Heavy | Big Shot, Krazy Ivan, Heavy Weapons Guy, Walking Gunshow, Living Fortress |
| Magic User | Apprentice, Aspirant, Magic User, Sorcerer, Master Sorcerer |
| Magitek Gunman | Spellshooter, Riflemancer, Gunmage, Bulletwizard, Witch-Sniper |
| Monk | Brother, Disciple, Monk, Immaculate Master, Grand Master of Flowers |
| Operator | Hunter, Marksman, Sniper, Quickscope, Targetmaster |
| Paladin | Gallant, Protector, Defender, Paladin, Chevalier |
| Sheriff | Deputy, Sheriff, Constable, Marshal, Judge |
| Techpriest | Mech-Wright, Enginseer, Tech-Priest, Technomancer, Magos |
| Thief | Outcast, Outlaw, Renegade, Rogue, Stubjack |
| Avulsas | Iniciais (Level 1, sem pré-requisitos): Initiate, Mercenary, Peasant, Ratcatcher, Scholar · Tripulação (pp. 168–172): Operations Officer, Science Officer, Tactical Officer (Level 2); Captain, Chief Arcana Officer, Chief of Engineering, Chief of Security (Level 3); Commodore (Level 4) |

Contagem por Level: 23 / 21 / 22 / 19 / 18 = 103. Páginas das classes: pp. 111–172.

**Legenda dos feats** (rodapé de cada página de classe): sem `*` = obrigatório; `*` = opcional; `OR` = escolha
entre alternativas. Na lista da p. 105, `*` marca as classes iniciais sem pré-requisitos (outro sentido).

**Custos de XP** (pp. 15–16): XP inicial 600 · característica +1: 200 · perícia nova: 100 · melhorar perícia: 50 ·
nova escola: 200 · melhorar escola: 100 × rank atual · feat (inclui raciais): 100 · asset: 100 (só criação) ·
Power Stat +1: 300 · backgrounds 50/100 por ponto (só criação) · hindrance: +100 (máx. 2).

### Key Entities *(include if feature involves data)*

- **Classe**: item de referência (Level, trilha, pré-requisitos, listas, feats obrigatórios/opcionais/escolhas, escolas, bônus); no personagem, com estado atual ou concluída.
- **Progresso da classe**: quais feats da lista o personagem tem e quais obrigatórios faltam (calculado).
- **Bônus de conclusão**: efeito da classe concluída (modificador, especialidade, +1 perícia, feats concedidos ou texto).
- **XP do personagem**: inicial, prêmios, histórico de compras; total, gasto e disponível calculados.
- **Entrada do histórico**: compra (tipo, alvo, de → para, custo) ou prêmio (valor, motivo), com data e autor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das 103 classes têm Level, trilha, pré-requisitos, listas, feats (obrigatório/opcional/escolha), escolas e bônus iguais ao inventário do livro (conferência automática).
- **SC-002**: 100% dos exemplos de custo da US3 debitam o valor esperado, e desfazer devolve exatamente o mesmo valor.
- **SC-003**: Em 100% das classes testadas, a conclusão acontece exatamente quando o último obrigatório é comprado (nem antes, nem depois).
- **SC-004**: O Level exibido é igual ao maior Level de classe em 100% dos casos com classe.
- **SC-005**: Um jogador compra um avanço em no máximo 2 interações (modo de avanço, clicar) e vê o saldo atualizado na hora.
- **SC-006**: 0 textos de interface sem tradução; 0 descrições copiadas do livro.

## Assumptions

- **Fora de escopo**: compra de escolas de magia e sword schools, magias, special attacks, backgrounds e Devotion (os sistemas não existem; o custo fica documentado); modo formal de criação de personagem (assets e hindrances seguem com o aviso da 005); automação dos bônus de ataque, dano, Focus Power, armadura e nave.
- Um grupo "A ou B" marcado com `*` é opcional por inteiro; sem `*`, conta como um obrigatório.
- O custo de característica e perícia é fixo por ponto (200 e 50), independente do valor atual, como a tabela do livro indica.
- Características e perícias compradas ficam limitadas a 6 (limite do sistema); o livro não define outro teto por compra.
- Free Study só dobra o custo de características e perícias fora das listas (o livro não diz se feats e escolas fora das listas podem ser comprados; tratados como recusados, com override do Mestre).
- Bônus de conclusão idênticos de classes diferentes da mesma trilha acumulam.
- O exemplo de Level da p. 106 (Swordsman + Fight Guy + Minstrel + Fighter = Level 3) contradiz a tabela (Fighter é Level 4); vale a regra "Level = maior Level de classe" e o Level da própria classe.
- Nomes de feats das listas são comparados sem diferenciar maiúsculas ("Fan the Hammer" = "Fan The Hammer"); typos do livro normalizados ("Craft" → Crafts, "Decieve" → Deceive).
- A trilha que a p. 105 chama de "Rogue" aparece como "Thief" no diagrama da p. 110; usamos Thief.
- Distribuição inicial de pontos (prioridades 6/4/2 e 8/6/4) continua no modo de edição livre, sem cobrança.
